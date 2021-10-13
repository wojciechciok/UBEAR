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
  passengers.push(new Passenger());
  passengers.push(new Passenger());
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
