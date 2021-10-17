import uuid
import random

class Passenger:
    def __init__(self, valid_positions):
        (x, y) = get_valid_passenger_position(valid_positions)
        (x_dest, y_dest) = get_valid_passenger_position(valid_positions)
        self.x = x
        self.y = y
        self.x_dest = x_dest
        self.y_dest = y_dest
        self.car_id = None
        self.id = str(uuid.uuid4())
        self.is_in_car = False

def get_valid_passenger_position(valid_positions):
    # random.seed(42)
    return random.choice(valid_positions)


def get_valid_passenger_positions(grid):
    valid_positions = []
    for x in range(len(grid)):
        for y in range(len(grid[x])):
            if grid[x][y] == 0:
                valid_positions.append((x, y))
    return valid_positions