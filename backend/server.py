from flask import Flask, jsonify, request
from flask_cors import CORS
# from flask_caching import Cache
import json
from pathfinder import get_shortest_path_for_passenger


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
    cache["grid"] = content["grid"]
    app.logger.warning(cache)
    return jsonify(content)

@app.route('/get-path', methods=['POST'])
def get_path_request():
    content = request.json
    passenger = content["passenger"]
    cars = content["cars"]
    (shortest_path, car) = get_shortest_path_for_passenger(cars, passenger, cache["grid"])
    resp = {"shortest_path": shortest_path, "car": car}
    app.logger.warning(resp)
    return jsonify(resp)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)