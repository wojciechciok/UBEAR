class Car:
    def __init__(self, x, y, id):
        self.x = x
        self.y = y
        self.path = []
        self.passengers_list = []
        self.id = id
        self.traveled = 0  # how many units has this car traveled in total
        self.waited_for_passengers = 0  # how many units has this car had nothing to do

    def move(self):
        if len(self.path) > 0:
            next_position = self.path[0]
            self.x = next_position[0]
            self.y = next_position[1]
            self.path = self.path[1:]
            self.traveled += 1
        else:
            self.waited_for_passengers += 1
