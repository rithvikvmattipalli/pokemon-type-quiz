/**
 * @param {string[]} array - The array of strings to shuffle.
 * @returns {string[]} - A new shuffled array of strings.
 * 
 * Returns a new array with the strings shuffled randomly.
 * Uses the Fisher–Yates (Knuth) shuffle algorithm.
 */
export function shuffleArray(array) {
    const arr = [...array]; 
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * @param {string} val - input value to normalize 
 * @returns {string} - normalized value
 * 
 * Normalizes a user input value into one of the standard Pokémon type effectiveness multipliers.
 */
export function normalizeInput(val) {
    if (!val) return '';
    const map = {
      '4': '4', '4x': '4',

      '2': '2', '2x': '2',

      '1': '1', '1x': '1',

      '.5' : '0.5', '.5x': '0.5',
      '0.5': '0.5', '0.5x': '0.5', 
      '1/2': '0.5', '1/2x': '0.5',

      '0.25': '0.25', '0.25x': '0.25', 
      '1/4': '0.25', '1/4x': '0.25',

      '0': '0', '0x': '0'
    };
    return map[val.toLowerCase()] ?? val;
  }
