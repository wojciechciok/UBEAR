import uuid


class Passenger:
    def __init__(self, valid_positions, random, waiting_patience, x=None, y=None, dest_x=None, dest_y=None):
        if x is not None and y is not None:
            (dest_x, dest_y) = get_valid_passenger_position(valid_positions, random, pos=(x, y))
        elif dest_x is not None and dest_y is not None:
            (x, y) = get_valid_passenger_position(valid_positions, random, pos=(dest_y, dest_y))
        else:
            (x, y) = get_valid_passenger_position(valid_positions, random, pos=(dest_x, dest_y))
            (dest_x, dest_y) = get_valid_passenger_position(valid_positions, random, pos=(x, y))
        self.x = x
        self.y = y
        self.x_dest = dest_x
        self.y_dest = dest_y
        self.car_id = None
        self.id = str(uuid.uuid4())
        self.is_in_car = False
        self.waited_for_car = 0  # time spent outside of a car
        self.traveled = 0  # time spent in a car

        self.shortest_path_length = None
        self.trip_cost = 0
        self.cost_score = 0
        self.time_score = 0
        self.waiting_patience = waiting_patience


def get_valid_passenger_position(valid_positions, random, pos=(-1, -1)):
    random_pos = random.choice(valid_positions)
    while random_pos[0] is pos[0] and random_pos[1] is pos[1]:
        random_pos = random.choice(valid_positions)
    return random_pos


def get_valid_passenger_positions(grid):
    valid_positions = []
    for x in range(len(grid)):
        for y in range(len(grid[x])):
            if grid[x][y] == 0:
                valid_positions.append((x, y))
    return valid_positions
