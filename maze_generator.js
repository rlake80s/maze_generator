const gridHeight = 50;
const gridWidth = 50;

const forkRatio = 0.9
const numForkedPaths = gridHeight * gridWidth * forkRatio

// horizontal tiles
const horizontalLeftRight = 'hlr'
const horizontalRightLeft = 'hrl'
const horizontalLeftTurnUp = 'hlu'
const horizontalLeftTurnDown = 'hld'
const horizontalRightTurnUp = 'hru'
const horizontalRightTurnDown = 'hrd'

// vertical tiles
const verticalUpDown = 'vud'
const verticalDownUp = 'vdu'
const verticalDownTurnLeft = 'vdl'
const verticalDownTurnRight = 'vdr'
const verticalUpTurnLeft = 'vul'
const verticalUpTurnRight = 'vur'

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

// terminal (end point) tiles
const leftTerminal = 'lt'
const rightTerminal = 'rt'
const upTerminal = 'ut'
const downTerminal = 'dt'

const blankTile = '   '

const horizontalRightTiles = [horizontalRightLeft, horizontalRightTurnUp, horizontalRightTurnDown]
const horizontalLeftTiles = [horizontalLeftRight, horizontalLeftTurnUp, horizontalLeftTurnDown]

const verticalUpTiles = [verticalUpDown, verticalUpTurnLeft, verticalUpTurnRight]
const verticalDownTiles = [verticalDownUp, verticalDownTurnLeft, verticalDownTurnRight]

const horizontalLeftDirection = 'hl'
const horizontalRightDirection = 'hr'
const verticalUpDirection = 'vu'
const verticalDownDirection = 'vd'

const up = 'u'
const down = 'd'
const left = 'l'
const right = 'r'

const gridTileDimension = '50';
const rowBufferPixels = 4.492 

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

function setGridTile(coordinates, tile) {
  grid[coordinates[0]][coordinates[1]] = tile;
}

function getGridTile(coordinates) {
  return grid[coordinates[0]][coordinates[1]];
}

function noCoordinatesAtEdge(coordinates) {
  rowCoordinate = coordinates[0]
  columnCoordinate = coordinates[1]

  if (leftEdgeTile(columnCoordinate)) {
    return false
  }
  if (rightEdgeTile(columnCoordinate)) {
    return false
  }
  if (topEdgeTile(rowCoordinate)) {
    return false
  }
  if (bottomEdgeTile(rowCoordinate)) {
    return false
  }
  return true
}

function randomStartTile() {
  let randRow = Math.floor(Math.random() * gridHeight)
  let randColumn = Math.floor(Math.random() * gridWidth)

  if (noCoordinatesAtEdge([randRow, randColumn])) {
    randomAxis = Math.floor(Math.random() * 2)
    if (randomAxis === 0) {
      randRow = randRow > ((gridHeight - 1) / 2) ? gridHeight - 1 : 0
    } else if (randomAxis === 1) {
      randColumn = randColumn > ((gridWidth - 1) / 2) ? gridWidth - 1 : 0
    }
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
    tileOptions = tileOptions.filter(e => !topWallCrashTiles.includes(e))
  }

  if (bottomEdgeTile(tileCoordinates[0])) {
    tileOptions = tileOptions.filter(e => !bottomWallCrashTiles.includes(e))
  }

  if (leftEdgeTile(tileCoordinates[1])) {
    tileOptions = tileOptions.filter(e => !leftWallCrashTiles.includes(e))
  }

  if (rightEdgeTile(tileCoordinates[1])) {
    tileOptions = tileOptions.filter(e => !rightWallCrashTiles.includes(e))
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

function calculateNextTileCoordinates(coordinates, modCoordinates) {
  let rowMod = modCoordinates[0];
  let columnMod = modCoordinates[1];

  let startingTileRow = coordinates[0];
  let startingTileColumn = coordinates[1];

  let newRowTile = startingTileRow + rowMod;
  let newColumnTile = startingTileColumn + columnMod;

  if (newRowTile < 0 || newColumnTile < 0 || newRowTile > gridHeight || newColumnTile > gridWidth) {
    return undefined;
  }

  return [newRowTile, newColumnTile];
}

function getNextTileCoordinates(tile) {
  let lastTile = getGridTile(tile)

  let nextTileMod = getNextTileOptions(lastTile);
  let nextTileCoordinates = calculateNextTileCoordinates(tile, nextTileMod)

  if (nextTileCoordinates === undefined) {
    return
  }

  let nextTile = getGridTile(nextTileCoordinates)

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

  setGridTile(newCoordinates, newTile)
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
    [verticalDownLeftUpRight]: 'tiles/four_way.png',
    [leftTerminal]: 'tiles/terminal_left.png',
    [rightTerminal]: 'tiles/terminal_right.png',
    [upTerminal]: 'tiles/terminal_up.png',
    [downTerminal]: 'tiles/terminal_down.png'
  }

  if (imageMap[tile] == '') {
    console.log("imageMap[tile] ", tile)
  }

  return imageMap[tile]
}

function forkedCoordinateNextCoordinate(coordinates) {
  let blankSurroundingTiles = []

  // in bounds and blank
  if (coordinates[1] + 1 <= gridWidth - 1 && getGridTile([coordinates[0], coordinates[1] + 1]) === blankTile) {
    blankSurroundingTiles.push([coordinates[0], coordinates[1] + 1])
  }
  // in bounds and blank
  if (coordinates[1] + 1 >= 0 && getGridTile([coordinates[0], coordinates[1] - 1]) === blankTile) {
    blankSurroundingTiles.push([coordinates[0], coordinates[1] - 1])
  }
  // in bounds and blank
  if (coordinates[0] + 1 <= gridHeight - 1 && getGridTile([coordinates[0] + 1, coordinates[1]]) === blankTile) {
    blankSurroundingTiles.push([coordinates[0] + 1, coordinates[1]])
  }
  // in bounds and blank
  if (coordinates[0] - 1 >= 0 && getGridTile([coordinates[0] - 1, coordinates[1]]) === blankTile) {
    blankSurroundingTiles.push([coordinates[0] - 1, coordinates[1]])
  }

  if (blankSurroundingTiles.length > 0) {
    return blankSurroundingTiles[Math.floor(Math.random() * blankSurroundingTiles.length)]
  }
}

function alphabeticallySortString(string) {
  return string.split('').sort().join('')
}

function getForkedTile(newCoordinates, forkedCoordinates) {
  let forkedTile = getGridTile(forkedCoordinates)
  let forkedTileWithoutDirection = alphabeticallySortString(forkedTile.substr(1))
  let tileDirection = getDirection(forkedCoordinates, newCoordinates)

  return tileDirection.concat(forkedTileWithoutDirection)
}

function diagonalCoordinate(startingCoordinate, gridSize) {
  let randomHalf = Math.floor(Math.random() * ((gridSize - 1) / 2))

  let diagonalCoordinate;

  if (startingCoordinate < (gridSize - 1) / 2) {
    diagonalCoordinate = Math.floor(randomHalf + (gridSize - 1) / 2);
  } else {
    diagonalCoordinate = randomHalf;
  }

  return diagonalCoordinate;
}

function randomEndTile(startingTile) {
  let startingTileRow = startingTile[0];
  let startingTileColumn = startingTile[1];
  let endingTileRow;
  let endingTileColumn;

  // random tile should be on opposite half of grid as start tile
  if (startingTileRow === 0) {
    endingTileRow = gridHeight - 1
    endingTileColumn = diagonalCoordinate(startingTileColumn, gridWidth)
  }
  if (startingTileColumn === 0) {
    endingTileColumn = gridWidth - 1
    endingTileRow = diagonalCoordinate(startingTileRow, gridHeight)
  }
  if (startingTileRow === gridHeight - 1) {
    endingTileRow = 0
    endingTileColumn = diagonalCoordinate(startingTileColumn, gridWidth)
  }
  if (startingTileColumn === gridWidth - 1) {
    endingTileColumn = 0
    endingTileRow = diagonalCoordinate(startingTileRow, gridHeight)
  }
  return [endingTileRow, endingTileColumn]
}

function getTerminalTile(tile) {
  let direction = tile[1];
  return direction.concat('t')
}

function getForkedCoordinates(path, endingTileCoordinates) {
  let forkedCoordinates = path[Math.floor(Math.random() * path.length)]
  while (coordinatesEqual(forkedCoordinates, endingTileCoordinates)) {
    forkedCoordinates = path[Math.floor(Math.random() * path.length)]
  }
  return forkedCoordinates;
}

function coordinatesEqual(a, b) {
  let a1 = a[0];
  let a2 = a[1];
  let b1 = b[0];
  let b2 = b[1];

  return a1 === b1 && a2 === b2;
}

function getSurroundingTiles(tileCoordinates) {
  let rowCoordinate = tileCoordinates[0]
  let columnCoordinate = tileCoordinates[1]

  let aboveTileCoordinates = [rowCoordinate - 1, columnCoordinate]
  let belowTileCoordinates = [rowCoordinate + 1, columnCoordinate]
  let leftTileCoordinates = [rowCoordinate, columnCoordinate - 1]
  let rightTileCoordinates = [rowCoordinate, columnCoordinate + 1]

  let possibleCoordinates = [];
  possibleCoordinates.push(aboveTileCoordinates);
  possibleCoordinates.push(belowTileCoordinates);
  possibleCoordinates.push(leftTileCoordinates);
  possibleCoordinates.push(rightTileCoordinates);

  return possibleCoordinates;
}

function getConnectingPathCoordinates(tileCoordinates, endPath) {
  // get all surrounding coordinates of previousCoordinates
  let possibleCoordinates = getSurroundingTiles(tileCoordinates);

  let validCoordinates = possibleCoordinates.filter(tile => {
    // remove any coordinates in the end path
    for (coordinates of endPath) {
      if (coordinatesEqual(coordinates, tile)) {
        return false;
      }
    }
    // remove out of bounds
    if (tile[0] < 0 || tile[0] > (gridHeight - 1)) {
      return false;
    }
    if (tile[1] < 0 || tile[0] > (gridWidth - 1)) {
      return false;
    }
    // remove any blank tiles
    let tileValue = getGridTile(tile)
    if (tileValue === blankTile) {
      return false;
    }
    return true;
  })

  let connectingCoordinates = randomTileFromOptions(validCoordinates)
  return connectingCoordinates;
}

function getConnectingTile(startingTile, connectingTile) {
  let direction = getDirection(connectingTile, startingTile)
  let existingTile = getGridTile(connectingTile);
  if (existingTile === undefined) {
    debugger;
  }
  let existingTileNoDirection = existingTile.substr(1)
  let updatedTile = direction.concat(alphabeticallySortString(existingTileNoDirection));

  return updatedTile;
}

function directionToCoordinateMod(direction) {
  let directionMap = {
    r: [0, 1],
    l: [0, -1],
    u: [-1, 0],
    d: [1, 0]
  }

  return directionMap[direction];
}

function isTileDeadEnd(coordinates) {
  let nextTiles = getNextTiles(coordinates)
  return nextTiles.length < 2;
}

window.onload = function () {
  // build the maze
  let firstPath = []

  let startingTileCoordinates = randomStartTile();
  let startingTileRow = startingTileCoordinates[0];
  let startingTileColumn = startingTileCoordinates[1];

  let endingTileCoordinates = randomEndTile(startingTileCoordinates)
  console.log("endingTileCoordinates ", endingTileCoordinates);

  let tileOptions = tileOptionsBasedOnStart(startingTileRow, startingTileColumn);
  let firstTile = randomTileFromOptions(tileOptions);

  setGridTile(startingTileCoordinates, firstTile);

  firstPath.push(startingTileCoordinates)

  let previousTileCoordinates = startingTileCoordinates;
  let nextTileCoordinates = getNextTileCoordinates(startingTileCoordinates);

  while (nextTileCoordinates !== undefined) {
    firstPath.push(nextTileCoordinates)
    setTile(nextTileCoordinates, previousTileCoordinates);

    if (coordinatesEqual(nextTileCoordinates, endingTileCoordinates)) {
      break
    }

    previousTileCoordinates = nextTileCoordinates;
    nextTileCoordinates = getNextTileCoordinates(nextTileCoordinates);
  }

  paths.push(firstPath)

  for (let forks = 0; forks < numForkedPaths; forks++) {
    let newPath = []
    let startingPathIndex = Math.floor(Math.random() * paths.length)
    let startingPath = paths[startingPathIndex]

    let nextCoordinates;
    let forkedCoordinates;

    for (let tries = 0; tries < 10; tries++) {
      forkedCoordinates = getForkedCoordinates(startingPath, endingTileCoordinates)
      nextCoordinates = forkedCoordinateNextCoordinate(forkedCoordinates)
      if (nextCoordinates != undefined) {
        break;
      }
    }

    // don't create any forked path that don't have a second tile in the path
    if (nextCoordinates == undefined) {
      if (paths.length > 1) {
        paths.splice(startingPathIndex, 1);
      }
      continue;
    }

    // don't fork any dead ends
    if (isTileDeadEnd(forkedCoordinates)) {
      continue;
    }

    let forkedTile = getForkedTile(nextCoordinates, forkedCoordinates);
    let previousCoordinates = forkedCoordinates;

    setGridTile(forkedCoordinates, forkedTile);

    while (nextCoordinates !== undefined) {
      newPath.push(nextCoordinates);
      setTile(nextCoordinates, previousCoordinates);

      if (coordinatesEqual(nextCoordinates, endingTileCoordinates)) {
        break
      }

      previousCoordinates = nextCoordinates;
      nextCoordinates = getNextTileCoordinates(nextCoordinates);
    }

    if (newPath.length > 1) {
      paths.push(newPath)
    }
  }

  let endingTile = getGridTile(endingTileCoordinates)

  let endingTileRow = endingTileCoordinates[0]
  let endingTileColumn = endingTileCoordinates[1]

  if (endingTile === blankTile) {
    // create a new endpoint path that joins the existing maze
    let endPath = [];
    endPath.push(endingTileCoordinates);

    let tileOptions = tileOptionsBasedOnStart(endingTileRow, endingTileColumn);
    let endTile = randomTileFromOptions(tileOptions);

    // write tile as a normal tile so it can be read to get the next tile coordindates
    // then overwrite it once we have them
    // might want to change this behaviour later
    setGridTile(endingTileCoordinates, endTile)

    let nextCoordinates = getNextTileCoordinates(endingTileCoordinates);
    let previousCoordinates = endingTileCoordinates;

    let endTileDirectionFlipped = endTile[0].concat(endTile[2]).concat(endTile[1])

    let terminalEndTile = getTerminalTile(endTileDirectionFlipped)
    setGridTile(endingTileCoordinates, terminalEndTile)

    if (nextCoordinates == undefined) {
      let terminalTileDirection = terminalEndTile[0]
      let coordinateMod = directionToCoordinateMod(terminalTileDirection);

      let connectingTileCoordinates = [endingTileRow + coordinateMod[0], endingTileColumn + coordinateMod[1]];

      let connectingTile = getConnectingTile(previousCoordinates, connectingTileCoordinates);

      setGridTile(connectingTileCoordinates, connectingTile)
    }

    while (nextCoordinates !== undefined) {
      setTile(nextCoordinates, previousCoordinates);
      endPath.push(nextCoordinates);

      previousCoordinates = nextCoordinates;
      nextCoordinates = getNextTileCoordinates(previousCoordinates);
      if (nextCoordinates == undefined) {
        let connectingTileCoordinates = getConnectingPathCoordinates(previousCoordinates, endPath);

        let connectingTile = getConnectingTile(previousCoordinates, connectingTileCoordinates);

        setGridTile(connectingTileCoordinates, connectingTile)
      }
    }
  } else {
    // make tile a terminal end point
    let endTile = getGridTile(endingTileCoordinates)
    let terminalEndTile = getTerminalTile(endTile)

    setGridTile(endingTileCoordinates, terminalEndTile)
  }


  console.log(grid)

  // write the maze to the dom
  let mazeDiv = document.createElement("div");
  mazeDiv.setAttribute('id', 'maze-container');
  document.body.appendChild(mazeDiv);

  // create dynamic css grid size
  let columnTemplate = 'auto ';
  let columnsInit = (columnTemplate.repeat(gridWidth)).trim();
  let style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `#maze-container { display: inline-grid; grid-template-columns: ${columnsInit}; background-color: black; }`;
  document.head.appendChild(style)

  // fill in the maze with image assets based on grid values
  for (row of grid) {
    for (tile of row) {
      let tileDiv = document.createElement("div");
      tileDiv.setAttribute('class', 'tile-item');
      mazeDiv.appendChild(tileDiv);

      let imageSrc = document.createElement("img");
      imageSrc.setAttribute('src', stringToImageTileMapper(tile));
      imageSrc.setAttribute('height', gridTileDimension + 'px');
      imageSrc.setAttribute('width', gridTileDimension + 'px');
      tileDiv.appendChild(imageSrc);
    }
  }

  // run the maze

  let currentCoordinates = startingTileCoordinates;
  let pastCoordinates = getStartingOutOfBoundCoordinates(startingTileCoordinates)
  let currentPath = []
  let pathDirectionArray;

  let nextTiles = getNextTiles(currentCoordinates, pastCoordinates)

  let forkedPaths = []

  let defaultPathObject = {
    currentCoordinates: [],
    currentPath: [],
    pastCoordinates: []
  }

  for (coordinates of nextTiles) {
    let movePath = cloneObject(defaultPathObject);

    movePath.currentCoordinates = coordinates;
    movePath.pastCoordinates = currentCoordinates;
    movePath.currentPath.push(currentCoordinates);
    movePath.currentPath.push(coordinates);

    forkedPaths.push(movePath);
  }

  while (forkedPaths.length > 0) {
    let forkedPath = forkedPaths.pop();

    currentCoordinates = forkedPath.currentCoordinates;
    pastCoordinates = forkedPath.pastCoordinates;
    currentPath = cloneObject(forkedPath.currentPath);

    if (coordinatesEqual(currentCoordinates, endingTileCoordinates)) {
      console.log("currentCoordinates ", currentCoordinates);
      console.log("currentPath ", forkedPath.currentPath);
      pathDirectionArray = generatePathDirectionArray(forkedPath.currentPath);
      console.log("pathDirectionArray ", pathDirectionArray)
      break
    }

    nextTiles = getNextTiles(currentCoordinates, pastCoordinates)

    if (nextTiles.length === 0) {
      continue;
    }

    for (coordinates of nextTiles) {
      let movePath = cloneObject(defaultPathObject);
      let path = cloneObject(currentPath);
      path.push(coordinates);

      movePath.currentCoordinates = coordinates;
      movePath.pastCoordinates = currentCoordinates;
      movePath.currentPath = path;

      forkedPaths.push(movePath);
    }
  }

  function startingPositionVerticalBufferPixels(rowNumber) {
    return rowBufferPixels * (rowNumber - 1);
  }

  function renderingStartingPosition(direction) {
    let startingRow = startingTileCoordinates[0];
    let startingColumn = startingTileCoordinates[1];

    let startingAxis;
    const rowAxis = 'r';
    const columnAxis = 'c';

    if (startingRow === 0 && direction === down || startingRow === gridHeight - 1 && direction === up) {
      startingAxis = rowAxis
    }
    if (startingColumn === gridWidth - 1 && direction === left) {
      startingAxis = columnAxis
    }

    let startingRowPixel = (startingRow * parseInt(gridTileDimension)) + startingPositionVerticalBufferPixels(startingRow);
    let startingColumPixel = (startingColumn * parseInt(gridTileDimension));

    if (startingAxis === rowAxis) {
      startingColumPixel += (parseInt(gridTileDimension) / 2);
      if (startingRow === gridHeight - 1) {
        startingRowPixel += 50
      }
    }
    if (startingAxis === columnAxis) {
      startingRowPixel += (parseInt(gridTileDimension) / 2);
      startingColumPixel += 50
    }
    if (startingColumn === 0 && direction === right) {
      startingRowPixel += 25
    }

    return [startingRowPixel, startingColumPixel]
  }

  function getStartingTargetPixel(direction) {
    const startingTargetPixel = {
      r: gridTileDimension / 2,
      l: canvas.width - gridTileDimension / 2,
      u: canvas.height - gridTileDimension / 2,
      d: gridTileDimension / 2,
    }
    return startingTargetPixel[direction];
  }

  function getNextPixelFromDirection(direction, posX, posY) {

    const targetPixel = {
      l: posX - 50,
      r: posX + 50,
      d: posY + 50 + rowBufferPixels,
      u: posY - 50 - rowBufferPixels,
    }
    return targetPixel[direction];
  }

  // render the maze run
  let canvas = document.createElement("canvas");
  canvas.setAttribute('id', 'maze-canvas');
  canvas.setAttribute('width', mazeDiv.offsetWidth)
  canvas.setAttribute('height', mazeDiv.offsetHeight)
  document.body.appendChild(canvas);

  canvas.style.position = "absolute";
  canvas.style.left = mazeDiv.offsetLeft + "px";
  canvas.style.top = mazeDiv.offsetTop + "px";

  let ctx = canvas.getContext("2d");
  ctx.strokeStyle = 'Red';

  // get starting pixel direction
  let startingOutOfBoundCoordinates = getStartingOutOfBoundCoordinates(startingTileCoordinates)
  let startingDirection = coordinatesChangeToDirection(startingOutOfBoundCoordinates, startingTileCoordinates)

  let startingPixelPositions = renderingStartingPosition(startingDirection)
  let startingTargetPixel = getStartingTargetPixel(startingDirection)

  let posY = startingPixelPositions[0];
  let posX = startingPixelPositions[1]

  let lineLength = 10;
  let lineWidth = 10;
  let speed = 7;

  function drawLine() {
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(posX + lineWidth, posY + lineLength);
    ctx.stroke();

    // make the maze run line thicker at higher speeds
    for (let i = 1; i < speed + 5; i++) {
      if (i > 15) {
        break
      }
      ctx.beginPath();
      ctx.moveTo(posX + i, posY);
      ctx.lineTo(posX + lineWidth, posY + lineLength);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(posX, posY + i);
      ctx.lineTo(posX + lineWidth, posY + lineLength);
      ctx.stroke();
    }
  }

  function moveLine(direction, targetPixel) {
    if (direction === 'r') {
      posX += speed;
      if (posX >= targetPixel) {
        posX -= (posX - targetPixel)
        return true;
      }
    }
    if (direction === 'l') {
      posX -= speed;
      if (posX <= targetPixel) {
        posX += (targetPixel - posX)
        return true;
      }
    }
    if (direction === 'u') {
      posY -= speed;
      if (posY <= targetPixel) {
        posY += (targetPixel - posY)
        return true
      }
    }
    if (direction === 'd') {
      posY += speed;
      if (posY >= targetPixel) {
        posY -= (posY - targetPixel)
        return true
      }
    }
  }

  function drawFirstLine() {
    let done = moveLine(startingDirection, startingTargetPixel);
    drawLine();
    if (done === true) {
      drawPath()
      return
    }
    requestAnimationFrame(drawFirstLine);
  }

  function drawTile(direction, targetPixel) {
    let done = moveLine(direction, targetPixel);
    drawLine();
    if (done === true) {
      drawPath()
      return
    }
    requestAnimationFrame(() => {
      drawTile(direction, targetPixel)
    });
  }

  function drawPath() {
    let direction = pathDirectionArray.shift();
    let targetPixel = getNextPixelFromDirection(direction, posX, posY)
    drawTile(direction, targetPixel)
    if (pathDirectionArray.length <= 0) {
      return;
    }
  }

  drawFirstLine()
}

// maze runner functions

// function getPossibleMoves(coordinates, pastCoordinates) {
//   let tile = getGridTile(coordinates)

//   let possibleCoordinatesMod = getCoordinateModFromTile(tile);
//   let possibleCoordinates = getPossibleCoordinatesFromMod(possibleCoordinatesMod, coordinates, pastCoordinates)

//   return possibleCoordinates;
// }

function getCoordinateModFromTile(tile) {
  let tileDirectionsArray = getTileDirectionsArray(tile)

  let coordinatesMod = tileDirectionsArray.map(e => directionToCoordinateMod(e))
  return coordinatesMod;
}

function getPossibleCoordinatesFromMod(modArray, coordinates, pastCoordinates) {
  let possibleCoordinates = [];

  let row = coordinates[0]
  let column = coordinates[1]

  for (mod of modArray) {
    let modRow = mod[0]
    let modColumn = mod[1]

    let moddedRow = row + modRow
    let moddedColumn = column + modColumn

    possibleCoordinates.push([moddedRow, moddedColumn])
  }

  if (!(pastCoordinates === undefined)) {
    possibleCoordinates = possibleCoordinates.filter(e => !coordinatesEqual(e, pastCoordinates))
  }

  return possibleCoordinates;
}

function getStartingOutOfBoundCoordinates(startingCoordinates) {
  let startingTile = getGridTile(startingCoordinates)
  let coordinatesMod = getCoordinateModFromTile(startingTile)
  let possibleCoordinates = getPossibleCoordinatesFromMod(coordinatesMod, startingCoordinates)

  let startingOutOfBoundCoordinates = possibleCoordinates.find(e => coordinatesOutOfBounds(e))

  return startingOutOfBoundCoordinates;
}

function coordinatesOutOfBounds(coordinates) {
  let row = coordinates[0];
  let column = coordinates[1];

  if (row < 0) {
    return true
  }
  if (column < 0) {
    return true
  }
  if (row > gridHeight - 1) {
    return true
  }
  if (column > gridWidth - 1) {
    return true
  }
  return false
}

function getTileDirectionsArray(tile) {
  const directionsArray = ['v', 'h', 't']
  if (tile === undefined) {
    return [];
  } else {
    return tile.split('').filter(e => !directionsArray.includes(e));
  }
}

function nextTileConnectsToCurrentTile(direction, nextTileCoordinates) {
  let nextTile = getGridTile(nextTileCoordinates);
  let nextTileDirections = getTileDirectionsArray(nextTile)

  const connectingTilesMap = {
    l: 'r',
    r: 'l',
    u: 'd',
    d: 'u'
  }

  nextTileDirections = nextTileDirections.map(e => connectingTilesMap[e])

  if (nextTileDirections.includes(direction)) {
    return true
  }
  return false;
}

function getNextTileCoordinateOptions(tile, coordinates, previousCoordinates) {
  let nextTileCoordinatesOptions = [];

  let tileDirectionsObject = getTileDirectionsArray(tile).map(e => ({
    direction: e,
    mod: directionToCoordinateMod(e)
  }));

  for (tile of tileDirectionsObject) {
    let direction = tile.direction
    let modCoordinates = tile.mod

    let nextTileCoordinates = calculateNextTileCoordinates(coordinates, modCoordinates)

    if (nextTileCoordinates === undefined) {
      continue
    }
    if (coordinatesOutOfBounds(nextTileCoordinates)) {
      continue
    }
    if (previousCoordinates !== undefined && coordinatesEqual(nextTileCoordinates, previousCoordinates)) {
      continue
    }
    if (nextTileConnectsToCurrentTile(direction, nextTileCoordinates)) {
      nextTileCoordinatesOptions.push(nextTileCoordinates);
    }
  }
  return nextTileCoordinatesOptions;
}

function getNextTiles(coordinates, previousCoordinates) {
  let currentTile = getGridTile(coordinates)

  let nextTileOptions = getNextTileCoordinateOptions(currentTile, coordinates, previousCoordinates)

  return nextTileOptions;
}

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function generatePathDirectionArray(pathArray) {
  let pathDirectionArray = [];
  for (let i = 0, k = 1; k < pathArray.length; i++, k++) {
    let start = pathArray[i];
    let end = pathArray[k];
    pathDirectionArray.push(coordinatesChangeToDirection(start, end))
  }
  return pathDirectionArray;
}

function coordinatesChangeToDirection(startingCoordinate, endingCoordinate) {
  let rowMod = endingCoordinate[0] - startingCoordinate[0];
  let columnMod = endingCoordinate[1] - startingCoordinate[1];

  if (rowMod === 1) {
    return down;
  }
  if (rowMod === -1) {
    return up;
  }
  if (columnMod === 1) {
    return right;
  }
  if (columnMod === -1) {
    return left;
  }
}
