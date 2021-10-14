class Map {
  constructor(size) {
    // map is just a grid of 1's an 0's
    this.size = size;
    this.grid = [];
    for (let i = 0; i < this.size; i++) {
      this.grid.push([]);
      for (let j = 0; j < this.size; j++) {
        if (i % density == 0 || j % density == 0) {
          this.grid[i].push(1);
          road.push([j, i]);
        } else {
          this.grid[i].push(0);
        }
      }
    }
  }
  // method for drawing the map
  show() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid.length; j++) {
        noStroke();
        if (this.grid[i][j]) fill(50);
        else fill(150);
        square(i * cellSize, j * cellSize, cellSize);
      }
    }
  }
}
