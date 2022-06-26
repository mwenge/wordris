import { allWords } from './words.js';

// Set today's seed
const today = new Date();
today.setHours(0, 0, 0, 0);
const seed = today.getTime();
let rng = new alea(seed);

export function boardNumber() {
  const DAYS_FACTOR = 86400000;
  const start = new Date(2022, 5, 21);
  const board = (today - start) / DAYS_FACTOR;
  return board;
}

export async function updateProgress(playerGuesses, nextTile) {
  await localforage.setItem(seed, {
    playerGuesses: playerGuesses,
    nextTile: nextTile
  });
}

export async function todaysProgress() {
  let p = await localforage.getItem(seed);
  return p;
}

function todaysBoard(rows) {
  let words = [];
  [...Array(rows).keys()].forEach(x => {
    let n = (rng.int32() >>> 0) % allWords.length;
    words.push(allWords[n]);
  });
  return words;
}

// This gives us a sequence of tiles from bottom to top, but not in a left-to-right
// or right to left order. Using arng() makes sure the randomness is deterministic
// and seeded by today's date.
function* shuffledTiles(plane, generatedTiles) {
  let used = 0;
  let randomizedTiles = [... new Set(plane.map(x => shuffle([... new Set(x)])).flat())];
  for (let i = 0; i < randomizedTiles.length; i++) {
    yield { 
      tile: generatedTiles[randomizedTiles[i]],
      used: used++
    };
  }
  return { tile: null, used: used };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const tiles = [
  [
    // XX
    {x: 1, y: 0},
  ],
  [
    //  X
    // X
    {x: 1, y: 1},
  ],
  [
    // X
    //  X
    {x: -1, y: 1},
  ],
  [
    // X
    // X
    {x: 0, y: 1},
  ],
];

function generateTiles(words, rowLength) {
  function getFit(cands, r, c) {
    for (const cand of cands) {
      let fits = true;
      for (const co of cand) {
        if (plane[r+co.y][c+co.x]) {
          fits = false;
          break;
        }
      }
      if (fits) { 
        return cand;
      }
    }
    return null;
  }

  let plane = new Array(words.length);
  for (let i = 0; i < words.length; i++) {
    plane[i] = new Array(rowLength).fill(0);
  }


  let tileNumber = 0;
  let generatedTiles = [];
  for (let r = 0; r < plane.length; r++) {
    for (let c = 0; c < plane[r].length; c++) {
      // Skip if already filled.
      if (plane[r][c]) {
        continue
      }
      // Get a list of shuffled tile shapes.
      let cands = shuffle(tiles);
      // If we're at the end of a row, filter out any tiles that won't fit.
      cands = cands.filter(cand => { 
        const l = plane[r].length - 1;
        const h = plane.length - 1;
        for (const co of cand) {
          if (co.x && c == l) return false;
          if (co.x < 0 && c == 0) return false;
          if (co.y && r == h) return false;
        };
        return true;
      });
      tileNumber++;
      const tile = getFit(cands, r, c);

      // We always fill the current tile.
      plane[r][c] = tileNumber;
      generatedTiles[tileNumber] = [[r, c]];

      // No fit, so use a single letter;
      if (!tile) {
        continue;
      }
      
      for (const t of tile) {
        plane[r+t.y][c+t.x] = tileNumber;
        generatedTiles[tileNumber].push([r+t.y, c+t.x]);
      };
    }
  }
  return {
    rows: plane,
    tiles: generatedTiles,
    shuffledTiles: shuffledTiles(plane, generatedTiles),
  };
}

function tilePlane(rows) {
  const words = todaysBoard(rows);
  console.log(words);
  const wordMatrix = words.map(x => x.split(''));
  console.log(Array.from(wordMatrix).reverse());

  const result = generateTiles(words, words[0].length);
  console.log(Array.from(result.rows).reverse());
  console.log(result.tiles);
  result.wordMatrix = wordMatrix;
  return result;

}

export { tilePlane };
