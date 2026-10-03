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
 * Rewrites `\frac{a}{b}` as `(a)/(b)`, including when either group itself holds
 * a braced group.
 *
 * Refusing braces inside a group looks safe and is not: the keys this curriculum
 * prints are mostly of that shape. The half-angle surd is
 * `\frac{\sqrt{6}-\sqrt{2}}{4}` and a reciprocal of a ratio is
 * `\frac{1}{\sin(30^{\circ})}`. Both survive a brace-free pattern untouched, and
 * the checker is then handed a `\frac` command it cannot parse, so a key that
 * prints perfectly well cannot be graded.
 *
 * The rewrite repeats until the string stops changing, bounded by a pass count.
 * Each pass strictly removes one `\frac` and introduces none, so the loop
 * terminates; the bound is there so that a string which somehow never settles
 * costs eight passes rather than the test run.
 *
 * @param value - The text to rewrite.
 * @returns The text with every `\frac` flattened.
 */
function flattenFractions(value: string): string{
    let out=value;
    for(let pass=0;pass<8;pass++){
        let next=out.replace(/\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g,"($1)/($2)");
        if (next===out) return out;
        out=next;
    }
    return out;
}

/**
 * Rewrites LaTeX into the plain expression a checker can evaluate, so that a key
 * written as a fraction is comparable with the decimal a learner typed. Only the
 * constructs the app actually prints as an answer are handled; anything else
 * keeps its backslash stripped and is left to the caller's comparison.
 *
 * An angle the curriculum prints as `45^{\circ}` is the number 45, so the degree
 * mark goes rather than becoming a symbol the checker has to know about, and a
 * `\cdot` becomes the `*` a learner would have typed. A radical printed as the
 * single Unicode character `√` becomes `sqrt(...)` for the same reason: the
 * checker reads `sqrt(x)` and has never read `√x`.
 *
 * @param value - The LaTeX or plain text.
 * @returns The plain equivalent.
 */
export function latexToPlain(value: string): string{
    if (typeof value!=="string") return "";
    return flattenFractions(value)
        .replace(/\\(?:left|right|displaystyle|,|;|!)/g,"")
        .replace(/\\sqrt\{([^{}]*)\}/g,"sqrt($1)")
        // The degree mark and the multiplication dot have to be rewritten before
        // the generic rule below, which would leave "45^(circ)" and "2cdot3" for
        // the checker to read as two symbols multiplied together.
        .replace(/\^\{?\\circ\}?/g,"")
        .replace(/\\(?:cdot|times)/g,"*")
        // The Unicode radical is a single character in a way a function call is
        // not, so "√x + 2" has to become "sqrt(x) + 2" or the checker reads the
        // root sign as a symbol multiplied by x. A bar over the radicand is
        // ordinary LaTeX and is already handled above.
        .replace(/√\s*([0-9]+(?:\.[0-9]+)?)/g,"sqrt($1)")
        .replace(/√\s*([A-Za-z][A-Za-z0-9]*)/g,"sqrt($1)")
        .replace(/\\([a-zA-Z]+)/g,"$1")
        .replace(/[{}]/g,"");
}

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
