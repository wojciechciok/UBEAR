class Passenger {
  constructor(id, x, y, destX, destY) {
    if (destX == undefined) {
      const dest = getRandomPosition();
      this.destX = dest[0];
      this.destY = dest[1];
    }
    if (x == undefined) {
      const pos = getRandomPosition();
      this.x = pos[0];
      this.y = pos[1];
    } else {
      this.x = x;
      this.y = y;
      this.destX = destX;
      this.destY = destY;
    }
    this.inCar = false;
    this.id = id;
    this.color = color(0, 30, 255);
  }
  show() {
    if (this.inCar) return;
    const pref_pos = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const sec_pos = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    let drawX = -1;
    let drawY = -1;
    for (let c of pref_pos) {
      let testX = this.x + c[0];
      let testY = this.y + c[1];
      if (
        testX < cell_num &&
        testX > 0 &&
        testY < cell_num &&
        testY > 0 &&
        !map.grid[testX][testY]
      ) {
        drawX = testX;
        drawY = testY;
        break;
      }
    }
    if (drawX < 0) {
      for (let c of sec_pos) {
        let testX = this.x + c[0];
        let testY = this.y + c[1];
        if (
          testX < cell_num &&
          testX > 0 &&
          testY < cell_num &&
          testY > 0 &&
          !map.grid[testX][testY]
        ) {
          drawX = testX;
          drawY = testY;
          break;
        }
      }
    }

    noFill();
    stroke(this.color);
    strokeWeight(3);
    circle((drawX + 0.5) * cell_size, (drawY + 0.5) * cell_size, cell_size - 4);
    image(
      passengerImg,
      drawX * cell_size,
      drawY * cell_size,
      cell_size,
      cell_size
    );
  }
  wait() {
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    this.color = color(r + 1, g, b - 1);
  }
}
