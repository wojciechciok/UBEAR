class Car {
  constructor(p, id, x, y) {
    if (x == undefined) {
      const pos = getRandomPosition();
      this.x = pos[0];
      this.y = pos[1];
    } else {
      this.id = id;
      this.x = x;
      this.y = y;
    }
    this.color = p.color(p.random(255), p.random(255), p.random(255), 60);
    this.id = id;
    this.path = [];
    this.occupied = false;
    this.passengersList = [];
    this.dir = [0, -1];
  }
  // drawing a car
  show(p) {
    // mambo jumbo for correct orientation of the car image
    if (this.path.length > 0) {
      const next = this.path[0];
      const curr = [this.x, this.y];
      this.dir = [next[0] - curr[0], next[1] - curr[1]];
    }

    p.push();
    p.translate((this.x + 0.5) * cellSize, (this.y + 0.5) * cellSize);
    const rot =
      p.abs((p.PI / 2 + (p.PI / 2) * this.dir[1]) * this.dir[1]) +
      (p.PI / 2) * this.dir[0];
    p.rotate(rot);
    p.fill(255, 255, 0);
    p.imageMode(p.CENTER);
    p.image(carImg, 0, 0, cellSize, cellSize);
    p.pop();
    // draw the whole path
    for (let pos of this.path) {
      p.fill(this.color);
      p.square(pos[0] * cellSize, pos[1] * cellSize, cellSize);
    }
  }
  update(x, y, path, passengersList) {
    this.x = x;
    this.y = y;
    this.path = path;
    this.passengersList = passengersList;
  }
}
