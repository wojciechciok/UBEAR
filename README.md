# UBEAR
Project for 02223 Model-Based Systems Engineering Fall 21

Simulation tool for autonomous, shareable taxis on the city roads in the near future. 

From command line:
BACKEND Start:
Installing the requirements:

cd backend
python3 -m pip install -r requirements.txt


Starting the backend

python3 server.py

FRONTEND START:
cd frontend
python3 -m http.server

The application should be accessible from: http://localhost:8000/

In order to run the predefined scenarios one has to click Load Configuration and go into: /frontent/assets directory, choose one of the following files: experiment1.json, experiment2.json, experiment3.json and start the simulation.