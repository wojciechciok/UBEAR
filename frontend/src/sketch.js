// backend ulr
let url = " http://localhost:105";
let eventSource;

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
let carsNumber = 0;
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

// taxi spawner generator
let taxiSpawnerTxt;
let taxiSpawnerInp;

// if checked, simulation will be performed without visualization (as fast as possible)
let noVisualizationCheckBox;
// Start Button
let startButton;
// Road Construction, Taxi radio
let radioBtn;
// updates counter
let updatesCounterElement;
let updatesCounter = 0;

//////////////////////////
// REGULAR MODEL CANVAS //
//////////////////////////

let simulation1 = function (p) {
  // loading images
  p.preload = () => {
    carImg = p.loadImage("../assets/taxi.png");
    passengerImg = p.loadImage("../assets/passenger.png");
  };

  // setup - this function is called once at the beginning of the program
  p.setup = () => {
    p.createCanvas(size, size);

    inputMaxUpdates = p.select("#maxUpdatesInput");

    // Minimum interval time for passanger spawning
    inputPassSpawnMin = p.select("#minPassengerSpawnIntervalInput");

    // Maximum interval time for passanger spawning
    inputPassSpawnMax = p.select("#maxPassengerSpawnIntervalInput");

    // initialize map
    map = new City(cellNum);

    // initial map draw
    map.show(p);

    // Create Button
    button = p.select("#startButton");
    button.mousePressed(startSimulation);

    // Create Radio Buttons
    // let radioWrapper = p.select("#mapModeRadioButton");
    radioBtn = p.createRadio("#mode", "mode");
    // radioBtn.parent(radioWrapper);
    // radioBtn.option("Road Construction");
    // radioBtn.option("Taxi Placement");

    noVisualizationCheckBox = p.select("#visualisationCheckbox");

    // Create Taxi Spawner Generator
    taxiSpawnerInp = p.select("#randomTaxiSpawnInput");

    // select updates counter
    updatesCounterElement = p.select("#updatesCounter");
  };

  function update(data) {
    updatesCounter++;
    updatesCounterElement.html(`Updates Count: ${updatesCounter}`);
    // extract data
    const carsData = data.cars;
    const passengersData = data.passengers;
    const metrics = data.metrics;

    // update chart
    addData(myChart, "", [
      metrics.cars.sum_travelled,
      metrics.passengers.sum_travelled,
    ]);

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
          p,
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

  p.mouseClicked = (event) => {
    if (
      simulationStarted ||
      p.mouseX >= size ||
      p.mouseY >= size ||
      p.mouseX < 0 ||
      p.mouseY < 0
    )
      return;
    let x = Math.floor(p.mouseX / cellSize);
    let y = Math.floor(p.mouseY / cellSize);
    let v = radioBtn.value();
    switch (v) {
      case "Road construction":
        map.roadConstruction(x, y);
        map.show(p);
        for (c in cars) {
          if (cars[c].x == x && cars[c].y == y) {
            delete cars[c];
          } else {
            cars[c].show(p);
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
  };
};

function placeTaxi(id, x, y) {
  return new Car(id, x, y);
}

// spawns taxis based on the spawn taxi input field
function spawnAmountOfTaxis(amount) {
  for (let i = 0; i < amount; i++) {
    cars[carsIDs.length] = new Car(carsIDs.length);
    carsIDs.push(carsIDs.length);
  }
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

  // Spawns taxis
  carsNumber = int(taxiSpawnerInp.value());

  spawnAmountOfTaxis(carsNumber);
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

  // before making new init requests close all existing connections
  if (eventSource) eventSource.close();

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
        eventSource = new EventSource(`${url}/cars/positions/${guid}`);
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.finished) {
            alert("Simulation finished");
            eventSource.close();
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
