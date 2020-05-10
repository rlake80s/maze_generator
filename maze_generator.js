  const gridHeight = 10;
  const gridWidth = 10;
  const blankTile = '   '

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

  const horizontalRightTiles = [horizontalRightLeft, horizontalRightTurnUp, horizontalRightTurnDown] 
  const horizontalLeftTiles = [horizontalLeftRight, horizontalLeftTurnUp, horizontalLeftTurnDown]

  const verticalUpTiles = [verticalUpDown, verticalUpTurnLeft, verticalUpTurnRight]
  const verticalDownTiles = [verticalDownUp, verticalDownTurnLeft, verticalDownTurnRight]

  const deadEndTiles = [horizontalLeftDeadEnd, horizontalRightDeadEnd, verticalDownDeadEnd, verticalUpDeadEnd]

  const horizontalLeftDirection = 'hl'
  const horizontalRightDirection = 'hr'
  const verticalUpDirection = 'vu'
  const verticalDownDirection = 'vd'

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

    if (!(randColumn === 0 || randColumn === gridWidth)) {
      randColumn = randColumn > (gridWidth / 2) ? gridWidth : 0
    }
    
    return [randRow, randColumn]
  }

  function topEdgeTile(rowCoordinate) {
    return rowCoordinate - 1 < 0
  }

  function bottomEdgeTile(rowCoordinate) {
    return rowCoordinate + 1 > gridHeight
  }

  function leftEdgeTile(columnCoordinate) {
    return columnCoordinate - 1 < 0
  }

  function rightEdgeTile(columnCoordinate) {
    return columnCoordinate + 1 > gridWidth
  }

  function tileOptionsBasedOnStart(startingTileRow, startingTileColumn) {
    let tileOptions = [];
    
    if (topEdgeTile(startingTileRow)) {
      tileOptions.push(verticalUpDown);
      tileOptions.push(verticalUpTurnLeft);
      tileOptions.push(verticalUpTurnRight);
    }

    if (bottomEdgeTile(startingTileRow)) {
      tileOptions.push(verticalDownUp);
      tileOptions.push(verticalDownTurnLeft);
      tileOptions.push(verticalDownTurnRight);
    }

    if (leftEdgeTile(startingTileColumn)) {
      tileOptions.push(horizontalLeftRight);
      if (!(bottomEdgeTile(startingTileRow))) {
        tileOptions.push(horizontalLeftTurnDown);
      }
      if (!(topEdgeTile(startingTileRow))) {
        tileOptions.push(horizontalLeftTurnUp);
      }
      tileOptions = tileOptions.filter(function(e) { return e !== verticalDownTurnLeft})
    }

    if (rightEdgeTile(startingTileColumn)) {
      tileOptions.push(horizontalRightLeft);
      if (!(topEdgeTile(startingTileRow))){
        tileOptions.push(horizontalRightTurnUp); 
      }
      if (!(bottomEdgeTile(startingTileRow))) {
        tileOptions.push(horizontalRightTurnDown);
      }
      tileOptions = tileOptions.filter(function(e) { return e !== verticalUpTurnRight})
    }
    
    return tileOptions;
  }

  function filterOutWalls(tileOptions, tileCoordinates) {
    const leftWallCrashTiles = ['hrl', 'vdl', 'vul']
    const rightWallCrashTiles = ['hlr', 'vdr', 'vur']
    const topWallCrashTiles = ['vdu', 'hlu', 'hru']
    const bottomWallCrashTiles = ['vud', 'hld', 'hrd']

    if (topEdgeTile(tileCoordinates[0])) {
      tileOptions = tileOptions.filter(function(e) { return !topWallCrashTiles.includes(e)})
    }
  
    if (bottomEdgeTile(tileCoordinates[0])) {
      tileOptions = tileOptions.filter(function(e) { return !bottomWallCrashTiles.includes(e)})
    }
  
    if (leftEdgeTile(tileCoordinates[1])) {
      tileOptions = tileOptions.filter(function(e) { return !leftWallCrashTiles.includes(e)})
    }
  
    if (rightEdgeTile(tileCoordinates[1])) {
      tileOptions = tileOptions.filter(function(e) { return !rightWallCrashTiles.includes(e)})
    }

    return tileOptions
  }

  function tileOptionsFromLastTile(newTile, lastTile) {
    // TODO: the tile options should have tiles that will hit a wall filtered out
    // for first pass, there should be a single destination / exit point, but we can get there eventually
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

    let tileOptions =  directions[direction]
    tileOptions = filterOutWalls(tileOptions, newTile)
    return tileOptions
  }

  function getNextTileOptions(tile) {
    const nextTileMap = {
      [horizontalLeftRight]: [0,1],
      [horizontalRightLeft]: [0,-1],
      [horizontalLeftTurnUp]: [-1,0],
      [horizontalLeftTurnDown]: [1,0],
      [horizontalRightTurnUp]: [-1,0],
      [horizontalRightTurnDown]: [1,0],

      [verticalUpDown]: [1,0],
      [verticalDownUp]: [-1,0],
      [verticalDownTurnLeft]: [0,-1],
      [verticalDownTurnRight]: [0,1],
      [verticalUpTurnLeft]: [0,-1],
      [verticalUpTurnRight]: [0,1]
    }
    // debugger;
    console.log("tile", tile)
    console.log("nextTileMap[tile]", tile, nextTileMap[tile]);

    return nextTileMap[tile];
  }

  function getDirection(newCoordinates, oldCoordinates) {
    let rowChange = oldCoordinates[0] - newCoordinates[0]
    let columnChange = oldCoordinates[1] - newCoordinates[1]
    // console.log("coordinates ", coordinates);
    if (rowChange === -1) {
      // console.log("direction ", verticalUpDirection);
      return verticalUpDirection
    }
    if (rowChange === 1) {
      // console.log("direction ", verticalDownDirection);
      return verticalDownDirection
    }
    if (columnChange === -1) {
      // console.log("direction ", horizontalLeftDirection);
      return horizontalLeftDirection
    }
    if (columnChange === 1) {
      // console.log("direction ", horizontalRightDirection);
      return horizontalRightDirection
    }
  }

  function calculateNextTileCoordinates(startingTileRow, startingTileColumn, modCoordinates) {
    // console.log(grid)
    let rowMod = modCoordinates[0];
    let columnMod = modCoordinates[1];

    // console.log("mod array ", modCoordinates);

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
      // console.log("option ", option)
      let coordinates = calculateNextTileCoordinates(tileRow, tileColumn, option)
      // console.log("coordinates ", coordinates)
      if (coordinates !== undefined) {
        nextTileCoordinates.push(coordinates);
      } else {
        console.log("coordinates undefined")
      }
    }

    if (previousTile !== undefined) {
      console.log("otherNextTileCoordinates ", nextTileCoordinates)
      console.log("previous tile coordinates ", previousTile[0], previousTile[1]);
      nextTileCoordinates = nextTileCoordinates.filter(function(e) { return e !== [previousTile[0], previousTile[1]]})
    }

    console.log("nextTileCoordinates ", nextTileCoordinates[0])

    return nextTileCoordinates[0]
  }

  function getNextTileCoordinates(tile) {
    let tileRow = tile[0]
    let tileColumn = tile[1]

    let lastTile = grid[tileRow][tileColumn]

    if (deadEndTiles.includes(lastTile)) {
      return undefined;
    }

    // then pass the direction into getNextTileOptions which should only return a single coordinate
    
    // let nextTileOptions = getNextTileOptions(lastTile);
    let nextTileMod = getNextTileOptions(lastTile);
    let nextTileCoordinates = calculateNextTileCoordinates(tileRow, tileColumn, nextTileMod)
    // console.log("nextTileOptions", nextTileOptions);
    // console.log("lastTile ", lastTile)
    // console.log("nextTileOptions ", nextTileOptions)

    // let nextTileCoordinates = filterNextTileCoordinates(tileRow, tileColumn, previousTile, nextTileOptions)

    // console.log("nextTileCoordinates ", nextTileCoordinates);
    if (nextTileCoordinates === undefined) {
      return
    }
    // let nextTileDirection = getDirection(nextTileCoordinates);

    // let firstNextTile;
    // if (nextTileCoordinates !== undefined) {
      // nextTile = grid[nextTileCoordinates[0]][nextTileCoordinates[1]];
    // }

    // let secondNextTileCoordinates = calculateNextTileCoordinates(startingTileRow, startingTileColumn, nextTileOptions[1]);
    // let secondNextTileDirection = getDirection(nextTileOptions[1]);

    // let secondNextTile;
    // if (secondNextTileCoordinates !== undefined) {
    //   secondNextTile = grid[secondNextTileCoordinates[0]][secondNextTileCoordinates[1]];
    // }

    let nextTile = grid[nextTileCoordinates[0]][nextTileCoordinates[1]]
    
    if (nextTile === blankTile) {
      // console.log("firstNextTileCoordinates ", firstNextTileCoordinates)
      // console.log("firstNextTileDirection ", firstNextTileDirection)
      return nextTileCoordinates;
    }

    // if (secondNextTile === '') {
    //   console.log("secondNextTileCoordinates ", secondNextTileCoordinates)
    //   console.log("secondNextTileDirection ", secondNextTileDirection)
    //   return [ secondNextTileCoordinates, secondNextTileDirection ];
    // }

    return undefined;
  }

  function setTile(newCoordinates, previousTileCoordinates) {
    let tileOptions = tileOptionsFromLastTile(newCoordinates, previousTileCoordinates);

    // console.log("direction ", direction)
    // console.log("tileOptions ", tileOptions);
    if (tileOptions == undefined) {
      return
    }
    let newTile = randomTileFromOptions(tileOptions);
    // console.log("tileOptions", tileOptions)
    // console.log("newTile ", newTile);
    // console.log("direction ", direction)

    grid[newCoordinates[0]][newCoordinates[1]] = newTile;
    // console.log("wrote")
    // grid[newCoordinates[0]][newCoordinates[1]] = horizontalLeftRight
  }

  function randomTileFromOptions(tileOptions) {
    if (tileOptions === undefined) {
      return undefined
    }
    return tileOptions[Math.floor(Math.random() * tileOptions.length)]
  }

  // build the maze
  let gridComplete = false;
  while (gridComplete === false) {
    if (gridIncomplete() === false) {
      break
    }

    // let startingTile = randomEdgeTile();
    let startingTile = [0,0]
    let startingTileRow = startingTile[0];
    let startingTileColumn = startingTile[1];

    let tileOptions = tileOptionsBasedOnStart(startingTileRow, startingTileColumn);
    let firstTile = randomTileFromOptions(tileOptions);

    grid[startingTileRow][startingTileColumn] = firstTile;

    let nextTileCoordinates = getNextTileCoordinates(startingTile);

    if (nextTileCoordinates == undefined) {
      break
    }

    // let nextTileCoordinates = coordinatesAndDirection
    // let direction = coordinatesAndDirection[1]
    let previousTileCoordinates = startingTile

    while (nextTileCoordinates !== undefined) {
    // for (let i=0; i < 3; i++) {
    // while (true) {
      // need to recursively call a function that sets the new tile and breaks when it hits a wall
      // need to know last coordinates to know what tile to set

      setTile(nextTileCoordinates, previousTileCoordinates);
      previousTileCoordinates = nextTileCoordinates
      nextTileCoordinates = getNextTileCoordinates(nextTileCoordinates)

      if (nextTileCoordinates === undefined) {
        
        // nextTileCoordinates = coordinatesAndDirection[0]
        // console.log("nextTileCoordinates ", nextTileCoordinates)
        // direction = coordinatesAndDirection[1]
      // } else {
        console.log("broke")
        break
      }
    }
    break
  }



  console.log(grid)


