import { tilePlane } from './tiles.js';

function showCurrent(tile, whichTile, tileName) {
  //Convert the absolute co-ordinates of the tile to relative co-ordinates
  //for the 2x2 square.
  let mr = Math.min(...tile.map(x => x[0])); 
  let mc = Math.min(...tile.map(x => x[1])); 
  let mt = tile.map(x => [x[0] - mr, x[1] - mc]);

  // Clear the square
  for (let i = 0; i < current.children.length; i++) {
    current.children[i].textContent = '';
    current.children[i].className = 'emptycell';
  }

  let letters = [];
  for (var i = 0; i < mt.length; i++) {
    let co = mt[i];
    let cell = document.querySelector('[' + tileName + 'row="'+co[0]+'"][' + tileName + 'cell="'+co[1]+'"]')

    let letter = info.wordMatrix[tile[i][0]][tile[i][1]];
    letters.push(letter);
    cell.textContent = letter;
    cell.className = 'currentcell';
  }
  let currentTileInfo = { coords: mt, letters: letters };
  return currentTileInfo;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function calculateScore(guesses, answers) {
  let matches = guesses.map((e,i) => e.every((l,j) => l == answers[i][j]) ? 1 : 0)
                .reduce((p,c) => p + c);
  console.log("Result:", matches);
  return matches;
}

function showScore(playerScore) {
  score.style.display = 'block';
  result.textContent = "Score: " + playerScore;
}

let startTile;
let currentTile;
let info;
let playerGuesses = [];
let defaultRows = 10;
score.onclick = init;

function init() {
  score.style.display = 'none';
  grid.innerHTML = '';
  startTile = 0;
  info = tilePlane(defaultRows);
  playerGuesses = new Array(defaultRows);
  for (let i = 0; i < defaultRows; i++) {
    playerGuesses[i] = new Array(5).fill('');
  }

  // Make sure the tiles don't appear in left-to-right order.
  let randomizedTiles = [... new Set(info.plane.map(x => shuffle([... new Set(x)])).flat())];
  function getNextTile() {
    if (startTile == info.tiles.length - 1) {
      console.log("Finished!\n",playerGuesses);
      let playerScore = calculateScore(playerGuesses, info.wordMatrix);
      showScore(playerScore);
      return;
    }
    currentTile = showCurrent(info.tiles[randomizedTiles[startTile]], current, 'current');
    startTile++;
  }
  getNextTile();

  for (let r = info.plane.length - 1; r >= 0; r--) {
    for (let c = 0; c < info.plane[r].length; c++) {
      let d = document.createElement("div"); 
      d.className = "cell";
      d.setAttribute("row", r + 1);
      d.setAttribute("column", c + 1);
      grid.appendChild(d);
    }
  }

  // Set up the click handlers for every cell.
  var cells = document.getElementsByClassName('cell');
  for(var i = 0; i < cells.length; i++) {
    var cell = cells[i];
    cell.onclick = function(e) {
      let r = parseInt(e.target.getAttribute('row'));
      let col = parseInt(e.target.getAttribute('column'));

      let offset = 0;
      if (!currentTile.coords.some(x => !x[0] && !x[1])) {
        offset = 1;
      }

      for (var j = 0; j < currentTile.coords.length; j++) {
        let nr = r + currentTile.coords[j][0];
        let nc = col + currentTile.coords[j][1] - offset;
        if (nr > info.plane.length || nc > info.plane[0].length) {
          console.log("Invalid placement");
          return;
        }
      }

      for (var j = 0; j < currentTile.coords.length; j++) {
        let nr = r + currentTile.coords[j][0];
        let nc = col + currentTile.coords[j][1] - offset;

        let lc = document.querySelector('[row="'+nr+'"][column="'+nc+'"]')
        let ltr = currentTile.letters[j];
        lc.textContent = ltr;
        playerGuesses[nr-1][nc-1] = ltr;
        if (lc.textContent == info.wordMatrix[nr-1][nc-1]) {
          lc.style.backgroundColor = 'green';
        } else {
          lc.style.backgroundColor = 'red';
        }
      }
      getNextTile();
    }
  }
}
init();
