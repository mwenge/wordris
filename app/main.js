import { tilePlane, updateProgress, todaysProgress, boardNumber } from './tiles.js';
import { wordrisTips, scoreComments } from './tips.js';

const MAX_ROWS = 8;
const MAX_COLS = 5;

function clearCells() {
  // Clear the square
  Array.from(current.children).forEach(child => {
    child.textContent = '';
    child.className = 'emptycell';
  });
  document.body.offsetTop;
}

// Get the next piece to place and display it.
function showNextPiece(tile, info) {
  //Convert the absolute co-ordinates of the tile to relative co-ordinates
  //for the 2x2 square.
  let mr = Math.min(...tile.map(x => x[0])); 
  let mc = Math.min(...tile.map(x => x[1])); 
  let coords = tile.map(x => [x[0] - mr, x[1] - mc]);

  clearCells();

  let letters = [];
  coords.forEach((co, i) => {
    let selector = '[currentrow="'+co[0]+'"][currentcell="'+co[1]+'"]';
    let cell = document.querySelector(selector)
    let letter = info.wordMatrix[tile[i][0]][tile[i][1]];
    letters.push(letter);
    cell.textContent = letter;
    cell.className = 'currentcell flip';
  });
  let currentTileInfo = { coords: coords, letters: letters, abscoords: tile };
  return currentTileInfo;
}

function calculateScore(guesses, answers) {
  const flatAnswers = answers.flat();
  const matches = guesses
    .flat()
    .reduce((p,l,j) => (l == flatAnswers[j] ? 1 : 0) + p, 0);

  const guessesForSharing = guesses
    .map((e,i) => e.map((l,j) => {
      if (l == '') {
        return '⬛';
      } else if (l == answers[i][j]) {
        return '🟩';
      }
      return '🟥';
    }))
    .reverse()
    .map(e => e.join(''))
    .join('\n');
  return {
    score: matches,
    guesses: guessesForSharing
  }
}

function showScore(playerScore) {
  // Make the scoreboard a child of the grid so it positions nicely. FIXME: A hack.
  let container = resultcontainer.parentElement.removeChild(resultcontainer);
  grid.appendChild(container);
  container.style.display = 'block';

  // Blur the grid.
  Array.from(document.getElementsByClassName("cell"))
    .forEach(c => c.style.filter = "blur(0.9px)");

  // Display the score and populate the share button.
  score.textContent = `Score: ${playerScore.score}/${MAX_ROWS*MAX_COLS}`;
  comment.textContent = scoreComments[parseInt(playerScore.score/MAX_COLS, 10)];
  share.onclick = ()=> {
    navigator.clipboard.writeText(
`Wordris ${boardNumber()} ${playerScore.score}/${MAX_ROWS*MAX_COLS}\n
${playerScore.guesses}\n 
https://mwenge.github.io/wordris`
    );
    copied.className = "copied visible";
    document.body.offsetTop;
    setTimeout(()=> {
      copied.className = "copied hidden";
    }, 1000);
  }; 
}

// Set up a new game.
async function init() {

  //  The player has made a move, so get the next piece or end the game.
  function advanceNextMove() {
    let nextTileInfo = info.shuffledTiles.next();
    updateProgress(playerGuesses, nextTileInfo);

    if (nextTileInfo.done) {
      clearCells();
      console.log("Finished!\n",playerGuesses);
      let playerScore = calculateScore(playerGuesses, info.wordMatrix);
      showScore(playerScore);
      return null;
    }
    tip.textContent = wordrisTips.next().value;
    let currentTile = showNextPiece(nextTileInfo.value.tile, info);


    // Blur out rows that are not in play.
    if (!currentTile) {
      return currentTile;
    }
    const rowsInPlay = currentTile.abscoords.map(x => x[0]+1);
    info.rows.forEach((x,r) => {
      let lcs = document.querySelectorAll('[row="'+(r+1)+'"]')
      lcs.forEach(lc => {
        if (rowsInPlay.includes(r+1)) {
          lc.className = "cell activecell";
        } else {
          lc.className = "cell completecell";
        }
      });
    });
    return currentTile;
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
      if (nr > info.rows.length || nc > info.rows[0].length
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

    });

    // Get the next piece.
    currentTile = advanceNextMove();

  }
  async function loadState() {
    let p = await todaysProgress();
    if (!p) {
      // Set up the first move.
      return;
    }

    playerGuesses = p.playerGuesses;

    p.playerGuesses.forEach((e,r) => { 
      e.forEach((f,c) => {
        if (f) {
          // Populate the tile with the guess.
          let lc = document.querySelector('[row="'+(r+1)+'"][column="'+(c+1)+'"]')
          lc.textContent = f;

          // Update the tile's color.
          if (lc.textContent == info.wordMatrix[r][c]) {
            lc.style.backgroundColor = 'green';
          } else {
            lc.style.backgroundColor = 'red';
          }
        }
      });
    });
    for (var i = 0; i < p.nextTile.value.used; i++) {
      info.shuffledTiles.next();
      wordrisTips.next();
    }
  }

  // Tile the board.
  let info = tilePlane(MAX_ROWS);

  // Set up the board from bottom to top.
  grid.innerHTML = '';
  for (let r = info.rows.length - 1; r >= 0; r--) {
    for (let c = 0; c < info.rows[r].length; c++) {
      let d = document.createElement("div"); 
      d.className = "cell";
      d.setAttribute("row", r + 1);
      d.setAttribute("column", c + 1);
      grid.appendChild(d);
      d.onclick = placePiece;
    }
  }

  // This will record the positions where the player has placed the pieces.
  let playerGuesses = new Array(MAX_ROWS);
  for (let i = 0; i < MAX_ROWS; i++) {
    playerGuesses[i] = new Array(MAX_COLS).fill('');
  }
  await loadState();
  let currentTile = advanceNextMove();
}

init();
