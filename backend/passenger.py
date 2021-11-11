import uuid


class Passenger:
    def __init__(self, valid_positions, random):
        (x, y) = get_valid_passenger_position(valid_positions, random)
        (x_dest, y_dest) = get_valid_passenger_position(valid_positions, random)
        self.x = x
        self.y = y
        self.x_dest = x_dest
        self.y_dest = y_dest
        self.car_id = None
        self.id = str(uuid.uuid4())
        self.is_in_car = False
        self.waited_for_car = 0  # time spent outside of a car
        self.traveled = 0  # time spent in a car

        self.shortest_path_length = None

class PassengerHotspotLoc:
    def __init__(self, valid_positions, x, y, random):
        (x, y) = (x, y)
        (x_dest, y_dest) = get_valid_passenger_position(valid_positions, random)
        self.x = x
        self.y = y
        self.x_dest = x_dest
        self.y_dest = y_dest
        self.car_id = None
        self.id = str(uuid.uuid4())
        self.is_in_car = False

class PassengerHotspotDest:
    def __init__(self, valid_positions, x_dest, y_dest, random):
        (x, y) = get_valid_passenger_position(valid_positions, random)
        (x_dest, y_dest) = (x_dest, y_dest)
        self.x = x
        self.y = y
        self.x_dest = x_dest
        self.y_dest = y_dest
        self.car_id = None
        self.id = str(uuid.uuid4())
        self.is_in_car = False

def get_valid_passenger_position(valid_positions, random):
    return random.choice(valid_positions)


def get_valid_passenger_positions(grid):
    valid_positions = []
    for x in range(len(grid)):
        for y in range(len(grid[x])):
            if grid[x][y] == 0:
                valid_positions.append((x, y))
    return valid_positions
