var tetris = {
  colors: ['black', 'red', 'green', 'blue', 'yellow', 'magenta', 'cyan'],
  colSize: 'abcdefghijklmnopqrst',
  xLim: 10,
  yLim: 20,
  speed: 600,
  running: false,
  grid: {grid: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ],

        getPos: function(x, y) {
          if (y + 1 < 0 || x < 0)
            return 0;
          return this.grid[y + 1][x];
        },

        setPos: function(x, y, state) {
          if (y >= 0)
            this.grid[y + 1][x] = state;
        },

        clearAll: function() {
          for (var y = 0; y < tetris.yLim; y++) {
            for (var x = 0; x < tetris.xLim; x++)
              this.setPos(x, y, 0);
          }
          // TODO: tyhjennä grid väreistä
        },

        stopBlock: function(block) {
          for (var i = 0; i < tetris.blockTypes[block.type][block.rotation].length; i++) {
            this.setPos(parseInt(tetris.blockTypes[block.type][block.rotation][i][0]) + parseInt(block.pos.x),
                        parseInt(tetris.blockTypes[block.type][block.rotation][i][1]) + parseInt(block.pos.y),
                         1);
          }
        },

        deleteRow: function(row) {
          this.grid.splice(row, 1);
          this.grid.unshift([0,0,0,0,0,0,0,0,0,0]);
          row--;
          var i, j;
          for (i = row; i > 0; i--) {
            for (j = 0; j < 10; j++) {
              var shiftedCol = $(['#', tetris.colSize[i - 1], j.toString()].join('')).attr('class');
              $(['#', tetris.colSize[i], j.toString()].join('')).removeClass().addClass(shiftedCol.toString());
            }
          }
          for (j = 0; j < 10; j++)
            $(['#', tetris.colSize[0], j.toString()].join('')).removeClass().addClass('white');
        }
      },
  blockTypes:
  // every different orientation of every shape, ordered by order of orientations (basic pose is first). Presented as relative coordinates to the pos of the block
              [
                // Z
                [
                  [[-1,0], [0,0], [0,1],[1,1]],
                  [[1,-1], [0,0], [1,0], [0,1]]
                ],
                // S
                [
                  [[0,0],[1,0],[-1,1],[0,1]],
                  [[0,-1],[0,0],[1,0],[1,1]]
                ],
                // Square
                [
                  [[0,0],[1,0],[0,1],[1,1]]
                ],
                // I
                [
                  [[-1,0],[0,0],[1,0],[2,0]],
                  [[0,-1],[0,0],[0,1],[0,2]]
                ],
                // T
                [
                  [[-1,0],[0,0],[1,0],[0,1]],
                  [[0,-1],[0,0],[0,1],[1,0]],
                  [[0,-1],[-1,0],[0,0],[1,0]],
                  [[0,-1],[0,0],[-1,0],[0,1]]
                ],
                // L
                [
                  [[-1,0],[0,0],[1,0],[-1,1]],
                  [[0,-1],[0,0],[0,1],[1,1]],
                  [[1,-1],[-1,0],[0,0],[1,0]],
                  [[-1,-1],[0,-1],[0,0],[0,1]]
                ],
                // J
                [
                  [[-1,-1],[-1,0],[0,0],[1,0]],
                  [[0,-1],[0,0],[-1,1],[0,1]],
                  [[-1,0],[0,0],[1,0],[1,1]],
                  [[0,-1],[1,-1],[0,0],[0,1]]
                ]
              ],
  score: 0,
  nextBlock: 0,
  curBlock: {type: 0, color: 0, rotation: 0, pos: {x: 4, y: 0}},
  level: 1,
  lines: 0,

  init: function() {
    // Initialize the tetris
    $('table').attr('class','');
    $('#gameOver').attr('class','hidden');
    tetris.score = 0;
    tetris.level = 1;
    tetris.lines = 0;
  	tetris.speed = 600;
    tetris.grid.clearAll();
    $('#score').text(tetris.score.toString());
    $('#level').text(tetris.level.toString());
    $('#lines').text(tetris.lines.toString());
    $('td').each(function() {
      $(this).removeClass().addClass('white');
    });
    tetris.clearNext();
    tetris.curBlock = tetris.randBlock();
    tetris.nextBlock = tetris.randBlock();
  },

  randBlock: function() {
    // Returns random index for one of the basic block types
     var rand = Math.floor(Math.random() * (7));
     return {type: rand, color: rand, rotation: 0, pos: {x: 4, y: 0}};
  },

  outOfBounds: function(coord, x, y) {
    // Checks if provided coordinates are out of bounds (excluding the top of grid)
    if (coord[0] + x < 0 || coord[0] + x >= tetris.xLim)
      return true;
    if (coord[1] + y >= tetris.yLim)
      return true;
    return false;
  },

  isCollision: function(coordList, x, y) {
    // Checks if any coordinate in the provided coordinate list is out of bounds or overlaps with an already filled tile
    for (var key in coordList) {
      var coord = coordList[key];
      if (tetris.outOfBounds(coord, x, y))
        return true;
      else if (tetris.grid.getPos(x + coord[0], y + coord[1]) === 1)
        return true;
    }
    return false;
  },

  clearCur: function() {
    // Clears the currently active block from screen
    for (var key in this.blockTypes[this.curBlock.type][this.curBlock.rotation]) {
      var coord = this.blockTypes[this.curBlock.type][this.curBlock.rotation][key];
      $(['#', this.colSize[coord[1] + this.curBlock.pos.y], (coord[0] + this.curBlock.pos.x).toString()].join('')).removeClass().addClass('white');
    }
  },

  clearNext: function() {
    // Clears the next from side panel
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        $(['#x', i.toString(), j.toString()].join('')).removeClass().addClass('white');
      }
    }
  },

  drawCur: function() {
    // Draws the currently active block
    for (var key in this.blockTypes[this.curBlock.type][this.curBlock.rotation]) {
      var coord = this.blockTypes[this.curBlock.type][this.curBlock.rotation][key];
      $(['#', this.colSize[coord[1] + this.curBlock.pos.y], (coord[0] + this.curBlock.pos.x).toString()].join('')).removeClass().addClass(this.colors[this.curBlock.color]);
    }
  },

  drawNext: function() {
    // Draws the block next up to the side panel
    for (var key in this.blockTypes[this.nextBlock.type][0]) {
      var coord = this.blockTypes[this.nextBlock.type][0][key];
      $(['#x', (coord[1] + 1).toString(), (coord[0] + 1).toString()].join('')).removeClass().addClass(this.colors[this.nextBlock.color]);
    }
  },

  moveLeft: function() {
    tetris.clearCur();
    tetris.curBlock.pos.x--;
    if (tetris.isCollision(tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation], tetris.curBlock.pos.x, tetris.curBlock.pos.y))
      tetris.curBlock.pos.x++;
    tetris.drawCur();
  },

  moveRight: function() {
    tetris.clearCur();
    tetris.curBlock.pos.x++;
    if (tetris.isCollision(tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation], tetris.curBlock.pos.x, tetris.curBlock.pos.y))
      tetris.curBlock.pos.x--;
    tetris.drawCur();
  },

  moveDown: function() {
    tetris.clearCur();
    tetris.curBlock.pos.y++;
    if (tetris.isCollision(tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation], tetris.curBlock.pos.x, tetris.curBlock.pos.y)) {
      tetris.land();
      // Check if new block ends the game
      if (tetris.isCollision(tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation], tetris.curBlock.pos.x, tetris.curBlock.pos.y )) {
        while (tetris.isCollision(tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation], tetris.curBlock.pos.x, tetris.curBlock.pos.y )) {
          tetris.curBlock.pos.y--;
        }
        var block = tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation];
        for (var i in block) {
          if (block[i][1] + tetris.curBlock.pos.y < 0) {
            tetris.endGame();
            return;
          }
        }
      }
    }
    tetris.drawCur();
  },

  rotate: function() {
    tetris.clearCur();
    tetris.curBlock.rotation = (tetris.curBlock.rotation + 1) % tetris.blockTypes[tetris.curBlock.type].length;
    if (tetris.isCollision(tetris.blockTypes[tetris.curBlock.type][tetris.curBlock.rotation], tetris.curBlock.pos.x, tetris.curBlock.pos.y)) {
      tetris.curBlock.rotation--;
      if (tetris.curBlock.rotation < 0)
        tetris.curBlock.rotation = tetris.blockTypes[tetris.curBlock.type].length - 1;
    }
    tetris.drawCur();
  },

  checkFullRow: function() {
    var count = 0;
    for (var i = 0; i < tetris.grid.grid.length; i++) {
      var sum = 0;
      $.each(tetris.grid.grid[i], function() {
        sum += (this);
      });
      if (sum === tetris.grid.grid[i].length) {
        count++;
        tetris.grid.deleteRow(i);
        i--;
      }
    }
    switch (count) {
      case 1: tetris.score += tetris.level * 40; break;
      case 2: tetris.score += tetris.level * 100; break;
      case 3: tetris.score += tetris.level * 300; break;
      case 4: tetris.score += tetris.level * 1200; break;
    }
    tetris.lines += count;

    tetris.level = Math.floor(tetris.lines / 10) + 1;
    // Set interval speed
    window.clearInterval(tetris.timer);
    tetris.speed = 600 - tetris.level;
    tetris.timer = window.setInterval(tetris.moveDown, tetris.speed);
    $('#score').text(tetris.score.toString());
    $('#level').text(tetris.level.toString());
    $('#lines').text(tetris.lines.toString());
  },

  land: function() {
    tetris.curBlock.pos.y--;
    tetris.grid.stopBlock(tetris.curBlock);
    tetris.drawCur();
    tetris.checkFullRow();
    tetris.curBlock = tetris.nextBlock;
    tetris.clearNext();
    tetris.nextBlock = tetris.randBlock();
    tetris.drawNext();
  },

	keyPress: function(e) {
    if (tetris.running) {
  		switch ( e.charCode || e.keyCode ) {
        case 87: case 119: tetris.rotate(); break; // W
        case 83: case 115: tetris.moveDown(); break; // S
        case 65: case 97: tetris.moveLeft(); break; // A
  			case 68: case 100: tetris.moveRight(); break; // D
  		}
  }
		return false;
	},

  run: function() {
    tetris.running = true;
	  tetris.drawCur();
    tetris.drawNext();
		tetris.timer = window.setInterval(tetris.moveDown, tetris.speed);
  },

  pause: function() {
    tetris.running = false;
    window.clearInterval(tetris.timer);
    tetris.timer = null;
  },

  endGame: function() {

    tetris.pause();
    $('#gameOver').attr('class','fade-in');
    $('#startbtn').attr('class', '');
    $('#pausebtn').attr('class','hidden');
    $('#continuebtn').attr('class','hidden');
    $('#stopbtn'). attr('class','hidden');
    // Blur the tetris grid if game is lost
    $('table').attr('class','fade-out');
    $('table').attr('class','fade-out');
  }

};

$(document).ready(function() {
  if ($.browser == 'msie')
    $(document).keypress(tetris.keyPress);
  else
    $(window).keypress(tetris.keyPress);
  $('#startbtn').click(function() {
    tetris.init();
    tetris.run();
    $(this).attr("class", "hidden");
    $('#pausebtn').attr('class', '');
    $('#stopbtn').attr('class', '');
  });
  $('#pausebtn').click(function() {
  	tetris.pause();
  	$(this).attr("class", "hidden");
  	$('#continuebtn').attr('class', '');
  });
  $('#continuebtn').click(function() {
    tetris.run();
    $(this).attr("class", "hidden");
    $('#pausebtn').attr('class','');
  });
  $('#stopbtn').click(function() {
    tetris.endGame();
    $(this).attr("class", "hidden");
  });
  tetris.init();
});
