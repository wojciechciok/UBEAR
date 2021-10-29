from flask import Flask, jsonify, request, Response
from flask_cors import CORS
# from flask_caching import Cache
import json
# from pathfinder import get_shortest_path_for_passenger
from passenger import get_valid_passenger_positions
from map_helpers import update, get_passengers_and_cars_json
from car import Car
import time
import uuid
from random import Random

# in seconds
FRAME_RATE = 1 / 5

# config = {
#     "DEBUG": True,          # some Flask specific configs
#     "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
#     "CACHE_DEFAULT_TIMEOUT": 300
# }
app = Flask(__name__)
# app.config.from_mapping(config)

CORS(app)
# cache = Cache(app)

global_cache = {}
def prettify(my_dict):
    return json.dumps(my_dict, indent=4, sort_keys=True)

@app.route('/init', methods=['POST'])
def init():
    content = request.json
    grid = content["grid"]
    cache = {}
    cache["ticks"] = 0
    max_updates = content["maxUpdates"]
    cache["maxTicks"] = max_updates if max_updates is not None else 420
    cache["grid"] = grid
    cache["valid_positions"] = get_valid_passenger_positions(grid)
    cache["cars"] = list(map(lambda car: Car(car["x"], car["y"], car["id"]), content["cars"]))
    cache["passengers"] = {}
    cache["next_passenger_spawn"] = 0
    random = Random()
    random.seed(42)
    cache["random"] = random
    guid = str(uuid.uuid4())
    global_cache[guid] = cache
    return jsonify({'guid': guid})


@app.route('/cars/positions/<guid>', methods=['GET'])
def get_cars_positions(guid):
    cache = global_cache[guid]
    if cache is None:
        return f"Simulation with guid: {guid} doesn't exist"
    # todo: every 10-15 seconds e.g.
    if not 'grid' in cache or 'cars' not in cache:
        return f"Simulation with guid: {guid} Not initialized"
    time_wait_range = 2
    refresh_time = FRAME_RATE
    def events():
        has_finished = False
        while not has_finished:
            time.sleep(refresh_time)
            has_finished = update(cache)
            if has_finished:
                yield 'data: {0}\n\n'.format(json.dumps({'finished': True, 'metrics': {}}))
                break
            if not has_finished:
                response = get_passengers_and_cars_json(cache)
                yield 'data: {0}\n\n'.format(response)

    return Response(events(), mimetype="text/event-stream")


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)