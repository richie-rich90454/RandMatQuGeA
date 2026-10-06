/**
 * @file A tolerance band, used to tell "these two answers are the same number"
 * apart from "these two are different numbers that merely look similar".
 * @description Two thresholds, both set from the precision a learner can
 * actually see. A displayed value is rendered to at most two decimal places, so
 * two values that agree to within a thousandth of the last displayed digit are
 * indistinguishable to the person being asked, and treating them as different
 * would mark a correct answer wrong. Conversely, two values that differ in their
 * second decimal place are genuinely different answers and must not be accepted.
 */

/** The half-width of the band inside which two values are the same answer. */
const SAME_ANSWER_BAND=0.005;

/**
 * Reports whether two values denote the same answer, given how many decimal
 * places the question displays.
 *
 * A displayed value of `2.30` and a submitted `2.3` are the same answer. A
 * displayed `2.30` and a submitted `2.31` are not. The comparison is therefore
 * made at half of the last displayed place, which is the boundary at which a
 * human would judge them different.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @param displayedDecimals - Decimal places the question displays. Defaults to 2.
 * @returns True when the two are the same answer at the displayed precision.
 */
export function sameAnswer(a: number, b: number, displayedDecimals: number=2): boolean{
    if (!Number.isFinite(a)||!Number.isFinite(b)) return false;
    let band=Math.pow(10, -displayedDecimals)/2;
    // Widen slightly to absorb binary representation error, which is
    // 2.3 * (1 - 2^-52) rather than exactly 2.3.
    band=Math.max(band, SAME_ANSWER_BAND*Math.pow(10, -displayedDecimals+1));
    return Math.abs(a-b)<=band;
}

/**
 * Reports whether two answer strings denote the same answer at the precision the
 * question displays. A string that is not a number falls back to an exact
 * trimmed comparison, so a word answer is never accepted by accident.
 *
 * @param a - The first answer.
 * @param b - The second answer.
 * @param displayedDecimals - Decimal places the question displays. Defaults to 2.
 * @returns True when the two are the same answer.
 */
export function sameAnswerString(a: string, b: string, displayedDecimals: number=2): boolean{
    let left=Number(a);
    let right=Number(b);
    if (Number.isFinite(left)&&Number.isFinite(right)&&a.trim()!==""&&b.trim()!==""){
        return sameAnswer(left, right, displayedDecimals);
    }
    return a.trim()===b.trim();
}
