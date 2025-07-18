import {COLORS} from '../utils/colors';

export function getResultColor(multiplier) {
    return COLORS.multiplierBackground[multiplier];
}

export function getResultTextColor(multiplier) {
    if (multiplier === '1') return COLORS.textColor.black;
    return COLORS.textColor.yellow;
}

/**
 * Returns the outline style for the result box based on the correctness of the answer.
 * 
 * @param {number} multiplier (for reasons beyond my understanding, the temporary green outline only works when 'multiplier' is a listed parameter)
 * @param {boolean} correct - indicates if the submitted value is correct
 * @param {boolean} attempted -  indicates if the user has attempted to answer
 * @param {boolean} justCorrect - indicates if the answer was just correct (for temporary green outline)
 * @returns outliine style
 */
export function getResultOutline(multiplier, correct, attempted, justCorrect) {
    if (!attempted) return `1px solid ${COLORS.outline.default}`;   
    if (justCorrect) return `2px solid ${COLORS.outline.green}`;
    if (correct) return `1px solid ${COLORS.outline.default}`;     
    return `2px solid ${COLORS.outline.red}`;    
}
