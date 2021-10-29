// backend ulr
let url = " http://localhost:105";

// P5 components
let sliderMaxUpdates;
let sliderCarNumber;
//Passanger spawn minimum

let inputPassangerSpawnMin;
let inputPassangerSpawnMax;


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
const carsIDs = [];
// global object of passengers see Passenger.js
let passengers = {};
let passengersIDs = [];
// helper array of cells which are road
let road = [];

// vars for images
let carImg;
let passengerImg;

// Start Button
let button;

// Simuation Started flag
let simulationStarted = false;

// loading images
function preload() {
  carImg = loadImage("../assets/taxi.png");
  passengerImg = loadImage("../assets/passenger.png");
}

// setup - this function is called once at the beginning of the program

var paragraphCarNumber;
var paragraphMaxUpdates;
var carSliderValue;
var updatesSliderValue;


function setup() {

  //Number updates slider
  
  createCanvas(size, size);
  paragraphMaxUpdates = createP('Max Updates');
  paragraphMaxUpdates.position(800,0);
  sliderMaxUpdates = createSlider(0, 255, 100); //createSlider(min, max, [value], [step])
  sliderMaxUpdates.position(900, 16);
  sliderMaxUpdates.style('width', '80px');
  updatesSliderValue = createP(sliderMaxUpdates.value())
  updatesSliderValue.position(1000,0)

 
  // initialize map


  map = new Map(cellNum);

  map.show();

  // Create Button
  button = createButton("Start Simulation");
  button.position(0, size + 1);
  button.mousePressed(startSimulation);
}

function draw(){
  updatesSliderValue.html(sliderMaxUpdates.value())
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
  map.roadConstruction(x, y);
  map.show();
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
  // backend needs 1 when frontend has zeros an vice versa
  const invertedMap = [];
  for (let row of map.grid) {
    invertedMap.push([]);
    for (let col of row) {
      invertedMap[invertedMap.length - 1].push(abs(col - 1));
    }
  }

  // create cars
  const tmpCars = [];
  for (let i = 0; i < carsNumber; i++) {
    cars[i] = new Car(i);
    carsIDs.push(i);
    tmpCars.push(cars[i]);
  }

  // send the map to the backend
  httpPost(
    `${url}/init`,
    "json",
    {
      grid: invertedMap,
      cars: tmpCars.map((c) => {
        return { x: c.x, y: c.y, id: c.id };
      }),
      maxUpdates: sliderMaxUpdates.value(),
      
    },
    function (result) {
      // if successful allow animation
      const evtSource = new EventSource(`${url}/cars/positions`);
      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.finished){
          alert("Simulation finished");
          evtSource.close();
        }
        update(data);
      };
    },
    function (error) {
      console.log(error);
    }
  );
}
