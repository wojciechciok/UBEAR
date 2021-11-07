import random
import threading

from pathfinder import get_cars_in_patinece_range, get_shortest_path_for_passenger, get_path, manhattan_distance
from passenger import Passenger
import json
from json import JSONEncoder
import copy
from paths_collection import PathsCollection, ValidCarPaths

# random 0-10 ticks
PASSENGER_SPAWN_RANGE = 10
CAR_CAPACITY = 4
PASSENGER_WAITING_PATIENCE = 50
PASSENGER_DETOUR_TOLERANCE = 1.5


class EmployeeEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__


def get_passengers_and_cars_json(cache):
    return json.dumps({'passengers': list(cache['passengers'].values()), 'cars': cache['cars']}, cls=EmployeeEncoder)


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


def update(cache):
    cars = cache["cars"]
    passengers = cache["passengers"]

    if cache["ticks"] >= cache["maxTicks"]:
        return True

    for passenger in cache["passengers"].values():
        if passenger.is_in_car:
            passenger.traveled += 1
        else:
            passenger.waited_for_car += 1

    for car in cars:
        if len(car.passengers_list) > 0:
            for passenger_id in car.passengers_list:
                # we could potentially keep dictionary of passengers instead
                passenger = passengers[passenger_id]
                if car.x == passenger.x and car.y == passenger.y:
                    passenger.is_in_car = True
                if car.x == passenger.x_dest and car.y == passenger.y_dest and passenger.is_in_car:
                    car.passengers_list.remove(passenger.id)
                    cache["passengers"].pop(passenger.id, None)
        car.move()
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
                cars_in_range = get_cars_in_patinece_range(available_cars, passenger, cache["grid"],
                                                           PASSENGER_WAITING_PATIENCE,
                                                           cache["dynamic_paths_collection"])
                if len(cars_in_range) <= 0:
                    continue

                (x, y, x_dest, y_dest) = passenger.x, passenger.y, passenger.x_dest, passenger.y_dest
                passenger.shortest_path_length = len(
                    get_path(x, y, x_dest, y_dest, cache["grid"], cache["dynamic_paths_collection"]))

                # Schedule Computing Stage
                possible_paths = PathsCollection()

                threads = []
                for car in cars_in_range:
                    thread = threading.Thread(target=process_possible_paths_for_car,
                                              args=(car, possible_paths, cache, passenger))
                    threads.append(thread)
                    thread.start()

                for thread in threads:
                    thread.join()

                if possible_paths.has_car_paths():
                    (car, best_path) = possible_paths.get_best_car_path()
                    if car is not None and best_path is not None:
                        car.path = best_path
                        car.passengers_list.append(passenger.id)
                        passenger.car_id = car.id

    current_next_passenger_spawn = cache["next_passenger_spawn"]
    if current_next_passenger_spawn == 0:
        new_passenger = Passenger(cache["valid_positions"], cache["random"])
        cache["passengers"][new_passenger.id] = new_passenger
        cache["next_passenger_spawn"] = cache["random"].randrange(cache["min_pass_spawn"], cache["max_pass_spawn"])
    else:
        cache["next_passenger_spawn"] -= 1

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
    threads = []
    for combination in passengers_combinations:
        thread = threading.Thread(target=process_combination,
                                  args=(car, combination, cache, car_passengers, passenger, valid_car_paths,))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

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
            if distance > PASSENGER_WAITING_PATIENCE:
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
