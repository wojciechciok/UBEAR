class ValidCarPaths:
    def __init__(self, car):
        self.car = car
        self.paths = []

    def add_path(self, path):
        self.paths.append(path)
    
    def has_paths(self):
        return len(self.paths) > 0

    def get_best_path(self):
        if self.has_paths():
            return sorted(self.paths, key=lambda path: len(path))[0]
        return None
            



class PathsCollection:
    def __init__(self):
        self.possible_car_paths = []

    def add_car_paths(self, possible_car_paths):
        self.possible_car_paths.append(possible_car_paths)

    def has_car_paths(self):
        return len(self.possible_car_paths) > 0

    # TODO add more criterions to pick the best path
    def get_best_car_path(self): 
        if self.has_car_paths():
            self.possible_car_paths.sort(key=lambda car_path: car_path.car.passengers_list, reverse=True)
            for possible_car_path in self.possible_car_paths:
                if possible_car_path.has_paths():
                    return possible_car_path.car, possible_car_path.get_best_path()
        
        return None, None

