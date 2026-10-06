/**
 * Utility functions for trigonometry questions.
 * @fileoverview Provides helper functions for formatting fractions of π, the special-angle tables every branch draws from, and the pools of honest wrong answers a value question offers.
 * @date 2026-03-15
 */
import{roundTo}from"../shared/Numeric";

/**
 * Converts a numeric angle in radians to a fraction of π if possible.
 * @param value - Angle in radians.
 * @returns A string representing the angle as a multiple of π (e.g., "π/2", "3π/4", or decimal if not exact).
 */
export function formatPiFraction(value: number): string {
    const pi=Math.PI;
    const tolerance=1e-6;
    if (Math.abs(value) < tolerance) return "0";
    let numerator=value / pi;
    for (let den=1; den<=8; den++) {
        let num=numerator * den;
        if (Math.abs(num - Math.round(num)) < tolerance) {
            let rounded=Math.round(num);
            if (den===1) {
                if (rounded===1) return "π";
                if (rounded===-1) return "-π";
                return rounded + "π";
            }
            if (rounded===1) return `π/${den}`;
            if (rounded===-1) return `-π/${den}`;
            return `${rounded}π/${den}`;
        }
    }
    return value.toFixed(2);
}
export function getTrigFunction(func: string): string {
    switch(func) {
        case "sin": return "sin";
        case "cos": return "cos";
        case "tan": return "tan";
        case "cot": return "cot";
        case "sec": return "sec";
        case "csc": return "csc";
        default: return "unknown";
    }
}
/**
 * Picks an angle appropriate to the difficulty, from the injected random source
 * rather than the global one. A caller that seeded the generator to produce a
 * daily challenge was getting a different angle on every visit, because the
 * draw here ignored the seed.
 *
 * @param difficulty - The difficulty level.
 * @param rng - The injected random source.
 * @returns The angle, in radians for easy and hard and in radians for medium as
 *          well, since the special angles are stored in radians.
 */
export function getAngle(difficulty: string, rng: () => number=Math.random): number {
    if (difficulty==="easy") {
        return Math.floor(rng()*360);
    } else if (difficulty==="hard") {
        return rng()*2*Math.PI;
    } else if (difficulty==="medium") {
        let specialAngles=[0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, 2*Math.PI/3, 3*Math.PI/4, 5*Math.PI/6, Math.PI, 7*Math.PI/6, 5*Math.PI/4, 4*Math.PI/3, 3*Math.PI/2, 5*Math.PI/3, 7*Math.PI/4, 11*Math.PI/6];
        return specialAngles[Math.floor(rng()*specialAngles.length)];
    } else {
        return -1;
    }
}
export function getPeriod(func: string): number {
    if (func==="sin" || func==="cos" || func==="sec" || func==="csc") {
        return 2*Math.PI;
    } else if (func==="tan" || func==="cot") {
        return Math.PI;
    } else {
        return -1;
    }
}
export function formatAngle(angle: number, isRadians: boolean): string {
    if (isRadians) {
        if (angle===0) return "0";
        let frac=formatPiFraction(angle);
        return frac;
    } else {
        return angle + "°";
    }
}
export function getReferenceAngle(angle: number): number {
    const twoPi=2*Math.PI;
    let normalized=angle % twoPi;
    if (normalized < 0) {
        normalized+=twoPi;
    }
    if (normalized===0) {
        return 0;
    }
    if (normalized > 0 && normalized <= Math.PI/2) {
        return normalized;
    } else if (normalized > Math.PI/2 && normalized <= Math.PI) {
        return Math.PI - normalized;
    } else if (normalized > Math.PI && normalized <= 3*Math.PI/2) {
        return normalized - Math.PI;
    } else {
        return twoPi - normalized;
    }
}
/** The special angles in degrees, in the order every table in this subject lists them. */
export const SPECIAL_ANGLES: number[]=[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
/** The non-zero phase shifts a phase-shift question may name, as eighths of a turn. */
export const PHASE_SHIFTS: number[]=[0.39, 0.79, 1.18, 1.57, 1.96, 2.36, 2.75, 3.14];

/**
 * Prints a special angle as the exact fraction of pi a prompt should show, so an
 * evaluate question names `\frac{\pi}{6}` rather than the decimal `0.52` while its key
 * is graded to two places. The fraction is exact and reduced, so the learner is never
 * asked to recognize a rounded value and never sees a numerator they would have to
 * simplify.
 *
 * `formatPiFraction` writes a bare Unicode pi and a denominator in plain text, which is
 * the spelling this subject's own prompts already use, so the leading coefficient is
 * turned into a proper `\frac` here and the result is inside a math group.
 *
 * @param degrees - The angle, which is expected to be a multiple of fifteen degrees.
 * @returns The LaTeX label for the angle.
 */
export function piLabel(degrees: number): string{
    let fraction=formatPiFraction(degrees*Math.PI/180);
    let parts=fraction.match(/^(-?)(\d*)π(?:\/(\d+))?$/);
    if (!parts) return fraction;
    let sign=parts[1];
    let numerator=parts[2]===""?"\\pi":(parts[2]==="1"?"\\pi":parts[2]+"\\pi");
    if (parts[3]===undefined) return sign+numerator;
    return sign+"\\frac{"+numerator+"}{"+parts[3]+"}";
}

/**
 * Lists the other angles a learner plausibly reaches when they combine the wrong two
 * angles: the classic quarter- and eighth-turn slips, the complement, the
 * supplement, and the halving and doubling that a double-angle or half-angle question
 * invites.
 *
 * @param degrees - The angle the question actually names.
 * @returns The nearby angles, in the order a learner is most likely to reach them.
 */
function nearbyAngles(degrees: number): number[]{
    return [degrees+30, degrees-30, degrees+45, degrees-45, degrees+60, degrees-60, degrees+90, 90-degrees, 180-degrees, degrees/2, degrees*2, -degrees];
}

/**
 * Builds the pool of honest wrong answers for a question whose answer is the value
 * of a trigonometric ratio at a named angle.
 *
 * The pool is drawn from the ratios themselves rather than from the answer, because a
 * wrong answer here is a value of a ratio at an angle the learner actually reached,
 * and the two ways they get there are a sign slip and a misread angle or a misread
 * function. Every candidate is finite by construction, because an angle at which the
 * ratio is undefined is simply skipped, which is what keeps `1/cos(0)` from ever being
 * offered for a secant question.
 *
 * The pool names more candidates than a four-option question needs and deliberately
 * leaves the repeats in: deciding which of them are real, distinct options is the job
 * of the one assembler in `src/modules/shared/Options.ts`, and a pool that pre-filtered
 * them by value would be a second convention for the same question.
 *
 * @param ratios - The ratios to draw from, most plausible first. The ratio the
 *                 question asks about goes first, so its own value at a nearby angle
 *                 is the first candidate offered.
 * @param degrees - The angle the question names, in degrees.
 * @param decimals - Decimal places the branch grades at. The pool is rendered at the
 *                   key's precision, so an option can never differ from the key only
 *                   in how many zeros it carries.
 * @returns Finite values, most plausible first, in the key's own precision.
 */
export function angleValuePool(ratios: ((radians: number) => number)[], degrees: number, decimals: number): string[]{
    let pool: string[]=[];
    let add=(ratio: (radians: number) => number, angleDegrees: number): void=>{
        let value=ratio(angleDegrees*Math.PI/180);
        if (!Number.isFinite(value)) return;
        pool.push(roundTo(value, decimals).toFixed(decimals));
    };
    // The sign slip is the most frequent error of all, so it is offered first. A
    // ratio whose value is zero has no distinguishable sign, and the pool simply
    // does not contain it.
    add((radians: number) => -ratios[0](radians), degrees);
    for(let ratio of ratios) add(ratio, degrees);
    for(let angle of nearbyAngles(degrees)){
        for(let ratio of ratios) add(ratio, angle);
    }
    return pool;
}

/**
 * Lists the degrees at which a ratio is finite, which is the set a question about
 * that ratio may name. Excluding the undefined angles is what keeps `sec(90°)` and
 * `cot(0°)` off the table, and it is the same exclusion that keeps the reciprocal
 * of a zero value out of a distractor list.
 *
 * @param ratio - The ratio to test.
 * @returns The usable angles, in the order the special-angle table lists them.
 */
export function definedDegrees(ratio: (radians: number) => number): number[]{
    return SPECIAL_ANGLES.filter(degrees=>Number.isFinite(ratio(degrees*Math.PI/180)));
}

/**
 * Builds the pool of wrong periods for a graph of a ratio with a given frequency.
 *
 * A period question goes wrong in three identifiable ways, and each is an honest
 * option: the learner reads a different frequency off the graph, halves the period
 * by forgetting the factor of two, or multiplies where the formula divides. The
 * neighboring frequencies are what the first mistake produces, and they are drawn
 * from a table that never contains zero, which is what stops a frequency of one from
 * yielding a period of `2π/0`.
 *
 * @param fundamental - The period of the ratio before the frequency is applied, which
 *                      is `2π` for sine, cosine, secant and cosecant and `π` for
 *                      tangent and cotangent.
 * @param frequency - The frequency the graph actually has.
 * @param decimals - Decimal places the branch grades at.
 * @returns Finite periods, most plausible first, in the key's precision.
 */
export function periodPool(fundamental: number, frequency: number, decimals: number): string[]{
    let pool: string[]=[];
    let add=(value: number): void=>{
        if (!Number.isFinite(value)) return;
        pool.push(roundTo(value, decimals).toFixed(decimals));
    };
    add(fundamental/frequency/2);
    for(let other=1; other<=6; other++){
        if (other===frequency) continue;
        add(fundamental/other);
    }
    add(fundamental);
    add(fundamental*frequency);
    return pool;
}