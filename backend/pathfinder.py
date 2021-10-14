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
            for closed_child in closed_list:
                if child == closed_child:
                    continue

            # Create the f, g, and h values
            child.g = current_node.g + 1
            child.h = ((child.position[0] - end_node.position[0]) ** 2) + ((child.position[1] - end_node.position[1]) ** 2)
            child.f = child.g + child.h

            # Child is already in the open list
            for open_node in open_list:
                if child == open_node and child.g > open_node.g:
                    continue

            # Add the child to the open list
            open_list.append(child)


def get_path(x, y, xDest, yDest, grid):
    start = (x, y)
    end = (xDest, yDest)

    path = astar(grid, start, end)
    return path

def get_shortest_path(cars, xDest, yDest, grid):
    min_len = -1
    for car in cars:
        path = get_path(car["x"], car["y"], xDest, yDest, grid)
        path_len = get_path_length(path)
        if path_len < min_len or min_len == -1:
            min_len = path_len
            (shortest_path, chosen_car) = (path, car)

    return shortest_path, chosen_car


def get_shortest_path_for_passenger(cars, passenger, grid):
    (x, y, destX, destY) = passenger["x"], passenger["y"], passenger["destX"], passenger["destY"]
    shortest_path, chosen_car = get_shortest_path(cars, x, y, grid)
    path_for_passenger = get_path(x, y, destX, destY, grid)
    shortest_path = shortest_path + path_for_passenger[1:]
    return shortest_path, chosen_car

# for now only left right, up, down (no left-down)
def get_path_length(path):
    return len(path)