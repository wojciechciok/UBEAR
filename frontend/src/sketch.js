// backend ulr
let url = "http://192.168.1.31:105";

// size of the map (width and height)
const size = 700;
// number of cells in a row
const cellNum = 41;
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
let cars = [];
// global object of passengers see Passenger.js
let passengers = [];
// helper array of cells which are road
// let road = [];

// flag for fetching car paths - exclusive access to endpoint
// let calculating = false;

// vars for images
let carImg;
let passengerImg;

// loading images
function preload() {
  carImg = loadImage("../assets/taxi.png");
  passengerImg = loadImage("../assets/passenger.png");
}

// setup - this function is called once at the beginning of the program
function setup() {
  createCanvas(size, size);
  // initialize map
  map = new Map(cellNum);
  // create cars
  for (let i = 0; i < carsNumber; i++) {
    cars.push(new Car(i));
  }
  // backend needs 1 when frontend has zeros an vice versa
  const invertedMap = [];
  for (let row of map.grid) {
    invertedMap.push([]);
    for (let col of row) {
      invertedMap[invertedMap.length - 1].push(abs(col - 1));
    }
  }
  // send the map to the backend
  httpPost(
    `${url}/init`,
    "json",
    {
      grid: invertedMap,
      cars: cars.map((c) => {
        return { x: c.x, y: c.y, id: c.id };
      }),
    },
    function (result) {
      // if successful allow animation
      const evtSource = new EventSource(`${url}/cars/positions`);
      evtSource.onmessage = (event) => {
        console.log(event.data);
        update();
      };
    },
    function (error) {
      console.log(error);
    }
  );
}

// main animation loop
// function draw() {
//   // draw the map
//   map.show();
//   // draw and move all cars
//   for (let car of cars) {
//     car.show();
//     car.move();
//   }
//   // draw all passengers
//   for (let passenger of passengers) {
//     passenger.show();
//   }
//   // check if any passengers wait for a car
//   // checkForWaitingPassengers();
// }

function update() {
  map.show();
  // draw all cars
  for (let car of cars) {
    car.show();
  }
  // draw all passengers
  for (let passenger of passengers) {
    passenger.show();
  }
}

// helper function for getting a random place on the road
// function getRandomPosition() {
//   return random(road);
// }

// let passengerId = 0;

// called when the spacebar is clicked
// function keyPressed() {
//   if (keyCode !== 32) return;
//   // if busy then no
//   if (calculating) return;
//   // create new passenger
//   const passenger = new Passenger(passengerId);
//   passengers.push(passenger);
//   // assign a car to passenger if available
//   getCarFor(passenger);
//   passengerId += 1;
// }

// assign a car to passenger if available
// function getCarFor(passenger) {
//   // flag up
//   calculating = true;
//   // check if there are availale cars
//   const available = cars.filter((c) => !c.occupied);
//   if (available.length <= 0) {
//     passenger.carAssigned = false;
//     calculating = false;
//     return;
//   }
//   // ask backend for assigning a car and a path
//   // sending passenger info and available cars
//   httpPost(
//     `${url}/get-path`,
//     "json",
//     {
//       passenger: {
//         id: passenger.id,
//         x: passenger.x,
//         y: passenger.y,
//         destX: passenger.destX,
//         destY: passenger.destY,
//       },
//       cars: available.map((c) => {
//         return { id: c.id, x: c.x, y: c.y };
//       }),
//     },
//     // if successful assign passenger to selected car
//     // assign path to car
//     function (result) {
//       if (cars[cars[result.car.id].occupied]) {
//         passenger.carAssigned = false;
//       } else {
//         passenger.carAssigned = true;
//         cars[result.car.id].occupied = true;
//         cars[result.car.id].passenger = passenger;
//         cars[result.car.id].path = result.shortest_path;
//       }
//       // flag down
//       calculating = false;
//     },
//     function (error) {
//       calculating = false;
//       console.log(error);
//     }
//   );
// }

// // take care of passengers who don't have their rides yet
// function checkForWaitingPassengers() {
//   const waiting = passengers.filter((p) => p.carAssigned == false);
//   if (waiting.length > 0) {
//     getCarFor(waiting[0]);
//   }
// }
