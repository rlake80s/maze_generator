const gridHeight = 25;
const gridWidth = 25;

const forkRatio = 0.5
const numForkedPaths = gridHeight * gridWidth * forkRatio

// horizontal tiles
const horizontalLeftRight = 'hlr'
const horizontalRightLeft = 'hrl'
const horizontalLeftTurnUp = 'hlu'
const horizontalLeftTurnDown = 'hld'
const horizontalRightTurnUp = 'hru'
const horizontalRightTurnDown = 'hrd'
const horizontalLeftDeadEnd = 'hl|'
const horizontalRightDeadEnd = 'hr|'

// vertical tiles
const verticalUpDown = 'vud'
const verticalDownUp = 'vdu'
const verticalDownTurnLeft = 'vdl'
const verticalDownTurnRight = 'vdr'
const verticalUpTurnLeft = 'vul'
const verticalUpTurnRight = 'vur'
const verticalDownDeadEnd = 'vd-'
const verticalUpDeadEnd = 'vu-'

// horizontal forked tiles
// alphabetically sorted after direction
const horizontalLeftUpDown = 'hldu'
const horizontalLeftUpRight = 'hlru'
const horizontalLeftRightDown = 'hldr'
const horizontalRightUpDown = 'hrdu'
const horizontalRightUpLeft = 'hrlu'
const horizontalRightLeftDown = 'hrdl'
const horizontalLeftUpRightDown = 'hldru'
const horizontalRightDownLeftUp = 'hrdlu'

// vertical forked tiles
// alphabetically sorted after directions
const verticalUpLeftRight = 'vulr'
const verticalUpLeftDown = 'vudl'
const verticalUpRightDown = 'vudr'
const verticalDownLeftRight = 'vdlr'
const verticalDownLeftUp = 'vdlu'
const verticalDownRightUp = 'vdru'
const verticalUpRightDownLeft = 'vudlr'
const verticalDownLeftUpRight = 'vdlru'

const blankTile = '   '

const horizontalRightTiles = [horizontalRightLeft, horizontalRightTurnUp, horizontalRightTurnDown]
const horizontalLeftTiles = [horizontalLeftRight, horizontalLeftTurnUp, horizontalLeftTurnDown]

const verticalUpTiles = [verticalUpDown, verticalUpTurnLeft, verticalUpTurnRight]
const verticalDownTiles = [verticalDownUp, verticalDownTurnLeft, verticalDownTurnRight]

const deadEndTiles = [horizontalLeftDeadEnd, horizontalRightDeadEnd, verticalDownDeadEnd, verticalUpDeadEnd]

const horizontalLeftDirection = 'hl'
const horizontalRightDirection = 'hr'
const verticalUpDirection = 'vu'
const verticalDownDirection = 'vd'

// collect each path in the maze
let paths = []

// initialize the maze as an empty grid
let grid = [];
let defaultRow = Array(gridWidth).fill(blankTile)

for (let i = 0; i < gridHeight; i++) {
  let newRow = Object.assign([], defaultRow);
  grid.push(newRow);
}

// helper functions

function gridIncomplete() {
  for (row of grid) {
    for (tile of row) {
      if (tile === blankTile) {
        return true;
      }
    }
  }
  return false;
}

function randomEdgeTile() {
  let randRow = Math.floor(Math.random() * gridHeight)
  let randColumn = Math.floor(Math.random() * gridWidth)

  if (!(leftEdgeTile(randColumn) || rightEdgeTile(randColumn))) {
    randColumn = randColumn > ((gridWidth - 1) / 2) ? gridWidth - 1 : 0
  }
  return [randRow, randColumn]
}

function topEdgeTile(rowCoordinate) {
  return rowCoordinate - 1 < 0
}

function bottomEdgeTile(rowCoordinate) {
  return rowCoordinate + 1 >= gridHeight
}

function leftEdgeTile(columnCoordinate) {
  return columnCoordinate - 1 < 0
}

function rightEdgeTile(columnCoordinate) {
  return columnCoordinate + 1 >= gridWidth
}

function tileOptionsBasedOnStart(startingTileRow, startingTileColumn) {
  let tileOptions = [];

  if (topEdgeTile(startingTileRow)) {
    tileOptions.push(verticalUpDown);
    if (!(leftEdgeTile(startingTileColumn))) {
      tileOptions.push(verticalUpTurnLeft);
    }
    if (!(rightEdgeTile(startingTileColumn))) {
      tileOptions.push(verticalUpTurnRight);
    }
  }

  if (bottomEdgeTile(startingTileRow)) {
    tileOptions.push(verticalDownUp);
    if (!(leftEdgeTile(startingTileColumn))) {
      tileOptions.push(verticalDownTurnLeft);
    }
    if (!(rightEdgeTile(startingTileColumn))) {
      tileOptions.push(verticalDownTurnRight);
    }
  }

  if (leftEdgeTile(startingTileColumn)) {
    tileOptions.push(horizontalLeftRight);
    if (!(bottomEdgeTile(startingTileRow))) {
      tileOptions.push(horizontalLeftTurnDown);
    }
    if (!(topEdgeTile(startingTileRow))) {
      tileOptions.push(horizontalLeftTurnUp);
    }
  }

  if (rightEdgeTile(startingTileColumn)) {
    tileOptions.push(horizontalRightLeft);
    if (!(topEdgeTile(startingTileRow))) {
      tileOptions.push(horizontalRightTurnUp);
    }
    if (!(bottomEdgeTile(startingTileRow))) {
      tileOptions.push(horizontalRightTurnDown);
    }
  }

  return tileOptions;
}

function filterOutWalls(tileOptions, tileCoordinates) {
  const leftWallCrashTiles = ['hrl', 'vdl', 'vul']
  const rightWallCrashTiles = ['hlr', 'vdr', 'vur']
  const topWallCrashTiles = ['vdu', 'hlu', 'hru']
  const bottomWallCrashTiles = ['vud', 'hld', 'hrd']

  if (topEdgeTile(tileCoordinates[0])) {
    tileOptions = tileOptions.filter(function (e) {
      return !topWallCrashTiles.includes(e)
    })
  }

  if (bottomEdgeTile(tileCoordinates[0])) {
    tileOptions = tileOptions.filter(function (e) {
      return !bottomWallCrashTiles.includes(e)
    })
  }

  if (leftEdgeTile(tileCoordinates[1])) {
    tileOptions = tileOptions.filter(function (e) {
      return !leftWallCrashTiles.includes(e)
    })
  }

  if (rightEdgeTile(tileCoordinates[1])) {
    tileOptions = tileOptions.filter(function (e) {
      return !rightWallCrashTiles.includes(e)
    })
  }

  return tileOptions
}

function tileOptionsFromLastTile(newTile, lastTile) {
  let direction = getDirection(newTile, lastTile);

  // maybe also need to
  // 1 - bias straight tiles over turn tiles (say 2:1 or 3:1)
  // 2 - add fork tiles that can fork to 2 or 3 routes
  // 3 - add deadends
  const directions = {
    [horizontalLeftDirection]: horizontalLeftTiles,
    [horizontalRightDirection]: horizontalRightTiles,
    [verticalUpDirection]: verticalUpTiles,
    [verticalDownDirection]: verticalDownTiles,
  }

  let tileOptions = directions[direction]
  tileOptions = filterOutWalls(tileOptions, newTile)
  return tileOptions
}

function getNextTileOptions(tile) {
  const nextTileMap = {
    [horizontalLeftRight]: [0, 1],
    [horizontalRightLeft]: [0, -1],
    [horizontalLeftTurnUp]: [-1, 0],
    [horizontalLeftTurnDown]: [1, 0],
    [horizontalRightTurnUp]: [-1, 0],
    [horizontalRightTurnDown]: [1, 0],

    [verticalUpDown]: [1, 0],
    [verticalDownUp]: [-1, 0],
    [verticalDownTurnLeft]: [0, -1],
    [verticalDownTurnRight]: [0, 1],
    [verticalUpTurnLeft]: [0, -1],
    [verticalUpTurnRight]: [0, 1]
  }

  return nextTileMap[tile];
}

function getDirection(newCoordinates, oldCoordinates) {
  let rowChange = oldCoordinates[0] - newCoordinates[0]
  let columnChange = oldCoordinates[1] - newCoordinates[1]

  if (rowChange === -1) {
    return verticalUpDirection
  }
  if (rowChange === 1) {
    return verticalDownDirection
  }
  if (columnChange === -1) {
    return horizontalLeftDirection
  }
  if (columnChange === 1) {
    return horizontalRightDirection
  }
}

function calculateNextTileCoordinates(startingTileRow, startingTileColumn, modCoordinates) {
  let rowMod = modCoordinates[0];
  let columnMod = modCoordinates[1];

  let newRowTile = startingTileRow + rowMod;
  let newColumnTile = startingTileColumn + columnMod;

  if (newRowTile < 0 || newColumnTile < 0 || newRowTile > gridHeight || newColumnTile > gridWidth) {
    return undefined;
  }

  return [newRowTile, newColumnTile];
}

function filterNextTileCoordinates(tileRow, tileColumn, previousTile, nextTileOptions) {
  let nextTileCoordinates = []

  if (nextTileOptions === undefined) {
    console.log("nextTileOptions undefined")
    return
  }
  for (option of nextTileOptions) {
    let coordinates = calculateNextTileCoordinates(tileRow, tileColumn, option)

    if (coordinates !== undefined) {
      nextTileCoordinates.push(coordinates);
    } else {
      console.log("coordinates undefined")
    }
  }

  if (previousTile !== undefined) {
    nextTileCoordinates = nextTileCoordinates.filter(function (e) {
      return e !== [previousTile[0], previousTile[1]]
    })
  }

  return nextTileCoordinates[0]
}

function getNextTileCoordinates(tile) {
  let tileRow = tile[0]
  let tileColumn = tile[1]

  let lastTile = grid[tileRow][tileColumn]

  if (deadEndTiles.includes(lastTile)) {
    return undefined;
  }

  let nextTileMod = getNextTileOptions(lastTile);
  let nextTileCoordinates = calculateNextTileCoordinates(tileRow, tileColumn, nextTileMod)

  if (nextTileCoordinates === undefined) {
    return
  }

  let nextTile = grid[nextTileCoordinates[0]][nextTileCoordinates[1]]

  if (nextTile === blankTile) {
    return nextTileCoordinates;
  }

  return undefined;
}

function setTile(newCoordinates, previousTileCoordinates) {
  let tileOptions = tileOptionsFromLastTile(newCoordinates, previousTileCoordinates);

  if (tileOptions == undefined) {
    return
  }
  let newTile = randomTileFromOptions(tileOptions);

  grid[newCoordinates[0]][newCoordinates[1]] = newTile;
}

function randomTileFromOptions(tileOptions) {
  if (tileOptions === undefined) {
    return undefined
  }
  return tileOptions[Math.floor(Math.random() * tileOptions.length)]
}

function stringToImageTileMapper(tile) {
  const imageMap = {
    [horizontalLeftRight]: 'tiles/horizontal_straight.png',
    [horizontalRightLeft]: 'tiles/horizontal_straight.png',
    [horizontalLeftTurnUp]: 'tiles/left_up.png',
    [horizontalLeftTurnDown]: 'tiles/left_down.png',
    [horizontalRightTurnUp]: 'tiles/right_up.png',
    [horizontalRightTurnDown]: 'tiles/right_down.png',
    [verticalUpDown]: 'tiles/vertical_straight.png',
    [verticalDownUp]: 'tiles/vertical_straight.png',
    [verticalDownTurnLeft]: 'tiles/left_down.png',
    [verticalDownTurnRight]: 'tiles/right_down.png',
    [verticalUpTurnLeft]: 'tiles/left_up.png',
    [verticalUpTurnRight]: 'tiles/right_up.png',
    [blankTile]: 'tiles/blank.png',
    [horizontalLeftUpDown]: 'tiles/vertical_straight_left.png',
    [horizontalLeftUpRight]: 'tiles/horizontal_straight_up.png',
    [horizontalLeftRightDown]: 'tiles/horizontal_straight_down.png',
    [horizontalRightUpDown]: 'tiles/vertical_straight_right.png',
    [horizontalRightUpLeft]: 'tiles/horizontal_straight_up.png',
    [horizontalRightLeftDown]: 'tiles/horizontal_straight_down.png',
    [horizontalLeftUpRightDown]: 'tiles/four_way.png',
    [horizontalRightDownLeftUp]: 'tiles/four_way.png',
    [verticalUpLeftRight]: 'tiles/horizontal_straight_up.png',
    [verticalUpLeftDown]: 'tiles/vertical_straight_left.png',
    [verticalUpRightDown]: 'tiles/vertical_straight_right.png',
    [verticalDownLeftRight]: 'tiles/horizontal_straight_down.png',
    [verticalDownLeftUp]: 'tiles/vertical_straight_left.png',
    [verticalDownRightUp]: 'tiles/vertical_straight_right.png',
    [verticalUpRightDownLeft]: 'tiles/four_way.png',
    [verticalDownLeftUpRight]: 'tiles/four_way.png'
  }

  if (imageMap[tile] == '') {
    console.log("imageMap[tile] ", tile)
  }

  return imageMap[tile]
}

function forkedCoordinateNextCoordinate(coordinates) {
  let blankSurroundingTiles = []

  if (coordinates[1] + 1 <= gridWidth - 1 && grid[coordinates[0]][coordinates[1] + 1] === blankTile) {
    blankSurroundingTiles.push([coordinates[0], coordinates[1] + 1])
  }
  if (coordinates[1] + 1 >= 0 && grid[coordinates[0]][coordinates[1] - 1] === blankTile) {
    blankSurroundingTiles.push([coordinates[0], coordinates[1] - 1])
  }
  if (coordinates[0] + 1 <= gridHeight - 1 && grid[coordinates[0] + 1][coordinates[1]] === blankTile) {
    blankSurroundingTiles.push([coordinates[0] + 1, coordinates[1]])
  }
  if (coordinates[0] - 1 >= 0 && grid[coordinates[0] - 1][coordinates[1]] === blankTile) {
    blankSurroundingTiles.push([coordinates[0] - 1, coordinates[1]])
  }

  if (blankSurroundingTiles.length > 0) {
    return blankSurroundingTiles[Math.floor(Math.random() * blankSurroundingTiles.length)]
  }
}

function alphabeticallySortString(string) {
  console.log("alphabetically sorted ", string.split('').sort().join(''))
  return string.split('').sort().join('')
}

function getForkedTile(newCoordinates, oldCoordinates) {
  let currentTile = grid[oldCoordinates[0]][oldCoordinates[1]];
  let currentTileWithoutDirection = currentTile[currentTile.length - 1].concat(currentTile[currentTile.length - 2])
  let currentTileSortedWithoutDirection = alphabeticallySortString(currentTileWithoutDirection)
  let tileDirection = getDirection(oldCoordinates, newCoordinates)

  return tileDirection.concat(currentTileSortedWithoutDirection)
}

window.onload = function () {
  // build the maze
  while (true) {
    if (gridIncomplete() === false) {
      break
    }
    let firstPath = []

    let startingTile = randomEdgeTile();
    let startingTileRow = startingTile[0];
    let startingTileColumn = startingTile[1];

    let tileOptions = tileOptionsBasedOnStart(startingTileRow, startingTileColumn);
    let firstTile = randomTileFromOptions(tileOptions);

    grid[startingTileRow][startingTileColumn] = firstTile;

    firstPath.push(startingTile)

    let previousTileCoordinates = startingTile;
    let nextTileCoordinates = getNextTileCoordinates(startingTile);

    while (nextTileCoordinates !== undefined) {
      firstPath.push(nextTileCoordinates)
      setTile(nextTileCoordinates, previousTileCoordinates);

      previousTileCoordinates = nextTileCoordinates;
      nextTileCoordinates = getNextTileCoordinates(nextTileCoordinates);
    }

    paths.push(firstPath)

    for (let forks = 0; forks < numForkedPaths; forks++) {
      let newPath = []
      let startingPath = paths[Math.floor(Math.random() * paths.length)]

      let nextCoordinates;
      let forkedCoordinates;

      for (let tries = 0; tries < 10; tries++) {
        forkedCoordinates = startingPath[Math.floor(Math.random() * startingPath.length)]
        nextCoordinates = forkedCoordinateNextCoordinate(forkedCoordinates)
        if (nextCoordinates != undefined) {
          break;
        }
      }

      if (nextCoordinates == undefined) {
        // could do something else here, but for now, just continue
        continue;
      }

      let forkedTile = getForkedTile(nextCoordinates, forkedCoordinates);
      let previousCoordinates = forkedCoordinates;

      grid[forkedCoordinates[0]][forkedCoordinates[1]] = forkedTile;

      while (nextCoordinates !== undefined) {
        newPath.push(nextCoordinates);
        setTile(nextCoordinates, previousCoordinates);

        previousCoordinates = nextCoordinates;
        nextCoordinates = getNextTileCoordinates(nextCoordinates);
      }

      if (newPath.length > 0) {
        paths.push(newPath)
      }
    }
    break
  }

  console.log(grid)

  // write the maze to the dom
  let mazeDiv = document.createElement("div");
  mazeDiv.setAttribute('class', 'maze-container');
  document.body.appendChild(mazeDiv);

  // create dynamic css grid size
  let columnTemplate = 'auto ';
  let columnsInit = (columnTemplate.repeat(gridWidth)).trim();
  let style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `.maze-container { display: inline-grid; grid-template-columns: ${columnsInit}; background-color: black; }`;
  document.head.appendChild(style)

  // fill in the maze with image assets based on grid values
  for (row of grid) {
    for (tile of row) {
      let tileDiv = document.createElement("div");
      tileDiv.setAttribute('class', 'tile-item');
      tileDiv.setAttribute('value', 'hi')
      mazeDiv.appendChild(tileDiv);

      let imageSrc = document.createElement("img");
      imageSrc.setAttribute('src', stringToImageTileMapper(tile));
      imageSrc.setAttribute('height', '50px');
      imageSrc.setAttribute('width', '50px');
      tileDiv.appendChild(imageSrc);
    }
  }
}
