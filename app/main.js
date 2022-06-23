import { tilePlane } from './tiles.js';
import { wordrisTips } from './tips.js';

const MAX_ROWS = 8;
score.onclick = init;

// Get the next piece to place and display it.
function showNextPiece(tile, info) {
  //Convert the absolute co-ordinates of the tile to relative co-ordinates
  //for the 2x2 square.
  let mr = Math.min(...tile.map(x => x[0])); 
  let mc = Math.min(...tile.map(x => x[1])); 
  let coords = tile.map(x => [x[0] - mr, x[1] - mc]);

  // Clear the square
  Array.from(current.children).forEach(child => {
    child.textContent = '';
    child.className = 'emptycell';
  });

  let letters = [];
  coords.forEach((co, i) => {
    let selector = '[currentrow="'+co[0]+'"][currentcell="'+co[1]+'"]';
    let cell = document.querySelector(selector)
    let letter = info.wordMatrix[tile[i][0]][tile[i][1]];
    letters.push(letter);
    cell.textContent = letter;
    cell.className = 'currentcell';
  });
  let currentTileInfo = { coords: coords, letters: letters };
  return currentTileInfo;
}

function calculateScore(guesses, answers) {
  const matches = guesses
    .map((e,i) => e.every((l,j) => l == answers[i][j]) ? 1 : 0)
    .reduce((p,c) => p + c);
  return matches;
}

function showScore(playerScore) {
  score.style.display = 'block';
  result.textContent = "Score: " + playerScore;
}

// Set up a new game.
function init() {

  //  The player has made a move, so get the next piece or end the game.
  function advanceNextMove() {
    let nextTile = info.shuffledTiles.next().value;
    if (!nextTile) {
      console.log("Finished!\n",playerGuesses);
      let playerScore = calculateScore(playerGuesses, info.wordMatrix);
      showScore(playerScore);
      return;
    }
    tip.textContent = wordrisTips.next().value;
    return showNextPiece(nextTile, info);
  }

  // Place the piece in the position selected by the player.
  function placePiece(e) {
    let r = parseInt(e.target.getAttribute('row'));
    let col = parseInt(e.target.getAttribute('column'));

    // Fix the offset of the tile we're placing so we can place it properly.
    let offset = 0;
    if (!currentTile.coords.some(x => !x[0] && !x[1])) {
      offset = 1;
    }

    // Detect invalid placement.
    for (const coord of currentTile.coords) {
      let nr = r + coord[0];
      let nc = col + coord[1] - offset;
      if (nr > info.plane.length || nc > info.plane[0].length
          || nc < 1) {
        console.log("Invalid placement");
        return;
      }
    }

    // Figure out if the parts of the place tile match the letters on the board.
    currentTile.coords.forEach((coord, j) => { 
      let nr = r + coord[0];
      let nc = col + coord[1] - offset;

      // Populate the tile with the guess.
      let lc = document.querySelector('[row="'+nr+'"][column="'+nc+'"]')
      let ltr = currentTile.letters[j];
      lc.textContent = ltr;

      // Update the tile's color.
      if (lc.textContent == info.wordMatrix[nr-1][nc-1]) {
        lc.style.backgroundColor = 'green';
      } else {
        lc.style.backgroundColor = 'red';
      }

      // Update our record of the player's guesses.
      playerGuesses[nr-1][nc-1] = ltr;

      // Make sure the row above is now visible.
      for (var k = 0; k < info.plane[0].length; k++) {
        let lc = document.querySelector('[row="'+(nr+1)+'"][column="'+(k+1)+'"]')
        if (lc) {lc.className += " activecell";}
      }

    });
    currentTile = advanceNextMove();
  }

  score.style.display = 'none';

  // Tile the board.
  let info = tilePlane(MAX_ROWS);

  // This will record the positions where the player has placed the pieces.
  let playerGuesses = new Array(MAX_ROWS);
  for (let i = 0; i < MAX_ROWS; i++) {
    playerGuesses[i] = new Array(5).fill('');
  }

  // Set up the board from bottom to top.
  grid.innerHTML = '';
  for (let r = info.plane.length - 1; r >= 0; r--) {
    for (let c = 0; c < info.plane[r].length; c++) {
      let d = document.createElement("div"); 
      d.className = "cell";
      d.setAttribute("row", r + 1);
      d.setAttribute("column", c + 1);
      grid.appendChild(d);
      // Only the bottom two rows are active at first.
      if (r < 2) {
        d.className += " activecell";
      }
      d.onclick = placePiece;
    }
  }

  // Set up the first move.
  let currentTile = advanceNextMove();
}
init();
