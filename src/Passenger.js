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
    this.id = id;
    this.color = color(0, 30, 255);
  }
  show() {
    let drawX = this.x;
    let drawY = this.y;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let testX = drawX + i;
        let testY = drawY + j;
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
    if (this.x + 1 < cell_num && !map.grid[this.x + 1][this.y]) {
      drawX = this.x + 1;
    } else if (this.x - 1 >= 0 && !map.grid[this.x - 1][this.y]) {
      drawX = this.x - 1;
    }
    if (this.y + 1 < cell_num && !map.grid[this.x][this.y + 1]) {
      drawY = this.y + 1;
    } else if (this.y - 1 >= 0 && !map.grid[this.x][this.y - 1]) {
      drawY = this.y - 1;
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
