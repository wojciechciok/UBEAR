let url = "http://192.168.1.43:105";

const size = 600;
const cell_num = 21;
const density = 5;
const cell_size = size / cell_num;
let map;
let cars = [];
let passengers = [];
let road = [];

let carImg;
let passengerImg;
function preload() {
  carImg = loadImage("../assets/taxi.png");
  passengerImg = loadImage("../assets/passenger.png");
}

function setup() {
  createCanvas(size, size);
  map = new Map(cell_num, cell_size);
  cars.push(new Car(0));
  cars.push(new Car(1));
  cars.push(new Car(2));
  cars.push(new Car(3));

  // passengers.push(new Passenger(0));
  noLoop();
  const invertedMap = [];
  for (let row of map.grid) {
    invertedMap.push([]);
    for (let col of row) {
      invertedMap[invertedMap.length - 1].push(abs(col - 1));
    }
  }
  httpPost(
    `${url}/init`,
    "json",
    {
      grid: invertedMap,
    },
    function (result) {
      loop();
    },
    function (error) {
      console.log(error);
    }
  );
  frameRate(10);
}

function draw() {
  map.show();
  for (let car of cars) {
    car.show();
    car.move();
  }
  for (let passenger of passengers) {
    passenger.show();
    passenger.wait();
  }
}

function getRandomPosition() {
  return random(road);
}

let passengerId = 0;
function mousePressed() {
  const passenger = new Passenger(passengerId);
  passengerId += 1;
  passengers.push(passenger);
  httpPost(
    `${url}/get-path`,
    "json",
    {
      passenger: {
        id: passenger.id,
        x: passenger.x,
        y: passenger.y,
        destX: passenger.destX,
        destY: passenger.destY,
      },
      cars: cars
        .filter((c) => !c.occupied)
        .map((c) => {
          return { id: c.id, x: c.x, y: c.y };
        }),
    },
    function (result) {
      cars[result.car.id].passenger = passenger;
      cars[result.car.id].occupied = true;
      cars[result.car.id].path = result.shortest_path;
      console.log(result);
    },
    function (error) {
      console.log(error);
    }
  );
}
