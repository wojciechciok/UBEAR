from flask import Flask, jsonify, request, Response
from flask_cors import CORS
# from flask_caching import Cache
import json
from map_helpers import update, get_passengers_and_cars_json
import time
import uuid
from random import Random
import threading
from simulation_threads import thread_creator, init_single
# in seconds
FRAME_RATE = 1 / 60

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
    if "no_visualization" in content and content["no_visualization"]:
        return no_visualization(content)
    else:
        cache = init_single(content)
        guid = cache["guid"]
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
    refresh_time = FRAME_RATE
    def events():
        has_finished = False
        while not has_finished:
            time.sleep(refresh_time)
            has_finished = update(cache)
            if has_finished:
                yield 'data: {0}\n\n'.format(json.dumps({'finished': True}))
                break
            if not has_finished:
                response = get_passengers_and_cars_json(cache)
                yield 'data: {0}\n\n'.format(response)

    return Response(events(), mimetype="text/event-stream")


def no_visualization(content):
    data = request.get_json()
    number_of_simulations = content['number_of_simulations'] if 'number_of_simulations' in content else 10
    threads_list = []
    main_thread = threading.Thread(target=thread_creator, args=(number_of_simulations, content))
    main_thread.start()

    return {"message": "Accepted"}, 202

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)