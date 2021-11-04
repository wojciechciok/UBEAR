class ValidCarPaths:
    def __init__(self, car):
        self.car = car
        self.paths = []
        self.passenger_destination_times = []

    def add_path(self, path, destination_time):
        self.paths.append(path)
        self.passenger_destination_times.append(destination_time)
    
    def has_paths(self):
        return len(self.paths) > 0

    def get_best_path(self):
        if self.has_paths():
            best_path = self.paths[0]
            time = self.passenger_destination_times[0]

            for i in range(1, len(self.paths)):
                if len(self.paths[i]) < len(best_path):
                    time = self.passenger_destination_times[i]
                    best_path = self.paths[i]

                elif len(self.paths[i]) == len(best_path):
                    if self.passenger_destination_times[i] < time:
                        time = self.passenger_destination_times[i]
                        best_path = self.paths[i]

            return best_path, time

        return None

            



class PathsCollection:
    def __init__(self):
        self.possible_car_paths = []

    def add_car_paths(self, possible_car_paths):
        self.possible_car_paths.append(possible_car_paths)

    def has_car_paths(self):
        return len(self.possible_car_paths) > 0

    # TODO add more criteria to pick the best path
    def get_best_car_path(self): 
        if self.has_car_paths():

            best_path, best_time = self.possible_car_paths[0].get_best_path()
            car = self.possible_car_paths[0].car
            for i in range(1, len(self.possible_car_paths)):
                path, time = self.possible_car_paths[i].get_best_path()
                if time < best_time:
                    best_path = path
                    best_time = time
                    car = self.possible_car_paths[i].car

            return car, best_path
        
        return None, None

