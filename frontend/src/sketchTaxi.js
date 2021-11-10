// global object of cars see Car.js
let taxiCars = {};
// global object of passengers see Passenger.js
let taxiPassengers = {};
let taxiPassengersIDs = [];

let taxiMap;

//////////////////////////
// REGULAR MODEL CANVAS //
//////////////////////////

let simulation2 = function (p) {
  // setup - this function is called once at the beginning of the program
  p.setup = () => {
    p.createCanvas(size, size);
    // initialize map
    taxiMap = new City(cellNum);
    // initial map draw
    taxiMap.show(p);
  };
  p.draw = () => {
    // draw the map
    taxiMap.show(p);

    if (updatesCounter <= 0) {
      p.fill(0, 0, 0, 170);
      p.square(0, 0, size);
      return;
    }
    // draw all cars
    for (let carID of carsIDs) {
      taxiCars[carID].show(p);
    }
    // draw all passengers
    for (let passengerID of taxiPassengersIDs) {
      taxiPassengers[passengerID].show(p);
    }
  };
};

let p52 = new p5(simulation2, "c2");
