/**
 * @file Answer normalisation shared by the checker, the option builder and the
 * difficulty gate.
 * @description The app has to decide whether two answer strings mean the same
 * thing, and it has to do so in three places: when grading a typed answer, when
 * deciding whether two multiple-choice options are duplicates, and when deciding
 * whether a topic's difficulty parameter actually changed anything. Putting that
 * decision in one module is what stops the three from disagreeing, which is how
 * "0.50" and "0.5" came to be treated as two different options in one place and
 * as the same answer in another.
 */

import Fraction from "fraction.js";

/**
 * Reports whether a string is a plain finite number.
 *
 * @param value - The string to test.
 * @returns True when the string parses to a finite number.
 */
export function isFiniteNumberText(value: string): boolean{
    if (typeof value!=="string") return false;
    let trimmed=value.trim();
    if (trimmed==="") return false;
    let parsed=Number(trimmed);
    return Number.isFinite(parsed);
}

/**
 * Reports whether two numbers are equal to within the precision a learner can
 * actually see. A question displayed to two decimal places cannot distinguish
 * 2.30 from 2.304, so accepting both is correct, while 2.30 and 2.31 are
 * different answers and must not be accepted.
 *
 * @param a - The first value, as text.
 * @param b - The second value, as text.
 * @param displayedDecimals - Decimal places the question displays. Defaults to 2.
 * @returns True when the two are the same value at the displayed precision.
 */
export function sameNumericValue(a: string, b: string, displayedDecimals: number=2): boolean{
    if (canonicalNumeric(a)===canonicalNumeric(b)) return true;
    let left=Number(a);
    let right=Number(b);
    if (!Number.isFinite(left)||!Number.isFinite(right)) return false;
    if (left===right) return true;
    let band=Math.pow(10, -displayedDecimals)/2;
    return Math.abs(left-right)<=band;
}

/**
 * Reduces a numeric string to one spelling, so that two spellings of the same
 * value compare equal. Uses exact rational arithmetic, so "14/3" and "28/6"
 * canonicalise to the same thing rather than merely comparing close.
 *
 * @param value - The numeric string.
 * @returns The canonical spelling, or the trimmed input when it is not numeric.
 */
export function canonicalNumeric(value: string): string{
    if (typeof value!=="string") return "";
    let trimmed=value.trim();
    if (!isNumericText(trimmed)) return trimmed;
    let exact=toFraction(trimmed);
    if (!exact) return trimmed;
    return exact;
}

/**
 * Reports whether a string is a finite number, written either as a plain number
 * or as an exact fraction. Number() alone answers false for "3/4", which is a
 * correct answer shape for several topics, so the fraction form is accepted too.
 *
 * @param value - The string to test.
 * @returns True when the string is numeric.
 */
export function isNumericText(value: string): boolean{
    if (typeof value!=="string") return false;
    let trimmed=value.trim();
    if (trimmed==="") return false;
    if (Number.isFinite(Number(trimmed))) return true;
    if (!/^-?\d+\s*\/\s*\d+$/.test(trimmed)) return false;
    let [n, d]=trimmed.split("/").map(part=>Number(part.trim()));
    return Number.isFinite(n)&&Number.isFinite(d)&&d!==0;
}

/**
 * Converts a numeric string to an exact reduced fraction string, or returns null
 * when the string is not a plain rational. The arithmetic is exact, so 14/3 and
 * 28/6 canonicalise alike and no binary representation error survives.
 *
 * @param value - The numeric string.
 * @returns A reduced "n" or "n/d" string, or null.
 */
function toFraction(value: string): string|null{
    let trimmed=value.trim();
    try{
        // fraction.js parses "3/4" and "0.5" exactly, but rejects exponent
        // notation, so that form is handed over as the number it denotes.
        let exact=/[eE]/.test(trimmed)?new Fraction(Number(trimmed)):new Fraction(trimmed);
        if (!exact.s||!exact.n) return null;
        return exact.s<0?"-"+exact.n+"/"+exact.d:exact.n+"/"+exact.d;
    }
    catch{
        return null;
    }
}
