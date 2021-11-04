import json

# https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
class Node():
    """A node class for A* Pathfinding"""

    def __init__(self, parent=None, position=None):
        self.parent = parent
        self.position = position

        self.g = 0
        self.h = 0
        self.f = 0

    def __eq__(self, other):
        return self.position == other.position


# manhattan distance for now
def heurestic(start, end):
    return manhattan_distance(start.position[0], start.position[1], end.position[0], end.position[1])

def manhattan_distance(xStart, yStart, xDest, yDest):
    return abs(xStart - xDest) + abs(yStart - yDest)


def astar(maze, start, end, diagonal = False):
    """Returns a list of tuples as a path from the given start to the given end in the given maze"""

    # Create start and end node
    start_node = Node(None, start)
    start_node.g = start_node.h = start_node.f = 0
    end_node = Node(None, end)
    end_node.g = end_node.h = end_node.f = 0

    # Initialize both open and closed list
    open_list = []
    closed_list = []

    # Add the start node
    open_list.append(start_node)

    # Loop until you find the end
    while len(open_list) > 0:

        # Get the current node
        current_node = open_list[0]
        current_index = 0
        for index, item in enumerate(open_list):
            if item.f < current_node.f:
                current_node = item
                current_index = index

        # Pop current off open list, add to closed list
        open_list.pop(current_index)
        closed_list.append(current_node)

        # Found the goal
        if current_node == end_node:
            path = []
            current = current_node
            while current is not None:
                path.append(current.position)
                current = current.parent
            return path[::-1] # Return reversed path

        # Generate children
        children = []
        new_positions = [(0, -1), (0, 1), (-1, 0), (1, 0)]
        if diagonal:
            new_positions += [(-1, -1), (-1, 1), (1, -1), (1, 1)]

        for new_position in new_positions: # Adjacent squares

            # Get node position
            node_position = (current_node.position[0] + new_position[0], current_node.position[1] + new_position[1])

            # Make sure within range
            if node_position[0] > (len(maze) - 1) or node_position[0] < 0 or node_position[1] > (len(maze[len(maze)-1]) -1) or node_position[1] < 0:
                continue

            # Make sure walkable terrain
            if maze[node_position[0]][node_position[1]] != 0:
                continue

            # Create new node
            new_node = Node(current_node, node_position)

            # Append
            children.append(new_node)

        # Loop through children
        for child in children:

            # Child is on the closed list
            if child not in closed_list:
                tempG = current_node.g + 1

                # Child is already in the open list
                if child in open_list:
                    if tempG < child.g:
                        child.g = tempG
                else:
                    child.g = tempG
                    open_list.append(child)

                # Create the f, g, and h values
                child.h = heurestic(child, end_node)
                child.f = child.g + child.h

                # Add the child to the open list
                open_list.append(child)


def get_path(x, y, xDest, yDest, grid, dynamic_paths_collection = None):
    start = (x, y)
    end = (xDest, yDest)

    if dynamic_paths_collection is not None:
        if (x, y, xDest, yDest) in dynamic_paths_collection:
            path = dynamic_paths_collection[(x, y, xDest, yDest)]
            return path

        if (xDest, yDest, x, y) in dynamic_paths_collection:
            path = list(reversed(dynamic_paths_collection[(xDest, yDest, x, y)]))
            return path

    path = astar(grid, start, end)
    if dynamic_paths_collection is not None and len(path) > 0:
        dynamic_paths_collection[(x, y, xDest, yDest)] = path

    return path

def get_shortest_path(cars, xDest, yDest, grid):
    min_len = -1
    # cars are sorted here, so that there is no ambiguity to what car has been chosen (for simulation purposes)
    for car in sorted(cars, key=lambda car: car.id):
        path = get_path(car.x, car.y, xDest, yDest, grid)
        path_len = get_path_length(path)
        if path_len < min_len or min_len == -1:
            min_len = path_len
            (shortest_path, chosen_car) = (path, car)

    return shortest_path, chosen_car


def get_shortest_path_for_passenger(cars, passenger, grid):
    (x, y, xDest, yDest) = passenger.x, passenger.y, passenger.x_dest, passenger.y_dest
    shortest_path, chosen_car = get_shortest_path(cars, x, y, grid)
    path_for_passenger = get_path(x, y, xDest, yDest, grid)
    shortest_path = shortest_path + path_for_passenger[1:]
    return shortest_path, chosen_car

def get_cars_in_patinece_rage(cars, passenger, grid, patience):
    cars_in_range = []
    (x, y) = passenger.x, passenger.y

    for car in sorted(cars, key=lambda car: car.id):
        approx_dist = manhattan_distance(car.x, car.y, x, y)
        if approx_dist > patience:
            continue
        path = get_path(car.x, car.y, x, y, grid)
        path_len = get_path_length(path)
        if path_len < patience:
            cars_in_range.append(car)

        return cars_in_range

# for now only left right, up, down (no left-down)
def get_path_length(path):
    return len(path)
