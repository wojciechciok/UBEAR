class Passenger {
  constructor(p, id, x, y, destX, destY) {
    this.x = x;
    this.y = y;
    this.destX = destX;
    this.destY = destY;
    // }
    // this.carAssigned = false;
    this.inCar = false;
    this.id = id;
    this.color = p.color(p.random(255), p.random(255), p.random(255));
    this.selectPlaceForDrawing();
  }
  update(inCar) {
    this.inCar = inCar;
  }
  show(p) {
    // draw circle on destination
    p.noFill();
    p.stroke(this.color);
    p.strokeWeight(2);
    p.circle(
      (this.destX + 0.5) * cellSize,
      (this.destY + 0.5) * cellSize,
      cellSize - 4
    );
    // draw passenger only if not in car
    if (this.inCar) return;

    //draw circle on passenger
    p.noFill();
    p.stroke(this.color);
    p.strokeWeight(2);
    p.circle(
      (this.drawX + 0.5) * cellSize,
      (this.drawY + 0.5) * cellSize,
      cellSize - 4
    );
    // draw passenger image
    p.image(
      passengerImg,
      this.drawX * cellSize,
      this.drawY * cellSize,
      cellSize,
      cellSize
    );
  }

  // complicated but just chooses place on pavement for drawing the passenger
  selectPlaceForDrawing() {
    const prefPos = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const secPos = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    this.drawX = -1;
    this.drawY = -1;
    for (let c of prefPos) {
      let testX = this.x + c[0];
      let testY = this.y + c[1];
      if (
        testX < cellNum &&
        testX > 0 &&
        testY < cellNum &&
        testY > 0 &&
        !map.grid[testX][testY]
      ) {
        this.drawX = testX;
        this.drawY = testY;
        break;
      }
    }
    if (this.drawX < 0) {
      for (let c of secPos) {
        let testX = this.x + c[0];
        let testY = this.y + c[1];
        if (
          testX < cellNum &&
          testX > 0 &&
          testY < cellNum &&
          testY > 0 &&
          !map.grid[testX][testY]
        ) {
          this.drawX = testX;
          this.drawY = testY;
          break;
        }
      }
    }
  }
}
