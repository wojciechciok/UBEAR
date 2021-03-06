// backend ulr
const url = " http://localhost:105";

///////////////
// VARIABLES //
///////////////

// size of the map (width and height)
let size = 500;
// number of cells in a row
let cellNum = 31;
// how wide is one block (how many cells separate two streets)
const density = 5;
// number of cars on the map
let carsNumber = 0;
// refresh rate
const refreshRate = 15;

////////////////////
// GLOBAL OBJECTS //
////////////////////

// event source https://developer.mozilla.org/en-US/docs/Web/API/EventSource
let eventSource;
// size of a cell in pixels
let cellSize = size / cellNum;
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
let carImgs = {};
let passengerImg;
// Simuation Started flag
let simulationStarted = false;

////////////
// INPUTS //
////////////

// taxi spawner generator
let taxiSpawnerInp;
// maximum number of updates
let inputMaxUpdates;
// framerate
let inputFramerate;
// Passanger spawn minimum
let inputPassSpawnMin;
// Passanger spawn maximum
let inputPassSpawnMax;

let inputLoadConfig;

let inputMapSize;
// if checked, simulation will be performed without visualization (as fast as possible)
let noVisualizationCheckBox;
// Start Button
let startButton;

let saveConfigButton;
// Road Construction, Taxi radio
let radioBtn;
// updates counter
let updatesCounterElement;
let updatesCounter = 0;
//hotspots inputs
let hotspotsCheckbox;
let hotspotDestUpdateNumber;
let hotspotLocUpdateNumber;
let hotspotPassNumber;
let positionRadBtn;
let hotspotPositionX;
let hotspotPositionY;
let hotspotCoordinates;

let button2;
let button3;

////////////////////////
// UBEAR MODEL CANVAS //
////////////////////////

let simulation1 = function (p) {
  // loading images
  p.preload = () => {
    for (let i = 0; i <= 4; i++) {
      carImgs[i] = p.loadImage(`../assets/taxi_${i}.png`);
    }
    passengerImg = p.loadImage("../assets/passenger.png");
  };

  // setup - this function is called once at the beginning of the program
  p.setup = () => {
    document.getElementById('loadConfigName').addEventListener('change', onChange);
    p.createCanvas(size, size);

    inputMaxUpdates = p.select("#maxUpdatesInput");

    inputFramerate = p.select("#framerate");

    // Minimum interval time for passanger spawning
    inputPassSpawnMin = p.select("#minPassengerSpawnIntervalInput");

    // Maximum interval time for passanger spawning
    inputPassSpawnMax = p.select("#maxPassengerSpawnIntervalInput");

    inputMapSize = p.select("#mapSize");
    cellNum = inputMapSize.value();
    cellSize = size / cellNum;

    inputLoadConfig = p.select("#loadConfigName");
    // initialize map
    map = new City(cellNum);

    // initial map draw
    map.show(p);

    // Create Button
    button = p.select("#startButton");
    button.mousePressed(startSimulation);

    button2 = p.select("#saveConfigButton");
    button2.mousePressed(saveData);

    button3 = p.select("#refreshMapSize");
    button3.mousePressed(refreshMapSize);

    // Create Radio Buttons
    let radioWrapper = p.select("#mapModeRadioButton");
    radioBtn = p.createRadio();
    radioBtn.parent(radioWrapper);
    radioBtn.addClass("form-check");
    radioBtn.addClass("radio");
    radioBtn.option("Road construction");
    radioBtn.html("<br/>", true);
    radioBtn.option("Taxi placement");

    noVisualizationCheckBox = p.select("#visualisationCheckbox");

    // Create Taxi Spawner Generator
    taxiSpawnerInp = p.select("#randomTaxiSpawnInput");

    // select updates counter
    updatesCounterElement = p.select("#updatesCounter");

    //hotspots inputs

    hotspotsCheckbox = p.select("#hotspotsCheckbox");
    hotspotDestUpdateNumber = p.select("#hotspotDestUpdateNumber");
    hotspotLocUpdateNumber = p.select("#hotspotLocUpdateNumber");
    hotspotPassNumber = p.select("#hotspotPassNumber");

    let hotspotRadioWrapper = p.select("#mapHotspotPositionRadBtn");
    positionRadBtn = p.createRadio();
    positionRadBtn.parent(hotspotRadioWrapper);
    positionRadBtn.addClass("form-check");
    positionRadBtn.addClass("radio");
    positionRadBtn.option("Determine hotspot position");
    document.getElementById("hotspotCoordinates").innerHTML =
      "Hotspot position:";
  };

  function showHotspot(p) {
    let hc = p.color(255, 0, 0, 70);
    p.noStroke();
    p.fill(hc);
    p.square(
      hotspotPositionX * cellSize,
      hotspotPositionY * cellSize,
      cellSize
    );
  }

  function update(data) {
    updatesCounter++;
    updatesCounterElement.html(updatesCounter);
    // extract data
    const carsData = data.cars;
    const passengersData = data.passengers;
    const metrics = data.metrics;
    const taxiCarsData = data.taxi_cars;
    const taxiPassengersData = data.taxi_passengers;

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

    // TAXIS:
    for (let c of taxiCarsData) {
      taxiCars[c.id].update(c.x, c.y, c.path, c.passengers_list);
    }
    const currentTaxiPassengersIDs = Object.keys(taxiPassengers);
    taxiPassengersIDs = taxiPassengersData.map((p) => p.id);
    // delete unused passengers
    for (let key of currentTaxiPassengersIDs) {
      if (!taxiPassengersIDs.includes(key)) {
        delete taxiPassengers[key];
      }
    }
    for (let passenger of taxiPassengersData) {
      // add new passengers
      if (!currentTaxiPassengersIDs.includes(passenger.id)) {
        taxiPassengers[passenger.id] = new Passenger(
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
        taxiPassengers[passenger.id].update(passenger.is_in_car);
      }
    }
    // draw the map
    map.show(p);
    // draw all cars
    for (let carID of carsIDs) {
      cars[carID].show(p);
    }
    // draw all passengers
    for (let passengerID of passengersIDs) {
      passengers[passengerID].show(p);
    }

    if (hotspotsCheckbox.checked()) {
      showHotspot(p);
    }

    let maxY = Math.max(
      metrics.taxi_cars.sum_travelled,
      metrics.taxi_passengers.sum_travelled,
      metrics.cars.sum_travelled,
      metrics.passengers.sum_travelled
    );
    // update chart
    addData(
      taxiChart,
      "",
      [metrics.taxi_cars.sum_travelled, metrics.taxi_passengers.sum_travelled],
      maxY
    );

    addData(
      chart,
      "",
      [metrics.cars.sum_travelled, metrics.passengers.sum_travelled],
      maxY
    );

    addData(passengersServedChart, "", [
      metrics.served_passengers_count,
      metrics.served_taxi_passengers_count,
    ]);

    addData(passengersTimeSavedChart, "", [
      metrics.taxi_passengers.common_sum_waited_for_car +
        metrics.taxi_passengers.common_sum_travelled -
        (metrics.passengers.common_sum_waited_for_car +
          metrics.passengers.common_sum_travelled),
    ]);

    resetChart(satisfactionChart);
    addData(satisfactionChart, "TIME", [
      metrics.passengers.time_satisfaction,
      metrics.taxi_passengers.time_satisfaction,
    ]);
    addData(satisfactionChart, "COST", [
      metrics.passengers.cost_satisfaction,
      metrics.taxi_passengers.time_satisfaction,
    ]);

    addData(profitChart, "", [
      metrics.passengers.profit - metrics.cars.cost,
      metrics.taxi_passengers.profit - metrics.taxi_cars.cost,
    ]);
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
    let h = positionRadBtn.value();
    switch (h) {
      case "Determine hotspot position":
        if (map.grid[x][y] == 1) {
          hotspotPositionX = x;
          hotspotPositionY = y;
          map.show(p);
          for (let carID of carsIDs) {
            cars[carID].show(p);
          }
          showHotspot(p);
          document.getElementById("hotspotCoordinates").innerHTML =
            "Hotspot position: (" +
            hotspotPositionX +
            ", " +
            hotspotPositionY +
            ")";
        } else {
          alert("Please select a road point in the map");
        }
    }
    let v = radioBtn.value();
    switch (v) {
      case "Road construction":
        map.roadConstruction(x, y);
        taxiMap.roadConstruction(x, y);
        map.show(p);
        for (c in cars) {
          if (cars[c].x == x && cars[c].y == y) {
            delete cars[c];
          } else {
            cars[c].show(p);
          }
        }
        break;

      case "Taxi placement":
        let taxiID = carsIDs.length;

        if (map.grid[x][y] != true) break;
        cars[taxiID] = placeTaxi(taxiID, x, y);
        taxiCars[taxiID] = placeTaxi(taxiID, x, y);
        carsIDs.push(taxiID);
        tmpCars.push(cars[taxiID]);
        cars[taxiID].show(p);
        break;
    }
  };

  function placeTaxi(id, x, y) {
    return new Car(p, id, x, y);
  }


  function saveData() {
    let data = {};
    data.maxUpdates = inputMaxUpdates.value();
    data.mapSize = inputMapSize.value();
    data.minPassSpawn = inputPassSpawnMin.value();
    data.maxPassSpawn = inputPassSpawnMax.value();
    data.enableHotspots = hotspotsCheckbox.checked();
    data.updateNumDestHotspot = p.int(hotspotDestUpdateNumber.value());
    data.updateNumLocHotspot = p.int(hotspotLocUpdateNumber.value());
    data.hotspotPassNumber = p.int(hotspotPassNumber.value());
    data.hotspotPositionX = hotspotPositionX;
    data.hotspotPositionY = hotspotPositionY;
    data.framerate = p.int(inputFramerate.value());
    data.no_visualization = noVisualizationCheckBox.checked();
    data.taxiSpawnerInp = taxiSpawnerInp.value();

    let carsToSave = {};
    for (let car of Object.values(cars)) {
      const carToSave = {
        id: car.id,
        x: car.x,
        y: car.y,
      };
      carsToSave[carToSave.id] = carToSave;
    }
    data.cars = carsToSave;
    data.carsIDs = carsIDs;
    data.mapSize = inputMapSize.value();
    data.grid = map.grid;
    p.saveJSON(data, "data.json");
  }

  // spawns taxis based on the spawn taxi input field
  function spawnAmountOfTaxis(amount) {
    for (let i = 0; i < amount; i++) {
      cars[carsIDs.length] = new Car(p, carsIDs.length);
      taxiCars[carsIDs.length] = new Car(
        p,
        carsIDs.length,
        cars[carsIDs.length].x,
        cars[carsIDs.length].y
      );
      carsIDs.push(carsIDs.length);
    }
  }

  function refreshMapSize() {
    if (simulationStarted) {
      return;
    }
    cellNum = inputMapSize.value();
    cellSize = size / cellNum;
    map = new City(cellNum);
    map.show(p);
    taxiMap = new City(cellNum);
    taxiMap.show(p);
  }


  function onChange(event) {
    let reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }


  function onReaderLoad(event){
      let obj = JSON.parse(event.target.result);
      loadConfig(obj);
  }


  function loadConfig(data){
    inputMapSize.value(data.mapSize);
    refreshMapSize();
    map.grid = data.grid;
    map.show(p);
    taxiMap.grid = JSON.parse(JSON.stringify(data.grid));
    taxiMap.show(p);
    // console.log(JSON.stringify(data.grid));
    // console.log(JSON.stringify(map));
    // console.log(JSON.stringify(taxiMap));

    hotspotsCheckbox.checked(data.enableHotspots);
    hotspotDestUpdateNumber.value(data.updateNumDestHotspot);
    hotspotLocUpdateNumber.value(data.updateNumLocHotspot);
    hotspotPassNumber.value(data.hotspotPassNumber);
    hotspotPositionX = data.hotspotPositionX;
    hotspotPositionY = data.hotspotPositionY;
    inputFramerate.value(data.framerate);
    noVisualizationCheckBox.checked(data.no_visualization);
    taxiSpawnerInp.value(data.taxiSpawnerInp);
    if (hotspotsCheckbox.checked()){
      showHotspot(p);
    }

    for (let carObj of Object.values(data.cars)){
      const car = new Car(p, carObj.id, carObj.x, carObj.y);
      const taxiCar = new Car(p, carObj.id, carObj.x, carObj.y);
      cars[car.id] = car;
      taxiCars[taxiCar.id] = taxiCar;
      car.show(p);
      taxiCar.show(p);
    }
    carsIDs = data.carsIDs;
    inputMaxUpdates.value(data.maxUpdates); // data.inputMaxUpdates
    inputPassSpawnMax.value(data.maxPassSpawn);
    inputPassSpawnMin.value(data.minPassSpawn);
  }


  function startSimulation() {
    updatesCounter = 0;
    simulationStarted = true;
    resetChart(taxiChart);
    resetChart(chart);
    resetChart(passengersServedChart);
    resetChart(passengersTimeSavedChart);
    resetChart(profitChart);

    for (let x = 0; x < map.grid.length; x++) {
      for (let y = 0; y < map.grid[x].length; y++) {
        if (map.grid[x][y]) {
          road.push([x, y]);
        }
      }
    }

    // Spawns taxis
    carsNumber = p.int(taxiSpawnerInp.value());

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
        invertedMap[invertedMap.length - 1].push(p.abs(col - 1));
      }
    }

    // before making new init requests close all existing connections
    if (eventSource) eventSource.close();

    // send the map to the backend
    p.httpPost(
      `${url}/init`,
      "json",
      {
        grid: invertedMap,
        cars: tmpCars.map((c) => {
          return { x: c.x, y: c.y, id: c.id };
        }),
        maxUpdates: p.int(inputMaxUpdates.value()),
        framerate: p.int(inputFramerate.value()),
        no_visualization: noVisualizationCheckBox.checked(),
        minPassSpawn: p.int(inputPassSpawnMin.value()),
        maxPassSpawn: p.int(inputPassSpawnMax.value()),
        enableHotspots: hotspotsCheckbox.checked(),
        updateNumDestHotspot: p.int(hotspotDestUpdateNumber.value()),
        updateNumLocHotspot: p.int(hotspotLocUpdateNumber.value()),
        hotspotPassNumber: p.int(hotspotPassNumber.value()),
        xHotspotLoc: hotspotPositionX,
        yHotspotLoc: hotspotPositionY,
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
};

let p51 = new p5(simulation1, "c1");
