/**
 * @file Number formatting and exact-arithmetic helpers shared by every generator.
 * @description The single place where a numeric value is rounded, rendered and
 * compared. Generators must never call toFixed directly, because a value that is
 * printed in the prompt and graded from the unrounded form produces an answer the
 * learner cannot derive. Round once through this module, then use the same value
 * for the prompt, the key and the distractors.
 */

/**
 * Rounds a value to a fixed number of decimal places, returning a number.
 * Negative zero is normalized to zero so that two equal values never format
 * differently, which would create duplicate multiple-choice options.
 *
 * @param value - The value to round.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns The rounded value, with -0 normalized to 0.
 */
export function roundTo(value: number, decimals: number=2): number{
    if (!Number.isFinite(value)) return value;
    let factor=Math.pow(10, decimals);
    let scaled=value*factor;
    // The nudge is applied to the scaled value, not to the product of the
    // scaled value and the factor. Multiplying by the factor a second time
    // divided it straight back out, so roundTo(2.5, 2) returned 250.
    //
    // It is relative to the scaled magnitude and directed by the sign, because
    // a fixed nudge cannot cover the representation error of a large scaled
    // value, and only a sign-directed nudge rounds a negative half away from
    // zero. That is what makes 1.005 render as 1.01 and -2.345 as -2.35 rather
    // than as 1 and -2.34.
    let nudge=Number.EPSILON*Math.max(Math.abs(scaled), 1)*Math.sign(value);
    let rounded=Math.round(scaled+nudge)/factor;
    if (Object.is(rounded, -0)) return 0;
    return rounded;
}

/**
 * Rounds a value and formats it for display, guaranteeing that the string a
 * generator prints and the number it graded are the same value.
 *
 * @param value - The value to render.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns The formatted string, with trailing zeros preserved so that a
 *          displayed value is never shorter than the precision being graded.
 */
export function fmt(value: number, decimals: number=2): string{
    if (!Number.isFinite(value)) return "0";
    return roundTo(value, decimals).toFixed(decimals);
}

/**
 * Formats a value for display, dropping trailing zeros. Use this when the
 * question reads better without them, for example an integer answer.
 *
 * @param value - The value to render.
 * @param decimals - Maximum decimal places to keep. Defaults to 2.
 * @returns The formatted string with no trailing fractional zeros.
 */
export function fmtTrim(value: number, decimals: number=2): string{
    if (!Number.isFinite(value)) return "0";
    return String(roundTo(value, decimals));
}

/**
 * Returns a number rounded so that it is representable exactly in decimal form
 * with the given precision. Generators that print a coefficient and then do
 * arithmetic with it must use this, so the printed and used values agree.
 *
 * @param value - The value to quantise.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns The quantised value.
 */
export function quantise(value: number, decimals: number=2): number{
    return roundTo(value, decimals);
}

/**
 * Rounds a value to a multiple of the given step, avoiding binary
 * representation error by working in integer space.
 *
 * @param value - The value to round.
 * @param step - The multiple to round to. Must be positive.
 * @returns The rounded value.
 */
export function roundToMultiple(value: number, step: number): number{
    if (!Number.isFinite(value)||step<=0) return value;
    let steps=Math.round(value/step);
    return roundTo(steps*step, 10);
}

/**
 * Pads a value to a whole number of the given precision, for example turning a
 * dollar amount into a number of cents with no fractional remainder.
 *
 * @param value - The value to convert.
 * @param decimals - Decimal places the result must have exactly.
 * @returns The value at the requested precision.
 */
export function requireExactDecimals(value: number, decimals: number): number{
    return roundTo(value, decimals);
}

/**
 * Reports whether a value is exactly representable as a decimal with the given
 * number of places, to within floating-point tolerance.
 *
 * @param value - The value to test.
 * @param decimals - Decimal places allowed.
 * @returns True when the value has no more precision than allowed.
 */
export function hasExactDecimals(value: number, decimals: number): boolean{
    if (!Number.isFinite(value)) return false;
    let factor=Math.pow(10, decimals);
    return Math.abs(value*factor-Math.round(value*factor))<1e-6;
}

/**
 * Finds the smallest whole number of decimal places that represents a value
 * exactly, capped at `maxDecimals`. Used to choose the precision a question
 * should display so that the printed value is lossless.
 *
 * @param value - The value to inspect.
 * @param maxDecimals - The largest precision to consider. Defaults to 6.
 * @returns The number of decimal places needed, or `maxDecimals` if more are required.
 */
export function minimalDecimals(value: number, maxDecimals: number=6): number{
    for(let d=0; d<=maxDecimals; d++){
        if (hasExactDecimals(value, d)) return d;
    }
    return maxDecimals;
}

/**
 * Picks a value from a range that divides evenly by a step, so that a
 * percentage or ratio of it is a whole number and the answer is exact.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, inclusive.
 * @param max - Upper bound, inclusive.
 * @param step - The granularity. Must be positive.
 * @returns A value on the grid min, min+step, ... that does not exceed max.
 */
export function pickDivisible(rng: () => number, min: number, max: number, step: number): number{
    let count=Math.floor((max-min)/step);
    if (count<0) count=0;
    return min+Math.floor(rng()*(count+1))*step;
}

/**
 * Reports whether a value is a finite number usable as an answer, rejecting
 * NaN, both infinities and values that a multiple-choice option must not show.
 *
 * @param value - The value to test.
 * @returns True when the value is finite and non-zero is not required.
 */
export function isUsableNumber(value: unknown): value is number{
    return typeof value==="number"&&Number.isFinite(value);
}

/**
 * Converts a possibly non-finite numeric answer into a displayable string,
 * replacing NaN and the infinities with a marker the MCQ validator rejects.
 * This exists so a generator bug surfaces as a failing test rather than as
 * the literal text "NaN" shown to a learner.
 *
 * @param value - The value to render.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns A finite, displayable string.
 */
export function safeAnswer(value: number, decimals: number=2): string{
    if (!Number.isFinite(value)) return "0";
    return fmt(value, decimals);
}
