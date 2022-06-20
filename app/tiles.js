import { allWords } from './words.js';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
  return { plane: plane, tiles: generatedTiles}
}

function tilePlane(rows) {
  const rPos = getRandomInt(allWords.length - 20);
  const words = shuffle(allWords).slice(rPos,rPos + rows);
  const wordMatrix = words.map(x => x.split(''));
  console.log(Array.from(wordMatrix).reverse());

  const result = generateTiles(words, words[0].length);
  console.log(Array.from(result.plane).reverse());
  console.log(result.tiles);
  result.wordMatrix = wordMatrix;
  return result;

}

export { tilePlane };
