class Car {
  constructor(id, x, y) {
    if (x == undefined) {
      const pos = getRandomPosition();
      this.x = pos[0];
      this.y = pos[1];
    } else {
      this.x = x;
      this.y = y;
    }
    this.color = color(random(255), random(255), random(255), 60);
    this.id = id;
    this.path = [];
    this.occupied = false;
    // this.passenger holds false or object of a Passenger class - js is fun!
    this.passenger = false;
    // legal moves
    this.movement = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const possibilities = this.getValidMoves();
    // car spawns facing random direction
    this.dir = random(possibilities);
  }
  // drawing a car
  show() {
    // mambo jumbo for correct orientation of the car image
    push();
    translate((this.x + 0.5) * cellSize, (this.y + 0.5) * cellSize);
    const rot =
      abs((PI / 2 + (PI / 2) * this.dir[1]) * this.dir[1]) +
      (PI / 2) * this.dir[0];
    rotate(rot);
    fill(255, 255, 0);
    imageMode(CENTER);
    image(carImg, 0, 0, cellSize, cellSize);
    pop();
    // draw the whole path
    for (let p of this.path) {
      fill(this.color);
      square(p[0] * cellSize, p[1] * cellSize, cellSize);
    }
  }
  // moving a car
  move() {
    // move only if you have a non-empty path
    if (this.path && this.path.length > 0) {
      // if you are on the same place as passenger, pick him up
      if (this.x == this.passenger.x && this.y == this.passenger.y) {
        this.passenger.inCar = true;
      }
      // figure out which way is the car facing
      const next = this.path[0];
      const curr = [this.x, this.y];
      this.dir = [next[0] - curr[0], next[1] - curr[1]];
      // next path cell is now current
      this.x = next[0];
      this.y = next[1];
      this.path.shift();
    } else {
      // if no path make sure car is not occupied
      this.occupied = false;
      // if car still has a passenger delete
      if (this.passenger) {
        passengers = passengers.filter((p) => p.id != this.passenger.id);
        this.passenger = false;
      }
    }
  }

  // gets valid cells to move to by a car
  getValidMoves() {
    const possibilities = [];
    if (this.x + 1 < cellNum && map.grid[this.x + 1][this.y]) {
      possibilities.push(this.movement.right);
    }
    if (this.x - 1 >= 0 && map.grid[this.x - 1][this.y]) {
      possibilities.push(this.movement.left);
    }
    if (this.y + 1 < cellNum && map.grid[this.x][this.y + 1]) {
      possibilities.push(this.movement.down);
    }
    if (this.y - 1 >= 0 && map.grid[this.x][this.y - 1]) {
      possibilities.push(this.movement.up);
    }
    return possibilities;
  }
}
