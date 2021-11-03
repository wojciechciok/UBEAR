from passenger import Passenger
from statistics import mean, median

def get_metrics_for_passengers(passengers):
    lst = list(map(lambda passenger: {
               "waited_for_car": passenger.waited_for_car, "traveled": passenger.traveled}, passengers.values()))
    return {
        "list": lst,
        "sum_waited_for_car": sum(map(lambda passenger: passenger.waited_for_car, passengers.values())),
        "sum_travelled": sum(map(lambda passenger: passenger.traveled, passengers.values())),
        "min_waited_for_car": min(map(lambda passenger: passenger.waited_for_car, passengers.values())),
        "min_travelled": min(map(lambda passenger: passenger.traveled, passengers.values())),
        "max_waited_for_car": max(map(lambda passenger: passenger.waited_for_car, passengers.values())),
        "max_travelled": max(map(lambda passenger: passenger.traveled, passengers.values())),
        "median_waited_for_car": median(map(lambda passenger: passenger.waited_for_car, passengers.values())),
        "median_travelled": median(map(lambda passenger: passenger.traveled, passengers.values())),
        "mean_waited_for_car": mean(map(lambda passenger: passenger.waited_for_car, passengers.values())),
        "mean_travelled": mean(map(lambda passenger: passenger.traveled, passengers.values()))
    }


def get_metrics_for_cars(cars):
    lst = list(map(lambda car: {
               "waited_for_passengers": car.waited_for_passengers, "traveled": car.traveled}, cars))
    return {
        "list": lst,
        "sum_waited_for_passengers": sum(map(lambda car: car.waited_for_passengers, cars)),
        "sum_travelled": sum(map(lambda car: car.traveled, cars)),
        "min_waited_for_passengers": min(map(lambda car: car.waited_for_passengers, cars)),
        "min_travelled": min(map(lambda car: car.traveled, cars)),
        "max_waited_for_passengers": max(map(lambda car: car.waited_for_passengers, cars)),
        "max_travelled": max(map(lambda car: car.traveled, cars)),
        "median_waited_for_passengers": median(map(lambda car: car.waited_for_passengers, cars)),
        "median_travelled": median(map(lambda car: car.traveled, cars)),
        "mean_waited_for_passengers": mean(map(lambda car: car.waited_for_passengers, cars)),
        "mean_travelled": mean(map(lambda car: car.traveled, cars))
    }


def get_all_metrics(cache):
    return {
        "passengers": get_metrics_for_passengers(cache["passengers"]),
        "cars": get_metrics_for_cars(cache["cars"])
    }
