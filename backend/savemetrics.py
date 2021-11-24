def save_metrics(dict, filename):
    
    file = open(filename, "w")
    file.write(str(dict))
    file.close()