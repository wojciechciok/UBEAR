import random
import threading
from pathfinder import get_cars_in_patience_range, get_shortest_path_for_passenger, get_path, manhattan_distance
from passenger import Passenger
import json
from json import JSONEncoder
from metrics import get_all_metrics
import copy
from paths_collection import PathsCollection, ValidCarPaths

# random 0-10 ticks
CAR_CAPACITY = 4
PASSENGER_DETOUR_TOLERANCE = 1.5
PASSENGER_TRIP_COST_PER_KM = 4.5
PASSENGER_INITIAL_FEE = 15
COMPANY_COST_PER_KM = 2


class EmployeeEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__


def get_passengers_and_cars_json(cache):
    return json.dumps({
        'passengers': list(cache['passengers'].values()),
        'cars': cache['cars'],
        'taxi_cars': cache['taxi_cars'],
        'taxi_passengers': list(cache['taxi_passengers'].values()),
        "metrics": get_all_metrics(cache)}
        , cls=EmployeeEncoder)


def combinations(p):
    possible_paths = []
    coordinates = []
    for passenger in p:
        if passenger.is_in_car:
            coordinates.append([[passenger.x_dest, passenger.y_dest]])
        else:
            coordinates.append([[passenger.x, passenger.y], [passenger.x_dest, passenger.y_dest]])

    def get_path_step(path, rest):
        if len(rest) <= 0:
            possible_paths.append(path)
            return
        for i in range(len(rest)):
            next_path = copy.deepcopy(path)
            next_rest = copy.deepcopy(rest)
            next_path.append(next_rest[i][0])
            if len(next_rest[i]) == 1:
                del next_rest[i]
            else:
                next_rest[i].pop(0)
            get_path_step(next_path, next_rest)

    get_path_step([], coordinates)
    return possible_paths


def is_point_passenger_starting_location(passengers, passenger, point):
    if passenger.x == point[0] and passenger.y == point[1]:
        return True
    for p in passengers:
        if p.x == point[0] and p.y == point[1]:
            return True
    return False


def is_point_passenger_destination_location(passengers, passenger, point):
    if passenger.x_dest == point[0] and passenger.y_dest == point[1]:
        return True, passenger
    for p in passengers:
        if p.x_dest == point[0] and p.y_dest == point[1]:
            return True, p
    return False, None


def move_cars(cars, passengers, served_passengers, is_ubear=True):
    for car in cars:
        if len(car.passengers_list) > 0:
            for passenger_id in car.passengers_list:
                # we could potentially keep dictionary of passengers instead
                passenger = passengers[passenger_id]
                if passenger.is_in_car:
                    if is_ubear:
                        if passenger.trip_cost < PASSENGER_INITIAL_FEE + passenger.shortest_path_length * PASSENGER_TRIP_COST_PER_KM:
                            passenger.trip_cost += PASSENGER_TRIP_COST_PER_KM / len([p for p in car.passengers_list if passengers[p].is_in_car == True])
                    elif not is_ubear:
                        passenger.trip_cost += PASSENGER_TRIP_COST_PER_KM
                if car.x == passenger.x and car.y == passenger.y:
                    passenger.is_in_car = True
                    passenger.trip_cost += PASSENGER_INITIAL_FEE
                if car.x == passenger.x_dest and car.y == passenger.y_dest and passenger.is_in_car:
                    car.passengers_list.remove(passenger.id)
                    if is_ubear:
                        passenger.cost_score = (PASSENGER_INITIAL_FEE + passenger.shortest_path_length * (PASSENGER_TRIP_COST_PER_KM / CAR_CAPACITY)) / passenger.trip_cost
                        passenger.time_score = passenger.shortest_path_length / (
                                    passenger.traveled + passenger.waited_for_car)
                    else:
                        passenger.time_score = passenger.traveled / passenger.traveled + passenger.waited_for_car
                    served_passengers.append(passengers.pop(passenger.id, None))

        car.move(COMPANY_COST_PER_KM)


def regular_update(cache):
    cars = cache["taxi_cars"]

    for passenger in cache["taxi_passengers"].values():
        if passenger.car_id is not None:
            pass  # cruisin in da hood
        else:
            non_occupied_cars = list(filter(lambda c: len(c.passengers_list) == 0, cars))
            if len(non_occupied_cars) <= 0:
                continue
            (shortest_path, car) = get_shortest_path_for_passenger(non_occupied_cars, passenger, cache["grid"],
                                                                   cache["dynamic_paths_collection"])
            car.path = shortest_path
            car.passengers_list.append(passenger.id)
            passenger.car_id = car.id


def car_pooling_update(cache):
    cars = cache["cars"]

    available_cars = [car for car in cars if len(car.passengers_list) < CAR_CAPACITY]
    if len(available_cars) > 0:
        for passenger in cache["passengers"].values():
            if passenger.car_id is not None:
                pass  # cruisin in da hood
            else:

                # Capacity filtering stage
                available_cars = [car for car in cars if len(car.passengers_list) < CAR_CAPACITY]
                if len(available_cars) <= 0:
                    break

                # Neighbouring filtering stage
                cars_in_range = get_cars_in_patience_range(available_cars, passenger, cache["grid"],
                                                           passenger.waiting_patience,
                                                           cache["dynamic_paths_collection"])
                if len(cars_in_range) <= 0:
                    continue

                (x, y, x_dest, y_dest) = passenger.x, passenger.y, passenger.x_dest, passenger.y_dest
                passenger.shortest_path_length = len(
                    get_path(x, y, x_dest, y_dest, cache["grid"], cache["dynamic_paths_collection"]))

                # Schedule Computing Stage
                possible_paths = PathsCollection()

                for car in cars_in_range:
                    process_possible_paths_for_car(car, possible_paths, cache, passenger)

                if possible_paths.has_car_paths():
                    (car, best_path) = possible_paths.get_best_car_path()
                    if car is not None and best_path is not None:
                        car.path = best_path
                        car.passengers_list.append(passenger.id)
                        passenger.car_id = car.id


def update(cache):
    cars = cache["cars"]
    taxi_cars = cache["taxi_cars"]
    passengers = cache["passengers"]
    taxi_passengers = cache["taxi_passengers"]

    if cache["ticks"] >= cache["maxTicks"]:
        return True

    for passenger in cache["passengers"].values():
        if passenger.is_in_car:
            passenger.traveled += 1
        else:
            passenger.waited_for_car += 1

    for passenger in cache["taxi_passengers"].values():
        if passenger.is_in_car:
            passenger.traveled += 1
        else:
            passenger.waited_for_car += 1
            passenger.waiting_patience += 1

    car_pooling_update(cache)
    regular_update(cache)

    move_cars(cars, passengers, cache["served_passengers"], is_ubear=True)
    move_cars(taxi_cars, taxi_passengers, cache["served_taxi_passengers"], is_ubear=False)

    # random passenger spawning
    current_next_passenger_spawn = cache["next_passenger_spawn"]
    if current_next_passenger_spawn == 0:
        new_passenger = Passenger(cache["valid_positions"], cache["random"], cache["passenger_waiting_patience"])
        new_taxi_passenger = copy.deepcopy(new_passenger)
        cache["passengers"][new_passenger.id] = new_passenger
        cache["taxi_passengers"][new_passenger.id] = new_taxi_passenger
        cache["next_passenger_spawn"] = cache["random"].randrange(cache["min_pass_spawn"], cache["max_pass_spawn"])
    else:
        cache["next_passenger_spawn"] -= 1

    # passenger spawning for hotspots in which all passengers are in the same location
    if cache["enable_hotspots"]:
        if cache["ticks"] == cache["update_num_loc_hotspot"]:
            for i in range(cache["pass_num_loc_hotspot"]):
                new_passenger = Passenger(cache["valid_positions"], cache["random"],
                                          cache["passenger_waiting_patience"], cache["hotspot_loc_x"],
                                          cache["hotspot_loc_y"])
                new_taxi_passenger = copy.deepcopy(new_passenger)
                cache["passengers"][new_passenger.id] = new_passenger
                cache["taxi_passengers"][new_passenger.id] = new_taxi_passenger

        # passenger spawning for hotspots in which all passengers go to the same location
        if cache["ticks"] == cache["update_num_dest_hotspot"]:
            for i in range(cache["pass_num_loc_hotspot"]):
                new_passenger = Passenger(cache["valid_positions"], cache["random"],
                                          cache["passenger_waiting_patience"], dest_x=cache["hotspot_loc_x"],
                                          dest_y=cache["hotspot_loc_y"])
                new_taxi_passenger = copy.deepcopy(new_passenger)
                cache["passengers"][new_passenger.id] = new_passenger
                cache["taxi_passengers"][new_passenger.id] = new_taxi_passenger

    cache["ticks"] = cache["ticks"] + 1
    return False


def process_possible_paths_for_car(car, possible_paths, cache, passenger):
    valid_car_paths = ValidCarPaths(car)

    passenger_ids = car.passengers_list
    car_passengers = [p for p in cache["passengers"].values() if
                      p.id in passenger_ids]
    car_passengers.append(passenger)
    passengers_combinations = combinations(car_passengers)

    # Time Limit filtering stage
    for combination in passengers_combinations:
        process_combination(car, combination, cache, car_passengers, passenger, valid_car_paths)

    if valid_car_paths.has_paths():
        possible_paths.add_car_paths(valid_car_paths)


def process_combination(car, combination, cache, car_passengers, passenger, valid_car_paths):
    is_possible_path = True
    distance = 0
    passenger_destination_time = None
    path = []
    (xTmp, yTmp) = car.x, car.y
    for point in combination:
        if point[0] == xTmp and point[1] == yTmp:
            continue
        section = copy.deepcopy(get_path(xTmp, yTmp, point[0], point[1], cache["grid"],
                                         cache["dynamic_paths_collection"]))
        section.pop(0)
        distance += len(section)
        path.extend(section)

        if is_point_passenger_starting_location(car_passengers, passenger, point):
            if distance > passenger.waiting_patience:
                is_possible_path = False
                break

        # Detour Distance Computing Stage
        destination, dest_passenger = is_point_passenger_destination_location(car_passengers, passenger, point)
        if destination:
            if (distance + dest_passenger.traveled) > (
                    dest_passenger.shortest_path_length * PASSENGER_DETOUR_TOLERANCE) and dest_passenger.is_in_car:
                is_possible_path = False
                break

            if dest_passenger.id == passenger.id:
                passenger_destination_time = distance

        (xTmp, yTmp) = point[0], point[1]

    if is_possible_path:
        valid_car_paths.add_path(path, passenger_destination_time)
