/**
 * @file Angles beyond a single turn: coterminal measures, the period of a ratio,
 * the whole family of solutions to an equation, and a conversion between degrees
 * and radians.
 * @description The keys here are exact expressions rather than decimals. A
 * coterminal angle is a whole number of degrees, a period is a whole number of
 * degrees, and a family of solutions is written as an exact expression over the
 * reals. Nothing is rounded, because a rounded multiple of pi is not a solution to
 * anything.
 *
 * The coterminal branch filters its own distractors rather than trusting them: an
 * option a whole turn away from the answer is coterminal too, so a candidate is
 * only offered when it is not congruent to the key.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmtTrim}from"../shared/Numeric.js";

/** One equation, its whole solution set as LaTeX, and three other solution sets. */
interface Family{
    /** The equation, already typeset. */
    eq: string;
    /** The key. */
    answer: string;
    /** A plain spelling of the key. */
    plain: string;
    /** Three other solution sets, none of which is the same set written differently. */
    wrong: string[];
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

const FAMILIES:Family[]=[
    {
        eq:"\\sin(x) = 0",
        answer:"x = n\\pi",
        plain:"x = nπ",
        wrong:["x = 2n\\pi", "x = n\\pi + \\frac{\\pi}{2}", "x = \\frac{3\\pi}{2} + n\\pi"],
        tier:1
    },
    {
        eq:"\\cos(x) = 0",
        answer:"x = \\frac{\\pi}{2} + n\\pi",
        plain:"x = π/2 + nπ",
        wrong:["x = n\\pi", "x = 2n\\pi", "x = \\frac{\\pi}{3} + n\\pi"],
        tier:1
    },
    {
        eq:"\\tan(x) = 1",
        answer:"x = \\frac{\\pi}{4} + n\\pi",
        plain:"x = π/4 + nπ",
        wrong:["x = \\frac{\\pi}{4} + 2n\\pi", "x = \\frac{\\pi}{2} + n\\pi", "x = \\frac{\\pi}{3} + n\\pi"],
        tier:2
    },
    {
        eq:"\\tan(x) = \\sqrt{3}",
        answer:"x = \\frac{\\pi}{3} + n\\pi",
        plain:"x = π/3 + nπ",
        wrong:["x = \\frac{\\pi}{6} + n\\pi", "x = \\frac{\\pi}{3} + 2n\\pi", "x = \\frac{\\pi}{2} + n\\pi"],
        tier:2
    },
    {
        eq:"\\sin(x) = \\frac{1}{2}",
        answer:"x = n\\pi + (-1)^{n}\\frac{\\pi}{6}",
        plain:"x = nπ + (-1)^n π/6",
        wrong:["x = \\frac{\\pi}{6} + 2n\\pi", "x = \\frac{5\\pi}{6} + 2n\\pi", "x = \\frac{\\pi}{3} + n\\pi"],
        tier:3
    },
    {
        eq:"\\sin(x) = \\frac{\\sqrt{3}}{2}",
        answer:"x = n\\pi + (-1)^{n}\\frac{\\pi}{3}",
        plain:"x = nπ + (-1)^n π/3",
        wrong:["x = \\frac{\\pi}{3} + 2n\\pi", "x = \\frac{2\\pi}{3} + 2n\\pi", "x = \\frac{\\pi}{6} + n\\pi"],
        tier:3
    },
    {
        eq:"\\cos(x) = -\\frac{1}{2}",
        answer:"x = \\frac{2\\pi}{3} + 2n\\pi \\text{ or } x = \\frac{4\\pi}{3} + 2n\\pi",
        plain:"x = 2π/3 + 2nπ or x = 4π/3 + 2nπ",
        wrong:["x = \\frac{\\pi}{3} + 2n\\pi \\text{ or } x = \\frac{5\\pi}{3} + 2n\\pi", "x = \\frac{2\\pi}{3} + n\\pi", "x = \\frac{4\\pi}{3} + n\\pi"],
        tier:3
    }
];

/** The degrees that are exact fractions of pi with denominator 12, 4, 3, 2 or 6. */
const RADIAN_CONVERSIONS:number[]=[30, 45, 60, 90, 105, 120, 135, 150, 165, 210, 225, 240, 300, 315, 330];

/**
 * Reduces an angle in degrees to its position in a single turn.
 *
 * @param degrees - The angle.
 * @returns A representative in [0, 360).
 */
function turnResidue(degrees: number): number{
    let residue=degrees%360;
    if (residue<0) residue+=360;
    return residue;
}

/**
 * The greatest common divisor of two small positive integers, used to reduce the
 * fraction of a turn to lowest terms.
 *
 * @param a - The first integer.
 * @param b - The second integer.
 * @returns The greatest common divisor.
 */
function greatestCommonDivisor(a: number, b: number): number{
    while (b!==0){
        let next=b;
        b=a%b;
        a=next;
    }
    return a;
}

export function generateGeneralSolutions(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["coterminal_angles","the_period","all_solutions","in_radians"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    if (type==="coterminal_angles") return coterminalQuestion(rng, wide);
    if (type==="the_period") return periodQuestion(rng, wide);
    if (type==="all_solutions") return solutionFamilyQuestion(rng);
    return radianQuestion(rng);
}

/**
 * The coterminal branch. A candidate is only offered when it lies in the interval
 * and is not congruent to the answer, because an option a whole turn away is
 * coterminal too and would make the question have two correct answers.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function coterminalQuestion(rng: () => number, wide: boolean): QuestionDto{
    let start=randInt(rng, -1080, wide?1080:720);
    if (start%360===0) start+=37;
    let residue=turnResidue(start);
    let pool=[residue+180, residue+90, residue+270, 180-residue, residue-90, residue+135, 360-residue, residue-45];
    let wrong:number[]=[];
    let seen=new Set<number>([residue]);
    for(let candidate of pool){
        if (candidate<0||candidate>=360) continue;
        if (turnResidue(candidate)===residue) continue;
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        wrong.push(candidate);
    }
    let turns=Math.floor((start-residue)/360);
    let rungs=[
        "Two angles are coterminal exactly when their difference is a whole number of full turns, so reduce the given angle modulo 360 and report the representative inside the interval the question names.",
        `Adding or subtracting 360 leaves the terminal side unchanged. Reduce ${start} modulo 360 to get the representative in [0, 360).`
    ];
    let steps=[
        `A full turn is $ 360^{\\circ} $, and two angles are coterminal when their difference is a multiple of $ 360^{\\circ} $.`,
        `$ ${start} = 360 \\times ${turns} + ${residue} $, so the representative in $ [0, 360) $ is $ ${residue}^{\\circ} $.`,
        `The coterminal angle in the interval is ${residue}, so the answer is ${residue}.`
    ];
    return {
        latex:`Which angle in \\( [0^{\\circ}, 360^{\\circ}) \\) is coterminal with \\( ${start}^{\\circ} \\)?`,
        correct: fmtTrim(residue, 2),
        alternate: fmtTrim(residue, 2)+" degrees",
        display:`${start} - 360\\times${turns} = ${residue}`,
        choices: numberOptions(residue, wrong, 0),
        expectedFormat:"Enter the angle in degrees",
        subskill:"coterminal_angles",
        hints: {rungs, concede: "The answer is "+fmtTrim(residue, 2)+" degrees."},
        solution: steps
    };
}

/**
 * The period branch: how far the graph moves horizontally before it repeats.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function periodQuestion(rng: () => number, wide: boolean): QuestionDto{
    let frequencies=[1, 2, 3, 4, 5, 6, 9, 12];
    let index=randInt(rng, 0, wide?7:4);
    let b=frequencies[index]*randInt(rng, 1, 2);
    let period=360/b;
    let rungs=[
        "A horizontal squeeze by a factor of b multiplies every horizontal measurement by the reciprocal of b, so the period is the base period of the ratio divided by b.",
        `The base period of \\( \\sin(x) \\) is \\( 360^{\\circ} \\), and the factor \\( ${b} \\) inside the argument divides it.`
    ];
    let steps=[
        `The base period of \\( \\sin(x) \\) is $ 360^{\\circ} $, and the factor $ ${b} $ inside the argument divides it.`,
        `$ P = 360^{\\circ} / ${b} $.`,
        `$ P = ${period}^{\\circ} $, so the answer is ${period}.`
    ];
    return {
        latex:`The graph of \\( y = \\sin(${b}x) \\) repeats. What is its period, in degrees?`,
        correct: fmtTrim(period, 2),
        alternate: fmtTrim(period, 2)+" degrees",
        display:`\\frac{360}{${b}} = ${period}`,
        choices: numberOptions(period, [180/b, 720/b, b, 360*b, 360/b+b], 0),
        expectedFormat:"Enter the period in degrees",
        subskill:"the_period",
        hints: {rungs, concede: "The answer is "+fmtTrim(period, 2)+" degrees."},
        solution: steps
    };
}

/**
 * The whole-solution branch: every solution over the reals, written as an exact
 * expression rather than as a rounded multiple of pi.
 *
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function solutionFamilyQuestion(rng: () => number): QuestionDto{
    let row=FAMILIES[Math.floor(rng()*FAMILIES.length)];
    let rungs=[
        "Solve on one period first, then repeat by the period of the ratio the equation uses; the period is the step between consecutive solutions, and it is pi for a tangent but a full turn for a sine or a cosine.",
        "Work in radians over one period, find the solution there, and then write the whole family with that period."
    ];
    let steps=[
        `Find the solution in one period of the ratio the equation uses, then repeat it by the period.`,
        `Written over the reals, with \\( n \\) any whole number, the solution set is $ ${row.answer} $.`,
        `That is the answer, ${row.plain}.`
    ];
    return {
        latex:`Find every solution of \\( ${row.eq} \\) over the reals, with \\( x \\) measured in radians. Write the answer as an exact expression in \\( n \\).`,
        correct: row.answer,
        alternate: row.plain,
        display: row.answer,
        choices: fourOptions(row.answer, row.wrong),
        expectedFormat:"Enter the full solution set, for example x = π/4 + nπ",
        subskill:"all_solutions",
        hints: {rungs, concede: "The answer is "+row.answer+"."},
        solution: steps
    };
}

/**
 * The radian branch: an exact angle in radians, written as a fraction of pi and
 * reduced to lowest terms.
 *
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function radianQuestion(rng: () => number): QuestionDto{
    let degrees=RADIAN_CONVERSIONS[Math.floor(rng()*RADIAN_CONVERSIONS.length)];
    let twelfths=Math.round(degrees*12/180);
    let divisor=greatestCommonDivisor(twelfths, 12);
    let numerator=twelfths/divisor;
    let denominator=12/divisor;
    let answer=numerator===0?"0":numerator===1?`\\frac{\\pi}{${denominator}}`:`\\frac{${numerator}\\pi}{${denominator}}`;
    let plain=numerator===0?"0":numerator===1?`π/${denominator}`:`${numerator}π/${denominator}`;
    let pool=[
        `\\frac{${180-degrees}\\pi}{180}`,
        `\\frac{${180+degrees}\\pi}{180}`,
        `\\frac{${numerator}\\pi}{${denominator*2}}`,
        `\\frac{${2*numerator}\\pi}{${denominator}}`
    ];
    let rungs=[
        "A full turn is 180 degrees and also 2π, so multiply the angle in degrees by π over 180 and then reduce the fraction to lowest terms.",
        `${degrees} degrees is ${degrees}/180 of a turn and one turn is 2π, so the angle is ${degrees}π/180 radians, which reduces to the fraction of pi named in the key.`
    ];
    let steps=[
        `$ ${degrees}^{\\circ} = ${degrees} \\times \\frac{\\pi}{180} = \\frac{${degrees*2}\\pi}{360} $ radians.`,
        `Reducing the fraction gives $ ${plain} $.`,
        `The angle is $ ${answer} $ radians, so the answer is ${answer}.`
    ];
    return {
        latex:`Convert \\( ${degrees}^{\\circ} \\) to radians, giving the answer as an exact multiple of \\( \\pi \\).`,
        correct: answer,
        alternate: plain,
        display:`${degrees}^{\\circ} = ${plain}`,
        choices: fourOptions(answer, pool),
        expectedFormat:"Enter the angle as an exact multiple of π, for example π/4",
        subskill:"in_radians",
        hints: {rungs, concede: "The answer is "+answer+"."},
        solution: steps
    };
}