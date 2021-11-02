// backend ulr
let url = " http://localhost:105";

// P5 components
let inputMaxUpdates;
//Passanger spawn minimum
let paragraphPassSpawnMin;
let inputPassSpawnMin;
//Passanger spawn maximum
let paragraphPassSpawnMax;
let inputPassSpawnMax;

// size of the map (width and height)
const size = 700;
// number of cells in a row
const cellNum = 21;
// how wide is one block (how many cells separate two streets)
const density = 5;
// number of cars on the map
const carsNumber = 15;
// refresh rate
const refreshRate = 15;

// size of a cell in pixels
const cellSize = size / cellNum;
// global object of the map see Map.js
let map;
// global object of cars see Car.js
let cars = {};
let carsIDs = [];
// global object of passengers see Passenger.js
let passengers = {};
let passengersIDs = [];
// helper array of cells which are road
let road = [];

// Taxis
let tmpCars = [];

// vars for images
let carImg;
let passengerImg;

// Start Button
let button;

// Road Construction, Taxi radio
let radioBtn;

// if checked, simulation will be performed without visualization (as fast as possible)
let noVisualizationCheckBox;

// Simuation Started flag
let simulationStarted = false;

// loading images
function preload() {
  carImg = loadImage("../assets/taxi.png");
  passengerImg = loadImage("../assets/passenger.png");
}

// setup - this function is called once at the beginning of the program

let paragraphMaxUpdates;

function setup() {
  //Number updates slider

  createCanvas(size, size);
  paragraphMaxUpdates = createP("Max Updates");
  paragraphMaxUpdates.position(800, 0);
  inputMaxUpdates = createInput(""); //createSlider(min, max, [value], [step])
  inputMaxUpdates.position(900, 16);
  inputMaxUpdates.style("width", "80px");

  //Minimum interval time for passanger spawning

  paragraphPassSpawnMin = createP(
    "Minimum value for passenger spawning interval"
  );
  paragraphPassSpawnMin.position(800, 30);
  inputPassSpawnMin = createInput("");
  inputPassSpawnMin.position(1120, 44);
  inputPassSpawnMin.style("width", "80px");

  //Maximum interval time for passanger spawning

  paragraphPassSpawnMax = createP(
    "Maximum value for passenger spawning interval"
  );
  paragraphPassSpawnMax.position(800, 60);
  inputPassSpawnMax = createInput("");
  inputPassSpawnMax.position(1120, 74);
  inputPassSpawnMax.style("width", "80px");

  // initialize map

  map = new Map(cellNum);

  map.show();

  // Create Button
  button = createButton("Start Simulation");
  button.position(0, size + 1);
  button.mousePressed(startSimulation);

  // Create Radio Buttons
  radioBtn = createRadio();
  radioBtn.option("Road Construction");
  radioBtn.option("Taxi Placement");
  radioBtn.style("width", "150px");
  radioBtn.position(0, button.position()["y"] + 24);

  noVisualizationCheckBox = createCheckbox("No visualization", false);
  noVisualizationCheckBox.position(0, radioBtn.position()["y"] + 40);
}

function update(data) {
  // extract data
  const carsData = data.cars;
  const passengersData = data.passengers;
  // update cars
  for (let c of carsData) {
    cars[c.id].update(c.x, c.y, c.path, c.passengers_list);
  }
  const currentPassengersIDs = Object.keys(passengers);
  passengersIDs = passengersData.map((p) => p.id);
  // delete unused passengers
  for (let key of currentPassengersIDs) {
    if (!passengersIDs.includes(key)) {
      delete passengers[key];
    }
  }
  for (let passenger of passengersData) {
    // add new passengers
    if (!currentPassengersIDs.includes(passenger.id)) {
      passengers[passenger.id] = new Passenger(
        passenger.id,
        passenger.x,
        passenger.y,
        passenger.x_dest,
        passenger.y_dest
      );
    }
    // update passenger
    else {
      passengers[passenger.id].update(passenger.is_in_car);
    }
  }
  // draw the map
  map.show();
  // draw all cars
  for (let carID of carsIDs) {
    cars[carID].show();
  }
  // draw all passengers
  for (let passengerID of passengersIDs) {
    passengers[passengerID].show();
  }
}

// helper function for getting a random place on the road
function getRandomPosition() {
  return random(road);
}

function mouseClicked(event) {
  if (simulationStarted || mouseX >= size || mouseY >= size) return;
  let x = Math.floor(mouseX / cellSize);
  let y = Math.floor(mouseY / cellSize);
  let v = radioBtn.value();
  switch (v) {
    case "Road Construction":
      map.roadConstruction(x, y);
      map.show();
      for (c in cars) {
        if (cars[c].x == x && cars[c].y == y) {
          delete cars[c];
        } else {
          cars[c].show();
        }
      }
      break;

    case "Taxi Placement":
      let taxiID = carsIDs.length;

      if (map.grid[x][y] != true) break;
      cars[taxiID] = placeTaxi(taxiID, x, y);
      carsIDs.push(taxiID);
      tmpCars.push(cars[taxiID]);
      cars[taxiID].show();
      break;
  }
}

function placeTaxi(id, x, y) {
  return new Car(id, x, y);
}

function startSimulation() {
  simulationStarted = true;
  for (let x = 0; x < map.grid.length; x++) {
    for (let y = 0; y < map.grid[x].length; y++) {
      if (map.grid[x][y]) {
        road.push([x, y]);
      }
    }
  }

  carsIDs = [];
  tmpCars = [];
  for (c in cars) {
    carsIDs.push(cars[c].id);
    tmpCars.push(cars[c]);
  }
  // backend needs 1 when frontend has zeros an vice versa
  const invertedMap = [];
  for (let row of map.grid) {
    invertedMap.push([]);
    for (let col of row) {
      invertedMap[invertedMap.length - 1].push(abs(col - 1));
    }
  }

  // create cars
  // const tmpCars = [];
  // for (let i = 0; i < carsNumber; i++) {
  //   cars[i] = new Car(i);
  //   carsIDs.push(i);
  //   tmpCars.push(cars[i]);
  // }

  // send the map to the backend
  httpPost(
    `${url}/init`,
    "json",
    {
      grid: invertedMap,
      cars: tmpCars.map((c) => {
        return { x: c.x, y: c.y, id: c.id };
      }),
      maxUpdates: int(inputMaxUpdates.value()),
      no_visualization: noVisualizationCheckBox.checked(),
      minPassSpawn: int(inputPassSpawnMin.value()),
      maxPassSpawn: int(inputPassSpawnMax.value()),
    },
    function (result) {
      if (!noVisualizationCheckBox.checked()) {
        let guid = result.guid;
        // if successful allow animation
        const evtSource = new EventSource(`${url}/cars/positions/${guid}`);
        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.finished) {
            alert("Simulation finished");
            evtSource.close();
          } else {
            update(data);
          }
        };
      }
    },
    function (error) {
      console.log(error);
    }
  );
}
