import random
from pathfinder import get_shortest_path_for_passenger
from passenger import Passenger
import json
from json import JSONEncoder

# random 0-10 ticks
PASSENGER_SPAWN_RANGE = 10

class EmployeeEncoder(JSONEncoder):
        def default(self, o):
            return o.__dict__

def get_passengers_and_cars_json(cache):
    return json.dumps({'passengers': list(cache['passengers'].values()), 'cars': cache['cars']}, cls=EmployeeEncoder)

def update(cache):
    cars = cache["cars"]
    passengers = cache["passengers"]
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

        for passenger in cache["passengers"].values():
            if passenger.car_id is not None:
                pass # cruisin in da hood
            else:
                non_occupied_cars = list(filter(lambda car: len(car.passengers_list) == 0, cars))
                if len(non_occupied_cars) <= 0:
                    continue
                (shortest_path, car) = get_shortest_path_for_passenger(non_occupied_cars, passenger, cache["grid"])
                car.path = shortest_path
                car.passengers_list.append(passenger.id)
                passenger.car_id = car.id

    
    current_next_passenger_spawn = cache["next_passenger_spawn"]
    if current_next_passenger_spawn == 0:
        # random.seed(42)
        new_passenger = Passenger(cache["valid_positions"])
        cache["passengers"][new_passenger.id] = new_passenger
        cache["next_passenger_spawn"] = random.randrange(0, PASSENGER_SPAWN_RANGE)
    else:
        cache["next_passenger_spawn"] -= 1