const prompt = require("prompt-sync")({
  sigint: true,
});

const up = ["up", "w"];
const left = ["left", "l", "a"];
const down = ["down", "s"];
const right = ["right", "r", "d"];

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";
const stepCharacter = "=";

class Field {
  constructor(arField) {
    this.field = arField;
  }

  print() {
    this.field.forEach((element) => {
      console.log(element.join(""));
    });
  }

  currentLocation() {
    //returns coordinates of current location of pathCharacter
    let row, column;
    this.field.forEach((element, index) => {
      if (element.indexOf(pathCharacter) >= 0) {
        row = index;
        column = element.indexOf(pathCharacter);
      }
    });
    return [row, column];
  }

  fetchTarget(coordinates) {
    let target = this.field[coordinates[0]];
    return typeof target === "undefined" ? target : target[coordinates[1]];
  }

  static fetchTargetStatic(coordinates, arField) {
    let target = arField[coordinates[0]];
    return typeof target === "undefined" ? target : target[coordinates[1]];
  }

  canMove(currentLocation, coordinatesAdjustment) {
    let canMove = false;
    let target = this.fetchTarget([
      currentLocation[0] + coordinatesAdjustment[0],
      currentLocation[1] + coordinatesAdjustment[1],
    ]);
    if (typeof target != "undefined") {
      canMove = true;
    }
    return canMove;
  }

  move(coordinatesAdjustment) {
    //returns boolean based on whether or not this.field was changed based on input
    let row = coordinatesAdjustment[0];
    let column = coordinatesAdjustment[1];
    let playerCoordinates = this.currentLocation();
    let moveHappened = false;
    if (
      (row != 0 && column != 0) ||
      this.canMove(playerCoordinates, coordinatesAdjustment)
    ) {
      this.field[playerCoordinates[0]][playerCoordinates[1]] = stepCharacter;
      this.field[playerCoordinates[0] + row][playerCoordinates[1] + column] =
        pathCharacter;
      moveHappened = true;
    }
    if (!this.canMove(playerCoordinates, coordinatesAdjustment)) {
      console.log(
        `Can't move in the specified direction! Reason: out of bounds.`
      );
    }
    return moveHappened;
  }
  static random(range) {
    return Math.floor(Math.random() * range);
  }
  static createGrid(h = 3, w = 3) {
    let gridToReturn = [];
    let row = [];
    let [innerCycles, outerCycles] = [0, 0];
    for (let i = 0; i < h; i++) {
      for (let y = 0; y < w; y++) {
        row.push(fieldCharacter);
        innerCycles++;
      }
      gridToReturn.push(row);
      outerCycles++;
      row = []; //reset array
    }
    return gridToReturn;
  }
  static populateGrid(arGrid, holePercent = 10, spawnRandom = false) {
    //
    let spawnCoordinates = spawnRandom
      ? [this.random(arGrid.length), this.random(arGrid[0].length)]
      : [0, 0];
    let hatCoordinates = [0, 0];
    let holeOccurences = Math.ceil(
      (holePercent / 100) * arGrid.length * arGrid[0].length
    );
    arGrid[spawnCoordinates[0]][spawnCoordinates[1]] = pathCharacter; //place spawn
    do {
      hatCoordinates = [
        this.random(arGrid.length),
        this.random(arGrid[0].length),
      ];
    } while (this.fetchTargetStatic(hatCoordinates, arGrid) === pathCharacter);
    arGrid[hatCoordinates[0]][hatCoordinates[1]] = hat; //place hat
    do {
      let holeCoordinates = [
        this.random(arGrid.length),
        this.random(arGrid[0].length),
      ];
      if (
        this.fetchTargetStatic(holeCoordinates, arGrid) != hat &&
        this.fetchTargetStatic(holeCoordinates, arGrid) != pathCharacter
      ) {
        arGrid[holeCoordinates[0]][holeCoordinates[1]] = hole; //place hole
      }
      holeOccurences--;
    } while (holeOccurences > 0);
    return arGrid;
  }
  generateField(height, width, holePercent = 10, spawnRandom = false) {
    //create grid +
    //populate grid +
    //verify grid
    //return grid +
    this.field = Field.populateGrid(
      Field.createGrid(height, width),
      holePercent,
      spawnRandom
    );
    // this.print();
    return this.field;
  }
}

const myField = new Field([
  ["*", "░", "O"],
  ["░", "O", "░"],
  ["░", "^", "░"],
]);

function handleInput() {
  return prompt(`In which direction will you move?   `);
}

function translateInput(playerInput) {
  //translates input into array of coordinates
  let coordinatesAdjustment = [0, 0];
  playerInput = playerInput.toLowerCase();
  if (up.indexOf(playerInput) >= 0) {
    coordinatesAdjustment = [-1, 0]; // move up
  } else if (left.indexOf(playerInput) >= 0) {
    coordinatesAdjustment = [0, -1]; // move left
  } else if (down.indexOf(playerInput) >= 0) {
    coordinatesAdjustment = [1, 0]; // move down
  } else if (right.indexOf(playerInput) >= 0) {
    coordinatesAdjustment = [0, 1]; // move right
  } else {
    console.log(
      "WRONG INPUT! \nTRY 'W' for 'up'\n'A' for 'left\n'S' for 'down'\n'D' for 'right'"
    );
  }
  return coordinatesAdjustment;
}

let winCondition,
  loseCondition = false;

function play(playField) {
  let randField = prompt(
    `What game mode do you want to play? '1' for fixed starting field, '2' for random field    `
  );
  let playerName = prompt("Hello traveler! What's your name? ");
  console.log(
    `Oh my, ${playerName}, you seem to have lost your hat! You should fetch it before someone else finds it!`
  );
  if (Number(randField) === 2) {
    playField.generateField(5, 5, 50, true);
  }
  while (!winCondition && !loseCondition) {
    let playerLocation = playField.currentLocation();
    playField.print();
    let input = translateInput(handleInput());
    let targetTile = playField.fetchTarget([
      input[0] + playerLocation[0],
      input[1] + playerLocation[1],
    ]);
    if (targetTile === hat) {
      console.log(`Congratulations! You've found your hat!`);
      winCondition = true;
    } else if (targetTile === hole) {
      console.log(`Whoops! You've fallen down the hole and died! GAME OVER!`);
      loseCondition = true;
    }
    playField.move(input);
  }
}
// Field.createGrid();
play(myField);
