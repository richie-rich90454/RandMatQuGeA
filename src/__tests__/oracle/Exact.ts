/**
 * @file Tier-one answer equivalence: exact rational arithmetic.
 * @description The check that a learner is not told something false. Two answers
 * that a person would call the same number must be recognised as equal, and two
 * that a person would call different must never be. This module uses
 * `fraction.js`, which is BigInt-backed and never round-trips through a float,
 * so `14/3` equals `28/6` and `0.1+0.2` equals `0.3` exactly.
 *
 * The critical usage rule, from the library's own documentation, is that decimal
 * literals must be passed as strings. `new Fraction(0.1)` goes through
 * Farey-sequence approximation; `new Fraction("0.1")` is exactly one tenth. Every
 * entry point here converts through the string form for that reason.
 */

/** BigInt-backed exact rational, re-exported so tests share one construction path. */
import Fraction from "fraction.js";

/**
 * Parses a numeric string into an exact rational, or returns null when the
 * string is not a plain number. Percentages, currency, LaTeX and words are
 * rejected here and handled by the symbolic tier.
 *
 * @param value - The string to parse, for example "-3/4" or "2.50".
 * @returns The exact value, or null when it is not a plain rational.
 */
export function parseExact(value: string): Fraction|null{
    let trimmed=(value==null?"":String(value)).trim();
    if (trimmed==="") return null;
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)&&!/^[+-]?\d+\s*\/\s*\d+$/.test(trimmed)){
        return null;
    }
    try{
        if (trimmed.includes("/")){
            let parts=trimmed.split("/");
            let num=Number(parts[0].trim());
            let den=Number(parts[1].trim());
            if (!Number.isFinite(num)||!Number.isFinite(den)||den===0) return null;
            return new Fraction(num, den);
        }
        return new Fraction(trimmed);
    }
    catch{
        return null;
    }
}

/**
 * Canonicalises a numeric string to a single spelling, so that two spellings of
 * the same value compare equal and a multiple-choice set cannot contain a
 * duplicate. Trailing zeros, an explicit plus sign and a leading zero in the
 * fractional part are all removed.
 *
 * @param value - The numeric string to canonicalise.
 * @returns The canonical spelling, or the trimmed input when it is not numeric.
 */
export function canonicaliseNumeric(value: string): string{
    let exact=parseExact(value);
    if (!exact) return (value==null?"":String(value)).trim();
    let [n, d]=exact.simplify(0.000001).toFraction().split("/");
    if (d==="1") return n;
    return n+"/"+d;
}

/**
 * Reports whether two answer strings denote the same exact number.
 *
 * @param a - The first answer string.
 * @param b - The second answer string.
 * @returns True when both are plain numbers and are exactly equal.
 */
export function equalExact(a: string, b: string): boolean{
    let left=parseExact(a);
    let right=parseExact(b);
    if (!left||!right) return false;
    return left.equals(right);
}

/**
 * Reports whether an answer string is a plain finite number, which every graded
 * numeric answer must be. A generator that produced "NaN", "Infinity" or an
 * empty string fails here.
 *
 * @param value - The answer string to test.
 * @returns True when the string is a plain finite number.
 */
export function isPlainNumber(value: string): boolean{
    return parseExact(value)!==null;
}

/**
 * Compares two values that may be irrational, using a relative tolerance scaled
 * by the magnitude of the operands. A fixed absolute tolerance is wrong at both
 * ends: it accepts visibly different small values and rejects equal large ones
 * once floating-point representation error exceeds it.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @param relativeTolerance - Allowed relative difference. Defaults to 1e-9.
 * @returns True when the values agree to within the tolerance.
 */
export function approximatelyEqual(a: number, b: number, relativeTolerance: number=1e-9): boolean{
    if (!Number.isFinite(a)||!Number.isFinite(b)) return false;
    if (a===b) return true;
    let scale=Math.max(Math.abs(a), Math.abs(b));
    if (scale<1) scale=1;
    return Math.abs(a-b)/scale<=relativeTolerance;
}

/**
 * Reports whether two answer strings are numerically equal, accepting a
 * tolerance for genuinely irrational results. Rational answers are compared
 * exactly first, so a tolerance never masks a genuine arithmetic difference in
 * a fraction.
 *
 * @param a - The first answer string.
 * @param b - The second answer string.
 * @param relativeTolerance - Allowed relative difference for irrational values.
 * @returns True when the two denote the same number.
 */
export function equalNumeric(a: string, b: string, relativeTolerance: number=1e-9): boolean{
    if (equalExact(a, b)) return true;
    let left=Number(a);
    let right=Number(b);
    if (!Number.isFinite(left)||!Number.isFinite(right)) return false;
    if (parseExact(a)&&parseExact(b)) return false;
    return approximatelyEqual(left, right, relativeTolerance);
}

/**
 * Converts a decimal string to the nearest exactly-representable rational, for
 * comparing a generated decimal against a hand-computed expectation.
 *
 * @param value - The decimal string.
 * @returns The exact value, or null when the string is not numeric.
 */
export function toExact(value: string): Fraction|null{
    return parseExact(value);
}
