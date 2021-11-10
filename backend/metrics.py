from passenger import Passenger
from statistics import mean, median


def get_metrics_for_passengers(passengers):
    lst = list(map(lambda passenger: {
        "waited_for_car": passenger.waited_for_car, "traveled": passenger.traveled}, passengers))
    return {
        "list": lst,
        "sum_waited_for_car": sum(map(lambda passenger: passenger.waited_for_car, passengers)),
        "sum_travelled": sum(map(lambda passenger: passenger.traveled, passengers)),
        "min_waited_for_car": min(map(lambda passenger: passenger.waited_for_car, passengers)),
        "min_travelled": min(map(lambda passenger: passenger.traveled, passengers)),
        "max_waited_for_car": max(map(lambda passenger: passenger.waited_for_car, passengers)),
        "max_travelled": max(map(lambda passenger: passenger.traveled, passengers)),
        "median_waited_for_car": median(map(lambda passenger: passenger.waited_for_car, passengers)),
        "median_travelled": median(map(lambda passenger: passenger.traveled, passengers)),
        "mean_waited_for_car": mean(map(lambda passenger: passenger.waited_for_car, passengers)),
        "mean_travelled": mean(map(lambda passenger: passenger.traveled, passengers))
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
        "passengers": get_metrics_for_passengers(list(cache["passengers"].values()) + cache["served_passengers"]),
        "taxi_passengers": get_metrics_for_passengers(
            list(cache["taxi_passengers"].values()) + cache["served_taxi_passengers"]),
        "cars": get_metrics_for_cars(cache["cars"]),
        "taxi_cars": get_metrics_for_cars(cache["taxi_cars"]),
        "served_passengers_count": len(cache["served_passengers"]),
        "served_taxi_passengers_count": len(cache["served_taxi_passengers"])
    }
