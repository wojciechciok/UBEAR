import random
from pathfinder import get_shortest_path_for_passenger
from passenger import Passenger

# random 0-10 ticks
PASSENGER_SPAWN_RANGE = 10


def get_passengers_and_cars(cache):
    passengers_and_cars = {'pasengers': cache['passengers'], 'cars': cache['cars']}

def update(cache):
    cars = cache["cars"]
    for car in cars:
        if len(car.passengers_list) > 0:
            for passenger in car.passengers_list:
                if car.x == passenger.x and car.y == passenger.y:
                    passenger.is_in_car = True
                if car.x == passenger.x_dest and car.y == passenger.y_dest and passenger.is_in_car:
                    car.passengers_list.remove(passenger)
                    cache["passengers"].remove(passenger)
        car.move()
    
    print(len(cars))
    non_occupied_cars = list(filter(lambda car: len(car.passengers_list) == 0, cars))
    print(len(non_occupied_cars))

    for passenger in cache["passengers"]:
        if passenger.car_id is not None:
            pass # cruisin in da hood
        else:
            (shortest_path, car) = get_shortest_path_for_passenger(non_occupied_cars, passenger, cache["grid"])
            car.path = shortest_path
            car.passengers_list.append(passenger)

    
    current_next_passenger_spawn = cache["next_passenger_spawn"]
    if current_next_passenger_spawn == 0:
        random.seed(42)
        cache["passengers"].append(Passenger(cache["valid_positions"]))
        cache["next_passenger_spawn"] = random.randrange(0, PASSENGER_SPAWN_RANGE)
    else:
        cache["next_passenger_spawn"] -= 1