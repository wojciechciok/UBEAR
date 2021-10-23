from flask import Flask, jsonify, request, Response
from flask_cors import CORS
# from flask_caching import Cache
import json
# from pathfinder import get_shortest_path_for_passenger
from passenger import get_valid_passenger_positions
from map_helpers import update, get_passengers_and_cars_json
from car import Car
import time

# in seconds
FRAME_RATE = 1 / 2

# config = {
#     "DEBUG": True,          # some Flask specific configs
#     "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
#     "CACHE_DEFAULT_TIMEOUT": 300
# }
app = Flask(__name__)
# app.config.from_mapping(config)

CORS(app)
# cache = Cache(app)
cache = {}


def prettify(my_dict):
    return json.dumps(my_dict, indent=4, sort_keys=True)

@app.route('/init', methods=['POST'])
def init():
    content = request.json
    grid = content["grid"]
    cache["grid"] = grid
    cache["valid_positions"] = get_valid_passenger_positions(grid)
    cache["cars"] = list(map(lambda car: Car(car["x"], car["y"], car["id"]), content["cars"]))
    cache["passengers"] = []
    cache["next_passenger_spawn"] = 0
    return jsonify(content)

# @app.route('/get-path', methods=['POST'])
# def get_path_request():
#     content = request.json
#     passenger = content["passenger"]
#     cars = content["cars"]
#     (shortest_path, car) = get_shortest_path_for_passenger(cars, passenger, cache["grid"])
#     resp = {"shortest_path": shortest_path, "car": car}
#     app.logger.warning(resp)
#     return jsonify(resp)


@app.route('/cars/positions', methods=['GET'])
def get_cars_positions():
    # todo: every 10-15 seconds e.g.
    if not 'grid' in cache or 'cars' not in cache:
        return "Not initialized"
    time_wait_range = 2
    refresh_time = FRAME_RATE
    def events():
        while True:
            time.sleep(refresh_time)
            update(cache)
            response = get_passengers_and_cars_json(cache)
            app.logger.warning("update")
            yield 'data: {0}\n\n'.format(response)

    return Response(events(), mimetype="text/event-stream")


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)