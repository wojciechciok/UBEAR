from threading import Thread
from random import Random
from passenger import get_valid_passenger_positions
from car import Car
from uuid import uuid4
from map_helpers import update
import json
import copy


def thread_creator(amount, content):
    threads = []
    results = []
    for i in range(amount):
        cache = init_single(content)
        t = Thread(target=simulate_single, args=(cache, results))
        threads.append(t)
        t.start()
        print(f'Started, guid: {cache["guid"]}')
    # main thread waits for all threads
    for t in threads:
        t.join()
    print(json.dumps(results))


def init_single(content):
    grid = content["grid"]
    cache = {}
    cache["ticks"] = 0
    max_updates = content["maxUpdates"]
    cache["maxTicks"] = max_updates if max_updates is not None else 1000
    cache["grid"] = grid
    cache["valid_positions"] = get_valid_passenger_positions(grid)
    cache["cars"] = list(map(lambda car: Car(car["x"], car["y"], car["id"]), content["cars"]))
    cache["taxi_cars"] = copy.deepcopy(cache["cars"])
    cache["passengers"] = {}
    cache["served_passengers"] = []
    cache["served_taxi_passengers"] = []
    cache["taxi_passengers"] = {}
    cache["next_passenger_spawn"] = 0
    random = Random()
    random.seed(42)
    cache["random"] = random
    cache["guid"] = str(uuid4())
    cache["min_pass_spawn"] = content["minPassSpawn"]
    cache["max_pass_spawn"] = content["maxPassSpawn"]
    cache["dynamic_paths_collection"] = {}
    cache["enable_hotspots"] = False
    if content["enableHotspots"] and "xHotspotLoc" in content.keys() and "yHotspotLoc" in content.keys():
        cache["update_num_loc_hotspot"] = content["updateNumLocHotspot"]
        cache["pass_num_loc_hotspot"] = content["hotspotPassNumber"]
        cache["update_num_dest_hotspot"] = content["updateNumDestHotspot"]
        cache["enable_hotspots"] = content["enableHotspots"]
        if cache["enable_hotspots"]:
            cache["hotspot_loc_y"] = content["yHotspotLoc"]
            cache["hotspot_loc_x"] = content["xHotspotLoc"]

    return cache


def simulate_single(cache, results):
    guid = cache["guid"]
    has_finished = False
    while not has_finished:
        has_finished = update(cache)
        if has_finished:
            print(f'Finished, guid: {guid}')
            results.append({
                'guid': guid,
                'finished': True,
                # metrics should be returned by the update function along the has_finished
                'metrics': {}})
