class Car:
    def __init__(self, x, y, id):
        self.x = x
        self.y = y
        self.path = []
        self.passengers_list = []
        self.id = id

    def move(self):
        if len(self.path) > 0:
            next_position = self.path[0]
            self.x = next_position[0]
            self.y = next_position[1]
            self.path = self.path[1:]