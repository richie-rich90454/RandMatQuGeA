/**
 * @file Inverse trigonometric functions: the principal value, an exact value, a
 * composition that has collapsed back into the principal range, and a domain or a
 * range.
 * @description The principal branch is the whole content of three of the four
 * branches. `arcsin` and `arccos` are defined on `[-90, 90]` and `[0, 180]`
 * respectively and `arctan` on the open interval, so an equation whose solutions
 * lie outside that interval is not an inverse-trigonometry question and the
 * branches below never ask for it. A composition such as `arcsin(sin(5pi/6))` is
 * the cleanest demonstration: the inner function returns `1/2`, and the outer one
 * can only return `30` degrees.
 *
 * Degrees and radians are never mixed inside a question: an angle branch states
 * which it is using, and the key follows.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{fmtTrim}from"../shared/Numeric.js";

/** One principal-value row: an equation, its principal value in degrees, and three angles that are not. */
interface Principal{
    /** The expression, already typeset. */
    expression: string;
    /** The principal value, in degrees. */
    answer: number;
    /** Angles that are solutions but are outside the principal range, and one that is not a solution at all. */
    wrong: number[];
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

const PRINCIPALS:Principal[]=[
    {expression:"\\arcsin\\left(\\frac{\\sqrt{3}}{2}\\right)", answer:60, wrong:[30, 120, -60], tier:1},
    {expression:"\\arcsin\\left(\\frac{1}{2}\\right)", answer:30, wrong:[150, -30, 60], tier:1},
    {expression:"\\arccos\\left(\\frac{1}{2}\\right)", answer:60, wrong:[120, -60, 30], tier:1},
    {expression:"\\arccos\\left(-\\frac{\\sqrt{3}}{2}\\right)", answer:150, wrong:[30, -150, 60], tier:2},
    {expression:"\\arctan(1)", answer:45, wrong:[135, -45, 60], tier:1},
    {expression:"\\arctan(\\sqrt{3})", answer:60, wrong:[120, -60, 45], tier:2},
    {expression:"\\arctan(-1)", answer:-45, wrong:[135, 45, -135], tier:2},
    {expression:"\\arcsin\\left(-\\frac{1}{2}\\right)", answer:-30, wrong:[150, 30, -150], tier:3}
];

/** One composition row: an inverse function wrapped round a ratio. */
interface Composition{
    /** The composition, already typeset. */
    expression: string;
    /** The exact value. */
    answer: string;
    /** A plain spelling of the value. */
    plain: string;
    /** Three other values. */
    wrong: string[];
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

const COMPOSITIONS:Composition[]=[
    {
        expression:"\\sin\\left(\\arcsin\\left(\\frac{1}{2}\\right)\\right)",
        answer:"\\frac{1}{2}",
        plain:"1/2",
        wrong:["\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{4}"],
        tier:1
    },
    {
        expression:"\\cos\\left(\\arccos\\left(\\frac{\\sqrt{3}}{2}\\right)\\right)",
        answer:"\\frac{\\sqrt{3}}{2}",
        plain:"sqrt(3)/2",
        wrong:["\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{4}"],
        tier:1
    },
    {
        expression:"\\cos\\left(\\arcsin\\left(\\frac{1}{2}\\right)\\right)",
        answer:"\\frac{\\sqrt{3}}{2}",
        plain:"sqrt(3)/2",
        wrong:["\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}", "-\\frac{\\sqrt{3}}{2}"],
        tier:2
    },
    {
        expression:"\\tan\\left(\\arccos\\left(\\frac{\\sqrt{3}}{2}\\right)\\right)",
        answer:"1",
        plain:"1",
        wrong:["\\sqrt{3}", "\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}"],
        tier:2
    },
    {
        expression:"\\sin\\left(\\arctan(1)\\right)",
        answer:"\\frac{\\sqrt{2}}{2}",
        plain:"sqrt(2)/2",
        wrong:["\\frac{\\sqrt{3}}{2}", "\\frac{1}{2}", "\\frac{\\sqrt{2}}{4}"],
        tier:3
    },
    {
        expression:"\\cos\\left(\\arctan(\\sqrt{3})\\right)",
        answer:"\\frac{1}{2}",
        plain:"1/2",
        wrong:["\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{1}{4}"],
        tier:3
    }
];

/** One row asking for a domain or a range of an inverse function. */
interface Extent{
    /** Which quantity is wanted. */
    quantity: string;
    /** The function it is about. */
    fn: string;
    /** The correct answer. */
    answer: string;
    /** Three other intervals or sets, none of which is the right one. */
    wrong: string[];
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

const EXTENTS:Extent[]=[
    {
        quantity:"domain",
        fn:"\\arcsin",
        answer:"[-1, 1]",
        wrong:["[0, 1]", "[1, \\infty)", "all real numbers"],
        tier:1
    },
    {
        quantity:"domain",
        fn:"\\arccos",
        answer:"[-1, 1]",
        wrong:["[0, 1]", "(-\\infty, \\infty)", "[-2, 2]"],
        tier:1
    },
    {
        quantity:"range",
        fn:"\\arcsin",
        answer:"[-90^{\\circ}, 90^{\\circ}]",
        wrong:["[0^{\\circ}, 180^{\\circ}]", "[0^{\\circ}, 90^{\\circ}]", "all real numbers"],
        tier:2
    },
    {
        quantity:"range",
        fn:"\\arccos",
        answer:"[0^{\\circ}, 180^{\\circ}]",
        wrong:["[-90^{\\circ}, 90^{\\circ}]", "[0^{\\circ}, 90^{\\circ}]", "all real numbers"],
        tier:2
    },
    {
        quantity:"domain",
        fn:"\\arctan",
        answer:"all real numbers",
        wrong:["[-1, 1]", "[0, 1]", "(-1, 1)"],
        tier:3
    },
    {
        quantity:"range",
        fn:"\\arctan",
        answer:"(-90^{\\circ}, 90^{\\circ})",
        wrong:["[-90^{\\circ}, 90^{\\circ}]", "[0^{\\circ}, 90^{\\circ}]", "all real numbers"],
        tier:3
    }
];

export function generateInverseTrigonometry(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["the_principal_value","evaluate_exactly","a_composition","domain_and_range"];
    let type=types[Math.floor(rng()*types.length)];
    let tier=difficulty==="easy"?1:difficulty==="hard"?3:2;
    if (type==="the_principal_value") return principalQuestion(tier, rng);
    if (type==="evaluate_exactly") return exactQuestion(tier, rng);
    if (type==="a_composition") return compositionQuestion(tier, rng);
    return extentQuestion(tier, rng);
}

/**
 * The principal-value branch. Three of the four options are angles that either
 * violate the principal range or violate the equation, which is exactly the
 * confusion the branch is about.
 *
 * @param tier - The highest tier the difficulty allows.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function principalQuestion(tier: number, rng: () => number): QuestionDto{
    let row=pickTiered(PRINCIPALS, tier, rng);
    let key=row.answer;
    let rungs=[
        "Find the angle whose ratio is the given value, and then take the only one of them that lies in the principal range of the inverse function named.",
        `The ratio named in the expression takes that value at more than one angle, and the inverse function returns only the one inside its principal range.`
    ];
    let steps=[
        `The ratio in \\( ${row.expression} \\) takes that value at several angles spread around the unit circle.`,
        `The principal range is the only one the inverse function is defined on, and it picks a single angle from among them.`,
        `The principal value is ${key} degrees, so the answer is ${key}.`
    ];
    return {
        latex:`Find the principal value of \\( ${row.expression} \\), giving the answer in degrees.`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" degrees",
        display:`${row.expression} = ${key}^{\\circ}`,
        choices: numberOptions(key, row.wrong.concat([key+180]), 0),
        expectedFormat:"Enter the angle in degrees",
        subskill:"the_principal_value",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+" degrees."},
        solution: steps
    };
}

/**
 * The exact-value branch: an inverse function wrapped round a ratio, whose value
 * the square root of the remaining part of the unit circle gives exactly.
 *
 * @param tier - The highest tier the difficulty allows.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function exactQuestion(tier: number, rng: () => number): QuestionDto{
    let row=pickTiered(COMPOSITIONS, tier, rng);
    let rungs=[
        "Read the inverse function as naming an angle, then use the unit circle: the square root of what is left after the square of the known leg is the other leg.",
        "An inverse function inside a ratio says which angle is meant, so find that angle in the first quadrant and read the requested ratio straight off the special-angle table."
    ];
    let steps=[
        `The inner inverse function names an acute angle whose ratio is the value in the brackets.`,
        `Reading the requested ratio at that angle from the exact-value table gives $ ${row.answer} $.`,
        `The value is ${row.plain}, so the answer is ${row.plain}.`
    ];
    return {
        latex:`Evaluate \\( ${row.expression} \\). Give the answer as an exact surd or a whole number, not a decimal.`,
        correct: row.answer,
        alternate: row.plain,
        display:`${row.expression} = ${row.answer}`,
        choices: fourOptions(row.answer, row.wrong),
        expectedFormat:"Enter the exact value, for example sqrt(3)/2",
        subskill:"evaluate_exactly",
        hints: {rungs, concede: "The answer is "+row.answer+"."},
        solution: steps
    };
}

/**
 * The composition branch: an inverse function wrapped round itself and the same
 * ratio, which collapses to the principal value of the ratio's angle.
 *
 * @param tier - The highest tier the difficulty allows.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function compositionQuestion(tier: number, rng: () => number): QuestionDto{
    let rows=[
        {expression:"\\arcsin\\left(\\sin\\left(\\frac{5\\pi}{6}\\right)\\right)", answer:30, wrong:[150, -30, 210], tier:1},
        {expression:"\\arccos\\left(\\cos\\left(\\frac{5\\pi}{3}\\right)\\right)", answer:60, wrong:[300, -60, 120], tier:1},
        {expression:"\\arctan\\left(\\tan\\left(\\frac{3\\pi}{4}\\right)\\right)", answer:-45, wrong:[135, 45, -135], tier:2},
        {expression:"\\arcsin\\left(\\sin\\left(\\frac{7\\pi}{6}\\right)\\right)", answer:-30, wrong:[210, 30, -150], tier:2},
        {expression:"\\arccos\\left(\\cos\\left(\\frac{4\\pi}{3}\\right)\\right)", answer:120, wrong:[240, -120, 60], tier:3},
        {expression:"\\arctan\\left(\\tan\\left(-\\frac{3\\pi}{4}\\right)\\right)", answer:-45, wrong:[-135, 45, 135], tier:3}
    ];
    let row=pickTiered(rows, tier, rng);
    let key=row.answer;
    let rungs=[
        "Evaluate the inner ratio first: it returns a single number between minus one and one, and then the outer inverse function can only return the angle in its principal range.",
        "The inner ratio loses all information about which turn the angle was in, so the composition is forced to the principal value of the ratio."
    ];
    let steps=[
        `The inner ratio is computed exactly and returns a number in \\([-1, 1]\\).`,
        `The outer inverse function then returns the unique angle in its principal range with that value.`,
        `That angle is ${key} degrees, so the answer is ${key}.`
    ];
    return {
        latex:`Evaluate \\( ${row.expression} \\). If the result is an angle, give it in degrees.`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" degrees",
        display:`${row.expression} = ${key}^{\\circ}`,
        choices: numberOptions(key, row.wrong.concat([key+180]), 0),
        expectedFormat:"Enter the angle in degrees",
        subskill:"a_composition",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+" degrees."},
        solution: steps
    };
}

/**
 * The domain-and-range branch. Its four options are four intervals or sets, and
 * exactly one of them is the right one; the open and closed endpoints are what
 * distinguishes two of them.
 *
 * @param tier - The highest tier the difficulty allows.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function extentQuestion(tier: number, rng: () => number): QuestionDto{
    let row=pickTiered(EXTENTS, tier, rng);
    let key=row.answer;
    let rungs=[
        "The domain is the set of inputs the ratio can take, and the range is the set of angles the inverse function can return; decide which of the two the question names and then write that set down.",
        "A sine or a cosine never leaves the unit interval, which fixes the domain of its inverse, and the principal range fixes what the inverse can return."
    ];
    let steps=[
        `The question asks for the ${row.quantity} of \\( ${row.fn} \\).`,
        `The ratio behind it can only take values in the unit interval, and the principal range is the set of angles the inverse returns.`,
        `The ${row.quantity} is ${key}, so the answer is ${key}.`
    ];
    return {
        latex:`State the ${row.quantity} of the inverse function \\( ${row.fn} \\).`,
        correct: key,
        alternate: key.replace(/\\circ/g, " degrees"),
        display:key,
        choices: fourOptions(key, row.wrong),
        expectedFormat:"Enter the set in the form shown in the options",
        subskill:"domain_and_range",
        hints: {rungs, concede: "The answer is "+key+"."},
        solution: steps
    };
}

/**
 * Picks one row from a tiered table, falling back to the easiest row when the tier
 * filter would leave nothing.
 *
 * @param table - The rows to draw from.
 * @param tier - The highest tier the difficulty allows.
 * @param rng - The injected random source.
 * @returns One row.
 */
function pickTiered<T extends {tier: number}>(table: T[], tier: number, rng: () => number): T{
    let allowed=table.filter(row => row.tier<=tier);
    if (allowed.length===0) allowed=[table[0]];
    return allowed[Math.floor(rng()*allowed.length)];
}