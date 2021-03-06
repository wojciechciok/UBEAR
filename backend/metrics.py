from passenger import Passenger
from statistics import mean, median


def get_metrics_for_passengers(passengers, served, common):
    # lst = list(map(lambda passenger: {
    #     "waited_for_car": passenger.waited_for_car, "traveled": passenger.traveled}, passengers))
    return {
        # "list": lst,
        "sum_waited_for_car": sum(map(lambda passenger: passenger.waited_for_car, passengers + served)),
        "sum_travelled": sum(map(lambda passenger: passenger.traveled, passengers + served)),
        "common_sum_waited_for_car": sum(map(lambda passenger: passenger.waited_for_car, common)),
        "common_sum_travelled": sum(map(lambda passenger: passenger.traveled, common)),
        # "min_waited_for_car": min(map(lambda passenger: passenger.waited_for_car, passengers)),
        # "min_travelled": min(map(lambda passenger: passenger.traveled, passengers)),
        # "max_waited_for_car": max(map(lambda passenger: passenger.waited_for_car, passengers)),
        # "max_travelled": max(map(lambda passenger: passenger.traveled, passengers)),
        # "median_waited_for_car": median(map(lambda passenger: passenger.waited_for_car, passengers)),
        # "median_travelled": median(map(lambda passenger: passenger.traveled, passengers)),
        "mean_waited_for_car": mean(map(lambda passenger: passenger.waited_for_car, passengers)),
        "mean_travelled": mean(map(lambda passenger: passenger.traveled, passengers)),
        "time_satisfaction": mean(map(lambda passenger: passenger.time_score, served)) if len(
            served) > 0 else 0,
        "cost_satisfaction": mean(map(lambda passenger: passenger.cost_score, served)) if len(
            served) > 0 else 0,
        "profit": sum(map(lambda passenger: passenger.trip_cost, served))
    }


def get_metrics_for_cars(cars):
    # lst = list(map(lambda car: {
    #     "waited_for_passengers": car.waited_for_passengers, "traveled": car.traveled}, cars))
    return {
        # "list": lst,
        "sum_waited_for_passengers": sum(map(lambda car: car.waited_for_passengers, cars)),
        "sum_travelled": sum(map(lambda car: car.traveled, cars)),
        # "min_waited_for_passengers": min(map(lambda car: car.waited_for_passengers, cars)),
        # "min_travelled": min(map(lambda car: car.traveled, cars)),
        # "max_waited_for_passengers": max(map(lambda car: car.waited_for_passengers, cars)),
        # "max_travelled": max(map(lambda car: car.traveled, cars)),
        # "median_waited_for_passengers": median(map(lambda car: car.waited_for_passengers, cars)),
        # "median_travelled": median(map(lambda car: car.traveled, cars)),
        "mean_waited_for_passengers": mean(map(lambda car: car.waited_for_passengers, cars)),
        "mean_travelled": mean(map(lambda car: car.traveled, cars)),
        "cost": sum(map(lambda car: car.operation_cost, cars))
    }


def get_all_metrics(cache):
    passengers = list(cache["passengers"].values())
    taxi_passengers = list(cache["taxi_passengers"].values())
    served_passengers = cache["served_passengers"]
    served_taxi_passengers = cache["served_taxi_passengers"]
    served_ids = map(lambda p: p.id, served_passengers)
    taxi_served_id = map(lambda p: p.id, served_taxi_passengers)
    common_passengers_ids = list(set(served_ids).intersection(taxi_served_id))
    common_served_passengers = list(filter(lambda p: p.id in common_passengers_ids, served_passengers))
    common_served_taxi_passengers = list(filter(lambda p: p.id in common_passengers_ids, served_taxi_passengers))
    return {
        "passengers": get_metrics_for_passengers(passengers, served_passengers, common_served_passengers),
        "taxi_passengers": get_metrics_for_passengers(taxi_passengers, served_taxi_passengers,
                                                      common_served_taxi_passengers),
        "cars": get_metrics_for_cars(cache["cars"]),
        "taxi_cars": get_metrics_for_cars(cache["taxi_cars"]),
        "served_passengers_count": len(served_passengers),
        "served_taxi_passengers_count": len(served_taxi_passengers)
    }
