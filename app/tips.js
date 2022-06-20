const tips = [
      "Start by clicking a square on the bottom row to place the tile there." ,
      "You can place the tile on incorrect guesses to overwrite them." ,
      "Remember the value for incorrectly placed tiles - it will help you figure out the next word." ,
      "The objective is to get as many green rows as possible." ,
];
function* getNext(array) {
    for (let i = 0; i < array.length; i++) {
      yield array[i];
    }
    return;
}

export const wordrisTips = getNext(tips);
