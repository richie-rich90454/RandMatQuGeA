/**
 * @file The exact values of trigonometric ratios, as radicals rather than decimals.
 * @description The key in this file is never a decimal. `sin(150°)` is `1/2`, not
 * `0.5`, and `sin(15°)` is `(sqrt 6 - sqrt 2)/4`, not `0.2588`: a decimal key for
 * an exact value is a rounded answer to a question that has an exact one. The
 * tables below hold the exact LaTeX for each ratio at each special angle, and the
 * quadrant is what decides the sign.
 *
 * The four branches are four ways of arriving at a surd rather than four
 * collections of surds: the eighth-of-a-turn family, the sign the quadrant
 * imposes, the half-angle identities applied to a familiar whole angle, and the
 * sum and difference identities applied to two familiar angles at once. Each
 * difficulty keeps a different slice of its table, so the levels ask genuinely
 * different questions.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";

/** The exact value of one ratio at one special angle. */
interface Exact{
    /** The ratio, already typeset. */
    ratio: string;
    /** The angle in degrees, used to build the prompt. */
    degrees: number;
    /** The exact value as LaTeX. */
    value: string;
    /** A plain spelling of the value. */
    plain: string;
}

/** The eighth-of-a-turn family, where the reference angle is 45 degrees. */
const QUARTER:Exact[]=[
    {ratio:"\\sin", degrees:45, value:"\\frac{\\sqrt{2}}{2}", plain:"sqrt(2)/2"},
    {ratio:"\\cos", degrees:45, value:"\\frac{\\sqrt{2}}{2}", plain:"sqrt(2)/2"},
    {ratio:"\\tan", degrees:45, value:"1", plain:"1"},
    {ratio:"\\sin", degrees:135, value:"\\frac{\\sqrt{2}}{2}", plain:"sqrt(2)/2"},
    {ratio:"\\cos", degrees:135, value:"-\\frac{\\sqrt{2}}{2}", plain:"-sqrt(2)/2"},
    {ratio:"\\tan", degrees:135, value:"-1", plain:"-1"},
    {ratio:"\\sec", degrees:45, value:"\\sqrt{2}", plain:"sqrt(2)"},
    {ratio:"\\csc", degrees:45, value:"\\sqrt{2}", plain:"sqrt(2)"},
    {ratio:"\\sec", degrees:135, value:"-\\sqrt{2}", plain:"-sqrt(2)"},
    {ratio:"\\csc", degrees:135, value:"\\sqrt{2}", plain:"sqrt(2)"}
];

/** The ratios away from the axes, where the quadrant rather than the table decides the sign. */
const QUADRANT:Exact[]=[
    {ratio:"\\sin", degrees:120, value:"\\frac{\\sqrt{3}}{2}", plain:"sqrt(3)/2"},
    {ratio:"\\cos", degrees:120, value:"-\\frac{1}{2}", plain:"-1/2"},
    {ratio:"\\tan", degrees:120, value:"-\\sqrt{3}", plain:"-sqrt(3)"},
    {ratio:"\\sin", degrees:150, value:"\\frac{1}{2}", plain:"1/2"},
    {ratio:"\\cos", degrees:150, value:"-\\frac{\\sqrt{3}}{2}", plain:"-sqrt(3)/2"},
    {ratio:"\\tan", degrees:150, value:"-\\frac{\\sqrt{3}}{3}", plain:"-sqrt(3)/3"},
    {ratio:"\\sin", degrees:210, value:"-\\frac{1}{2}", plain:"-1/2"},
    {ratio:"\\cos", degrees:210, value:"-\\frac{\\sqrt{3}}{2}", plain:"-sqrt(3)/2"},
    {ratio:"\\tan", degrees:210, value:"\\frac{\\sqrt{3}}{3}", plain:"sqrt(3)/3"},
    {ratio:"\\sin", degrees:240, value:"-\\frac{\\sqrt{3}}{2}", plain:"-sqrt(3)/2"},
    {ratio:"\\cos", degrees:240, value:"-\\frac{1}{2}", plain:"-1/2"},
    {ratio:"\\tan", degrees:240, value:"\\sqrt{3}", plain:"sqrt(3)"},
    {ratio:"\\sin", degrees:300, value:"-\\frac{\\sqrt{3}}{2}", plain:"-sqrt(3)/2"},
    {ratio:"\\cos", degrees:300, value:"\\frac{1}{2}", plain:"1/2"},
    {ratio:"\\sin", degrees:330, value:"-\\frac{1}{2}", plain:"-1/2"},
    {ratio:"\\cos", degrees:330, value:"\\frac{\\sqrt{3}}{2}", plain:"sqrt(3)/2"},
    {ratio:"\\tan", degrees:330, value:"-\\frac{\\sqrt{3}}{3}", plain:"-sqrt(3)/3"}
];

/** The half-angle identities applied to a familiar whole angle. */
const HALF:Exact[]=[
    {ratio:"\\sin", degrees:15, value:"\\frac{\\sqrt{6}-\\sqrt{2}}{4}", plain:"(sqrt(6)-sqrt(2))/4"},
    {ratio:"\\cos", degrees:15, value:"\\frac{\\sqrt{6}+\\sqrt{2}}{4}", plain:"(sqrt(6)+sqrt(2))/4"},
    {ratio:"\\tan", degrees:15, value:"2-\\sqrt{3}", plain:"2-sqrt(3)"},
    {ratio:"\\sin", degrees:75, value:"\\frac{\\sqrt{6}+\\sqrt{2}}{4}", plain:"(sqrt(6)+sqrt(2))/4"},
    {ratio:"\\cos", degrees:75, value:"\\frac{\\sqrt{6}-\\sqrt{2}}{4}", plain:"(sqrt(6)-sqrt(2))/4"},
    {ratio:"\\tan", degrees:75, value:"2+\\sqrt{3}", plain:"2+sqrt(3)"}
];

/** The sum and difference identities applied to two familiar angles at once. */
const BUILT:Exact[]=[
    {ratio:"\\sin", degrees:15, value:"\\frac{\\sqrt{6}-\\sqrt{2}}{4}", plain:"(sqrt(6)-sqrt(2))/4"},
    {ratio:"\\cos", degrees:15, value:"\\frac{\\sqrt{6}+\\sqrt{2}}{4}", plain:"(sqrt(6)+sqrt(2))/4"},
    {ratio:"\\sin", degrees:75, value:"\\frac{\\sqrt{6}+\\sqrt{2}}{4}", plain:"(sqrt(6)+sqrt(2))/4"},
    {ratio:"\\cos", degrees:75, value:"\\frac{\\sqrt{6}-\\sqrt{2}}{4}", plain:"(sqrt(6)-sqrt(2))/4"},
    {ratio:"\\sin", degrees:105, value:"\\frac{\\sqrt{6}+\\sqrt{2}}{4}", plain:"(sqrt(6)+sqrt(2))/4"},
    {ratio:"\\cos", degrees:105, value:"\\frac{\\sqrt{2}-\\sqrt{6}}{4}", plain:"(sqrt(2)-sqrt(6))/4"},
    {ratio:"\\tan", degrees:75, value:"2+\\sqrt{3}", plain:"2+sqrt(3)"},
    {ratio:"\\tan", degrees:105, value:"-2-\\sqrt{3}", plain:"-2-sqrt(3)"}
];

/** The pool every exact-value branch draws its wrong options from. */
const POOL:string[]=[
    "\\frac{\\sqrt{2}}{2}",
    "\\frac{\\sqrt{3}}{2}",
    "\\frac{1}{2}",
    "\\frac{\\sqrt{6}+\\sqrt{2}}{4}",
    "\\frac{\\sqrt{6}-\\sqrt{2}}{4}",
    "-\\frac{\\sqrt{2}}{2}",
    "-\\frac{\\sqrt{3}}{2}",
    "-\\frac{1}{2}",
    "2-\\sqrt{3}",
    "2+\\sqrt{3}",
    "\\sqrt{3}",
    "\\sqrt{2}"
];

export function generateExactValues(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["the_45_degree_family","quadrant_signs","half_angles","building_from_familiar_angles"];
    let type=types[Math.floor(rng()*types.length)];
    let table=type==="the_45_degree_family"?QUARTER:type==="quadrant_signs"?QUADRANT:type==="half_angles"?HALF:BUILT;
    let share=difficulty==="easy"?0.4:difficulty==="hard"?1:0.7;
    let limit=Math.max(2, Math.round(table.length*share));
    let row=table[Math.floor(rng()*limit)];
    let key=row.value;
    let latex=`Find the exact value of \\( ${row.ratio}\\left(${row.degrees}^{\\circ}\\right) \\). Give the answer as an exact surd, not a decimal.`;
    let display=`${row.ratio}\\left(${row.degrees}^{\\circ}\\right) = ${row.value}`;
    let rungs:string[]=[];
    let steps:string[]=[];
    if (type==="the_45_degree_family"){
        rungs=[
            "Reduce the angle to its reference angle, read the exact value off the 45 degree row of the table, and then let the quadrant decide the sign.",
            "The reference angle of this angle is 45 degrees, and the exact eighth-of-a-turn values are what the table holds; only the sign still has to be decided."
        ];
        steps=[
            `Reduce $ ${row.degrees}^{\\circ} $ to its reference angle in the first quadrant, which is $ 45^{\\circ} $.`,
            `The exact value at a reference angle of $ 45^{\\circ} $ comes from the eighth-of-a-turn table, and $ ${row.degrees}^{\\circ} $ lies in the ${quadrantName(row.degrees)} quadrant, where ${row.ratio} is ${signWord(row.degrees, row.ratio)}.`,
            `So the exact value is ${row.value}, and that is the answer.`
        ];
    }
    else if (type==="quadrant_signs"){
        rungs=[
            "Reduce the angle to its reference angle, read the magnitude off the first-quadrant table, and then take the sign from the quadrant: sine and cosine follow the axis signs and tangent is their quotient.",
            "The reference angle gives the magnitude and the quadrant of the original angle gives the sign, so those are two separate steps."
        ];
        steps=[
            `The reference angle of $ ${row.degrees}^{\\circ} $ lies in the first quadrant, so it gives the magnitude of ${row.ratio}.`,
            quadrantSigns(row.degrees, row.ratio),
            `So the exact value is ${row.value}, and that is the answer.`
        ];
    }
    else if (type==="half_angles"){
        rungs=[
            "Use the half-angle identities rather than computing: cosine of half an angle is the square root of one plus cosine of the whole angle, and sine of half an angle is the square root of one minus it. Then take the sign from the quadrant.",
            `Halve the angle and apply \\( \\cos\\frac{\\theta}{2} = \\sqrt{\\frac{1 + \\cos\\theta}{2}} \\) or \\( \\sin\\frac{\\theta}{2} = \\sqrt{\\frac{1 - \\cos\\theta}{2}} \\), then simplify the surd.`
        ];
        steps=[
            `Half of ${row.degrees} degrees is ${row.degrees/2} degrees, and the whole angle ${row.degrees*2} degrees is one whose cosine is exact.`,
            "Apply the half-angle identity, take the sign from the quadrant, and simplify the resulting surd.",
            `So the exact value is ${row.value}, and that is the answer.`
        ];
    }
    else{
        rungs=[
            "Split the angle into two familiar angles and apply the sum or difference identity, then simplify the surd; the value of a composite angle is not something to memorise.",
            "Write the angle as a sum or a difference of two angles whose ratios are exact, expand with the identity, and collect the surds."
        ];
        steps=[
            `Write $ ${row.degrees}^{\\circ} $ as ${decomposition(row.degrees)}, and both angles in that pair are familiar.`,
            "Expand with the sum or difference identity and simplify the resulting surd.",
            `So the exact value is ${row.value}, and that is the answer.`
        ];
    }
    return {
        latex,
        correct: key,
        alternate: row.plain,
        display,
        choices: fourOptions(key, rankCandidates(key)),
        expectedFormat:"Enter the exact surd, for example -√3/2",
        subskill: type,
        hints: {rungs, concede: "The answer is "+key+"."},
        solution: steps
    };
}

/**
 * Ranks the pool of exact surds so that the options nearest the answer come first:
 * its negation is the sign slip, and after that the surds a learner actually
 * confuses with it. The list is a superset on purpose, because
 * `src/modules/shared/Options.ts` is what decides which candidates are real.
 *
 * @param value - The exact value, as LaTeX.
 * @returns Candidate wrong values.
 */
function rankCandidates(value: string): string[]{
    let negated=value.replace(/^-/, "");
    if (negated===value) negated="-"+value;
    let out:string[]=[negated];
    for(let candidate of POOL){
        if (out.length>=6) break;
        out.push(candidate);
    }
    return out;
}

/**
 * Names the quadrant an angle in degrees lies in.
 *
 * @param degrees - The angle in degrees.
 * @returns The quadrant's name.
 */
function quadrantName(degrees: number): string{
    let quadrant=Math.floor((((degrees%360)+360)%360)/90)+1;
    return ["first", "second", "third", "fourth"][quadrant-1];
}

/**
 * Reports whether a ratio is positive at an angle in degrees.
 *
 * @param degrees - The angle in degrees.
 * @param ratio - The ratio, as LaTeX.
 * @returns True when the ratio is positive there.
 */
function isPositive(degrees: number, ratio: string): boolean{
    let turns=((degrees%360)+360)%360;
    let quadrant=Math.floor(turns/90);
    if (ratio==="\\sin") return quadrant===0||quadrant===1;
    if (ratio==="\\cos") return quadrant===0||quadrant===3;
    if (ratio==="\\tan") return quadrant===0||quadrant===2;
    return quadrant===0||quadrant===1;
}

/**
 * States the sign a quadrant imposes on a ratio, in words.
 *
 * @param degrees - The angle in degrees.
 * @param ratio - The ratio, as LaTeX.
 * @returns The word positive or negative.
 */
function signWord(degrees: number, ratio: string): string{
    return isPositive(degrees, ratio)?"positive":"negative";
}

/**
 * States which signs a quadrant imposes on all three ratios.
 *
 * @param degrees - The angle in degrees.
 * @param ratio - The ratio being asked for.
 * @returns A sentence naming the sign.
 */
function quadrantSigns(degrees: number, ratio: string): string{
    let name=quadrantName(degrees);
    let positive=isPositive(degrees, ratio);
    return `The ${name} quadrant makes ${ratio} ${positive?"positive":"negative"}, which fixes the sign of the value.`;
}

/**
 * Splits a composite angle into two familiar angles whose ratios are exact.
 *
 * @param degrees - The angle in degrees.
 * @returns The pair, in the order they should be added.
 */
function decomposition(degrees: number): string{
    if (degrees===15) return "45 degrees minus 30 degrees";
    if (degrees===105) return "60 degrees plus 45 degrees";
    return "45 degrees plus 30 degrees";
}