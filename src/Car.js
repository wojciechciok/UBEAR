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
    this.id = id;
    this.path = [];
    this.movement = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const possibilities = this.getValidMoves();
    this.dir = random(possibilities);
  }
  show() {
    push();
    translate((this.x + 0.5) * cell_size, (this.y + 0.5) * cell_size);
    const rot =
      abs((PI / 2 + (PI / 2) * this.dir[1]) * this.dir[1]) +
      (PI / 2) * this.dir[0];
    rotate(rot);
    fill(255, 255, 0);
    imageMode(CENTER);
    image(carImg, 0, 0, cell_size, cell_size);
    pop();
  }
  move() {
    if (this.path && this.path.length > 0) {
      const next = path[0];
      const curr = [this.x, this.y];
      this.dir = [next[0] - curr[0], next[1] - curr[1]];
      this.x = next[0];
      this.y = next[1];
    }
  }
  randomMove() {
    const possibilities = this.getValidMoves();
    const tmp = [];
    for (let possibility of possibilities) {
      if (
        possibility[0] != this.dir[0] * -1 ||
        possibility[1] != this.dir[1] * -1
      ) {
        tmp.push(possibility);
      }
    }
    if (tmp.length == 0) {
      this.dir = possibilities[0];
    } else {
      this.dir = random(tmp);
    }
    this.x += this.dir[0];
    this.y += this.dir[1];
  }
  getValidMoves() {
    const possibilities = [];
    if (this.x + 1 < cell_num && map.grid[this.x + 1][this.y]) {
      possibilities.push(this.movement.right);
    }
    if (this.x - 1 >= 0 && map.grid[this.x - 1][this.y]) {
      possibilities.push(this.movement.left);
    }
    if (this.y + 1 < cell_num && map.grid[this.x][this.y + 1]) {
      possibilities.push(this.movement.down);
    }
    if (this.y - 1 >= 0 && map.grid[this.x][this.y - 1]) {
      possibilities.push(this.movement.up);
    }
    return possibilities;
  }
}
