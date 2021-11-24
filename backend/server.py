from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
from map_helpers import update, get_passengers_and_cars_json
import time
import uuid
from random import Random
import threading
from simulation_threads import thread_creator, init_single

# in seconds
FRAME_RATE = 1 / 30

app = Flask(__name__)

CORS(app)

global_cache = {}
def prettify(my_dict):
    return json.dumps(my_dict, indent=4, sort_keys=True)


def get_simulation_key(guid):
    return f'{guid}_simulation_responses'


def simulation(guid):
    cache = global_cache[guid]
    cache["start_time"] = time.time()
    has_finished = False
    ticks = 0
    while not has_finished:
        has_finished = update(cache)
        if has_finished:
            print(f'Simulation calculation time: {time.time() - cache["start_time"]}')
            return True
        if not has_finished:
            response = get_passengers_and_cars_json(cache)
            global_cache[get_simulation_key(guid)][ticks] = response
            ticks += 1


@app.route('/init', methods=['POST'])
def init():
    content = request.json
    if "no_visualization" in content and content["no_visualization"]:
        return no_visualization(content)
    else:
        cache = init_single(content)
        guid = cache["guid"]
        global_cache[guid] = cache
        global_cache[get_simulation_key(guid)] = {}
        simulation_thread = threading.Thread(target=simulation, args=(guid,))
        simulation_thread.start()
        return jsonify({'guid': guid})


@app.route('/cars/positions/<guid>', methods=['GET'])
def get_cars_positions(guid):
    cache = global_cache[guid]
    if cache is None:
        return f"Simulation with guid: {guid} doesn't exist"
    if not 'grid' in cache or 'cars' not in cache:
        return f"Simulation with guid: {guid} Not initialized"

    refresh_time = 1 / cache['framerate']
    def events():
        ticks = 0
        while True:
            time.sleep(refresh_time)
            if ticks == cache["maxTicks"]:
                print(f'Simulation visualization time {time.time() - cache["start_time"]}')
                del global_cache[guid]
                del global_cache[get_simulation_key(guid)]
                yield 'data: {0}\n\n'.format(json.dumps({'finished': True}))
                break
            if ticks in global_cache[get_simulation_key(guid)]:
                response = global_cache[get_simulation_key(guid)][ticks]
                del global_cache[get_simulation_key(guid)][ticks]
                ticks += 1
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