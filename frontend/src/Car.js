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
    this.passengersList = [];
    this.dir = [0, -1];
  }
  // drawing a car
  show() {
    // mambo jumbo for correct orientation of the car image
    if (this.path.length > 0) {
      const next = this.path[0];
      const curr = [this.x, this.y];
      this.dir = [next[0] - curr[0], next[1] - curr[1]];
    }

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
  update(x, y, path, passengersList) {
    this.x = x;
    this.y = y;
    this.path = path;
    this.passengersList = passengersList;
  }
}
