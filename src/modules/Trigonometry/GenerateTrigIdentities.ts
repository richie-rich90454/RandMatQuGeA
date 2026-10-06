/**
 * @file The identities a trigonometric expression may be rewritten by: the
 * Pythagorean family, a proof that starts from one side, a simplification, and a
 * reciprocal rewritten in terms of the ratio it is built on.
 * @description Each branch asks which of four statements is the true one, or what
 * one specific expression simplifies to. Every table is checked by hand, and a
 * statement that is a re-spelling of the key is never offered beside it: two
 * options that are the same identity written in a different order would make the
 * question have two correct answers.
 *
 * The option sets are LaTeX because an identity is not a number and has no decimal
 * spelling. `latexToPlain` in `src/main/AnswerFormat.ts` is what turns them into
 * something a learner can read, and it handles exactly the constructs printed here.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";

/** A true identity and three statements that are not identities. */
interface IdentityGroup{
    /** The true statement, as LaTeX. */
    truth: string;
    /** Three false statements. None is a re-spelling of the truth. */
    false: string[];
    /** 1 is the easiest group, 3 the hardest. */
    tier: number;
}

const PYTHAGOREAN:IdentityGroup[]=[
    {
        truth:"\\sin^{2}\\theta + \\cos^{2}\\theta = 1",
        false:[
            "\\sin^{2}\\theta - \\cos^{2}\\theta = 1",
            "\\sin^{2}\\theta + \\cos^{2}\\theta = 2",
            "\\tan^{2}\\theta + \\cot^{2}\\theta = 1"
        ],
        tier:1
    },
    {
        truth:"1 - \\sin^{2}\\theta = \\cos^{2}\\theta",
        false:[
            "1 + \\sin^{2}\\theta = \\cos^{2}\\theta",
            "\\cos^{2}\\theta - 1 = \\sin^{2}\\theta",
            "1 + \\cos^{2}\\theta = \\sin^{2}\\theta"
        ],
        tier:1
    },
    {
        truth:"\\sec^{2}\\theta - \\tan^{2}\\theta = 1",
        false:[
            "\\sec^{2}\\theta + \\tan^{2}\\theta = 1",
            "\\sin^{2}\\theta - \\cos^{2}\\theta = 1",
            "\\tan^{2}\\theta - \\sec^{2}\\theta = 1"
        ],
        tier:2
    },
    {
        truth:"\\cot^{2}\\theta + 1 = \\csc^{2}\\theta",
        false:[
            "\\cot^{2}\\theta - 1 = \\csc^{2}\\theta",
            "\\tan^{2}\\theta + 1 = \\cot^{2}\\theta",
            "\\sin^{2}\\theta + \\cos^{2}\\theta = 0"
        ],
        tier:2
    },
    {
        truth:"\\csc^{2}\\theta - \\cot^{2}\\theta = 1",
        false:[
            "\\csc^{2}\\theta + \\cot^{2}\\theta = 1",
            "\\sec^{2}\\theta - \\cot^{2}\\theta = 1",
            "\\cos^{2}\\theta - \\sin^{2}\\theta = 1"
        ],
        tier:3
    }
];

/** One expression and what it simplifies to, plus three expressions it does not simplify to. */
interface Simplification{
    /** The expression to simplify, as LaTeX. */
    expression: string;
    /** What it simplifies to. */
    value: string;
    /** Three other values, none of which is a re-spelling of the answer. */
    wrong: string[];
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

const SIMPLIFICATIONS:Simplification[]=[
    {
        expression:"\\frac{1-\\cos^{2}\\theta}{\\sin\\theta}",
        value:"\\sin\\theta",
        wrong:["-\\sin\\theta", "\\cos\\theta", "\\sin^{2}\\theta", "\\cos^{2}\\theta"],
        tier:1
    },
    {
        expression:"\\sin\\theta \\cdot \\frac{1}{\\sin\\theta}",
        value:"1",
        wrong:["-1", "0", "\\sin^{2}\\theta", "\\cos^{2}\\theta"],
        tier:1
    },
    {
        expression:"\\sin^{2}\\theta + \\cos^{2}\\theta - 1",
        value:"0",
        wrong:["1", "-1", "2", "\\sin\\theta"],
        tier:1
    },
    {
        expression:"\\frac{\\cos^{2}\\theta}{\\sin^{2}\\theta}",
        value:"\\cot^{2}\\theta",
        wrong:["\\tan^{2}\\theta", "\\cot\\theta", "\\sec^{2}\\theta", "\\sin\\theta"],
        tier:2
    },
    {
        expression:"\\cos\\theta \\cdot \\frac{1}{\\sin\\theta}",
        value:"\\cot\\theta",
        wrong:["\\tan\\theta", "\\sin\\theta", "\\cos\\theta", "-\\cot\\theta"],
        tier:2
    },
    {
        expression:"\\frac{1-\\cos^{2}\\theta}{\\cos^{2}\\theta}",
        value:"\\tan^{2}\\theta",
        wrong:["\\cot^{2}\\theta", "\\sec^{2}\\theta", "\\tan\\theta", "\\sin^{2}\\theta"],
        tier:3
    }
];

/** One proof, the line that correctly continues it, and three lines that do not. */
interface Proof{
    /** The identity being proved. */
    goal: string;
    /** The line that correctly continues a proof started from the left side. */
    step: string;
    /** Three other lines, none of which reaches the goal. */
    wrong: string[];
    /** 1 is the easiest proof, 3 the hardest. */
    tier: number;
}

const PROOFS:Proof[]=[
    {
        goal:"\\tan\\theta + \\cot\\theta = \\frac{1}{\\sin\\theta \\cos\\theta}",
        step:"\\frac{\\sin^{2}\\theta + \\cos^{2}\\theta}{\\sin\\theta \\cos\\theta}",
        wrong:[
            "\\frac{\\sin^{2}\\theta - \\cos^{2}\\theta}{\\sin\\theta \\cos\\theta}",
            "\\frac{1}{\\sin\\theta} - \\frac{1}{\\cos\\theta}",
            "\\frac{\\sin\\theta + \\cos\\theta}{\\sin\\theta \\cos\\theta}"
        ],
        tier:1
    },
    {
        goal:"\\cos^{2}\\theta - \\sin^{2}\\theta = 1 - 2\\sin^{2}\\theta",
        step:"(1-\\sin^{2}\\theta) - \\sin^{2}\\theta",
        wrong:[
            "(1+\\sin^{2}\\theta) - \\sin^{2}\\theta",
            "1 - \\sin^{2}\\theta",
            "(1-\\cos^{2}\\theta) - \\cos^{2}\\theta"
        ],
        tier:1
    },
    {
        goal:"\\frac{\\cos\\theta}{1-\\sin\\theta} = \\frac{1+\\sin\\theta}{\\cos\\theta}",
        step:"\\frac{\\cos\\theta\\left(1+\\sin\\theta\\right)}{1-\\sin^{2}\\theta}",
        wrong:[
            "\\frac{(1+\\sin\\theta)^{2}}{\\cos^{2}\\theta}",
            "\\frac{1+\\sin\\theta}{\\cos^{2}\\theta}",
            "\\frac{\\cos^{2}\\theta}{(1+\\sin\\theta)^{2}}"
        ],
        tier:3
    },
    {
        goal:"\\frac{1}{1-\\cos\\theta} - \\frac{1}{1+\\cos\\theta} = \\frac{2\\cos\\theta}{\\sin^{2}\\theta}",
        step:"\\frac{(1+\\cos\\theta)-(1-\\cos\\theta)}{1-\\cos^{2}\\theta}",
        wrong:[
            "\\frac{(1+\\cos\\theta)+(1-\\cos\\theta)}{1-\\cos^{2}\\theta}",
            "\\frac{\\cos\\theta}{(1-\\cos\\theta)(1+\\cos\\theta)}",
            "\\frac{(1+\\cos\\theta)-(1-\\cos\\theta)}{\\sin^{2}\\theta}"
        ],
        tier:3
    }
];

/** One ratio to rewrite and the ratio it is to be expressed in terms of. */
interface Reciprocal{
    /** The ratio being rewritten, as LaTeX. */
    ratio: string;
    /** The ratio it is expressed in terms of. */
    base: string;
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

const RECIPROCALS:Reciprocal[]=[
    {ratio:"\\sec\\theta", base:"\\cos\\theta", tier:1},
    {ratio:"\\csc\\theta", base:"\\sin\\theta", tier:1},
    {ratio:"\\cot\\theta", base:"\\tan\\theta", tier:2},
    {ratio:"\\tan\\theta", base:"\\cot\\theta", tier:2},
    {ratio:"\\sec\\theta", base:"\\tan\\theta", tier:3},
    {ratio:"\\csc\\theta", base:"\\cot\\theta", tier:3}
];

export function generateTrigIdentities(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["recognize_the_pythagorean_family","prove_a_basic_one","simplify_an_expression","reciprocal_conversion"];
    let type=types[Math.floor(rng()*types.length)];
    let tier=difficulty==="easy"?1:difficulty==="hard"?3:2;
    let key="";
    let latex="";
    let wrong:string[]=[];
    let expectedFormat="";
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    if (type==="recognize_the_pythagorean_family"){
        let group=pickTiered(PYTHAGOREAN, tier, rng);
        key=group.truth;
        wrong=group.false;
        latex="Which of these four is an identity, that is, a statement true for every angle \\( \\theta \\)?";
        display=key;
        rungs=[
            "Test each statement at one angle whose ratios are not special, and discard every statement that fails there; the one that survives is the identity.",
            "An identity holds for every value of the variable, so a single counterexample is enough to rule a statement out."
        ];
        steps=[
            `Try each statement at an angle whose ratios are not special, such as \\( \\theta = 30^{\\circ} \\); three of them fail and one survives.`,
            `The statement that survives is $ ${key} $.`,
            `It is the only one of the four that holds for every angle, so the answer is ${readable(key)}.`
        ];
        expectedFormat="Choose the identity that holds for every angle";
    }
    else if (type==="simplify_an_expression"){
        let row=pickTiered(SIMPLIFICATIONS, tier, rng);
        key=row.value;
        wrong=row.wrong;
        latex=`Simplify \\( ${row.expression} \\).`;
        display=`${row.expression} = ${key}`;
        rungs=[
            "Look for the Pythagorean identity first: a difference or a sum of a squared sine and a squared cosine is what collapses, and what is left is then a single ratio.",
            "Rewrite the squared term with \\( 1 - \\cos^{2}\\theta = \\sin^{2}\\theta \\), or the denominator with \\( 1 - \\sin^{2}\\theta = \\cos^{2}\\theta \\), and the expression collapses."
        ];
        steps=[
            `Rewrite the squared ratio in the expression using the Pythagorean identity.`,
            "What survives is a single ratio, and any remaining factor that appears in the numerator and the denominator cancels.",
            `The simplified expression is ${readable(key)}, so the answer is ${readable(key)}.`
        ];
        expectedFormat="Enter the simplified expression";
    }
    else if (type==="reciprocal_conversion"){
        let row=pickTiered(RECIPROCALS, tier, rng);
        let others=["\\cos\\theta", "\\sin\\theta", "\\tan\\theta", "\\cot\\theta", "\\sec\\theta", "\\csc\\theta"].filter(base => base!==row.base);
        key=`\\frac{1}{${row.base}}`;
        wrong=[row.base, `\\frac{1}{${others[0]}}`, `\\frac{1}{${others[1]}}`, `\\frac{${row.base}}{1}`];
        latex=`Express \\( ${row.ratio} \\) in terms of \\( ${row.base} \\) only.`;
        display=`${row.ratio} = ${key}`;
        rungs=[
            "Each reciprocal ratio is one over the ratio it inverts, so invert the ratio named in the question rather than multiplying by it.",
            `The definitions are \\( \\sec\\theta = 1/\\cos\\theta \\), \\( \\csc\\theta = 1/\\sin\\theta \\) and \\( \\cot\\theta = 1/\\tan\\theta \\), so the answer is one over the ratio the question names.`
        ];
        steps=[
            "The reciprocal ratios are defined as one over the ratio they invert.",
            `In terms of \\( ${row.base} \\) alone, that is $ ${key} $.`,
            `The expression is ${readable(key)}, so the answer is ${readable(key)}.`
        ];
        expectedFormat="Enter the expression in terms of the ratio named in the question";
    }
    else{
        let row=pickTiered(PROOFS, tier, rng);
        key=row.step;
        wrong=row.wrong;
        latex=`Prove the identity \\( ${row.goal} \\) by starting from the left side. Which line correctly continues the proof?`;
        display=`\\text{LHS} = ${key}`;
        rungs=[
            "A proof started from the left side rewrites the left side and never the right, so the next line is the left side after one legitimate substitution.",
            "Start from the left, replace one squared ratio with the Pythagorean identity or combine over a common denominator, and stop before the simplifying step."
        ];
        steps=[
            "Take the left side and apply one rewriting step to it, leaving the right side untouched.",
            `The line that does that is $ ${key} $.`,
            `Simplifying it with \\( \\sin^{2}\\theta + \\cos^{2}\\theta = 1 \\) reaches the right side, so the answer is ${readable(key)}.`
        ];
        expectedFormat="Choose the line that correctly continues the proof";
    }
    return {
        latex,
        correct: key,
        alternate: readable(key),
        display,
        choices: fourOptions(key, wrong),
        expectedFormat,
        subskill: type,
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

/**
 * A readable spelling of a short LaTeX fragment, used for the concession and the
 * last worked step where the raw markup would be noise.
 *
 * @param latex - The LaTeX fragment.
 * @returns The fragment with its superscripts flattened.
 */
function readable(latex: string): string{
    return latex.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/\\/g, "");
}