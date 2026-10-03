/**
 * @file Solving trigonometric equations: a single linear angle, the double-angle
 * identities, a quadratic that factors in a ratio, and the solutions a careless
 * step throws away.
 * @description Every equation here is built from the exact angles of the first
 * quadrant, so every key is a whole number of degrees and nothing is rounded. A
 * table of equations that admit exactly one solution on the stated interval is the
 * whole mechanism: a draw that landed on an equation with two solutions in range
 * would have no single answer, and the table is how that is prevented rather than
 * detected after the fact.
 *
 * The rows carry a tier, and a difficulty keeps only the rows up to its own tier.
 * That is what makes the three levels genuinely different questions rather than the
 * same question with different numbers in it.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{fmtTrim}from"../shared/Numeric.js";

/** One equation, the angle it solves to, the angles it must not solve to, and how hard it is. */
interface Row{
    /** The equation, already typeset. */
    eq: string;
    /** The interval the solutions are counted on. */
    span: string;
    /** The one solution on that interval. */
    answer: number;
    /** Angles that are not solutions. */
    wrong: number[];
    /** 1 is the easiest row, 3 the hardest. */
    tier: number;
}

/** The intervals the tables use, so the prompt and the hint name the same one. */
const FIRST_QUADRANT="[0^{\\circ}, 90^{\\circ})";
const CLOSED_QUADRANT="[0^{\\circ}, 90^{\\circ}]";
const HALF_TURN="[0^{\\circ}, 180^{\\circ}]";
const FIRST_HALF="[0^{\\circ}, 45^{\\circ}]";

const LINEAR:Row[]=[
    {eq:"2\\sin(x) = 1", span:FIRST_QUADRANT, answer:30, wrong:[60, 45, 15, 90], tier:1},
    {eq:"2\\cos(x) = 1", span:FIRST_QUADRANT, answer:60, wrong:[30, 45, 15, 90], tier:1},
    {eq:"\\sin(x) = \\frac{\\sqrt{3}}{2}", span:FIRST_QUADRANT, answer:60, wrong:[30, 45, 15, 90], tier:2},
    {eq:"\\cos(x) = \\frac{\\sqrt{3}}{2}", span:FIRST_QUADRANT, answer:60, wrong:[30, 45, 15, 90], tier:2},
    {eq:"\\cos(x) = \\frac{\\sqrt{2}}{2}", span:FIRST_QUADRANT, answer:45, wrong:[30, 60, 15, 90], tier:2},
    {eq:"\\tan(x) = 1", span:FIRST_QUADRANT, answer:45, wrong:[30, 60, 15, 90], tier:2},
    {eq:"\\cot(x) = 1", span:FIRST_QUADRANT, answer:45, wrong:[30, 60, 15, 90], tier:3},
    {eq:"\\tan(x) = \\sqrt{3}", span:FIRST_QUADRANT, answer:60, wrong:[45, 30, 15, 90], tier:3},
    {eq:"\\csc(x) = 2", span:FIRST_QUADRANT, answer:30, wrong:[60, 45, 15, 90], tier:3},
    {eq:"\\sec(x) = 2", span:FIRST_QUADRANT, answer:60, wrong:[30, 45, 15, 90], tier:3},
    {eq:"\\sin(x) = 0", span:FIRST_QUADRANT, answer:0, wrong:[30, 45, 60, 90], tier:1}
];

const DOUBLE:Row[]=[
    {eq:"2\\sin^{2}(x) - 1 = 0", span:CLOSED_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:1},
    {eq:"1 - 2\\sin^{2}(x) = 0", span:CLOSED_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:1},
    {eq:"\\sin(2x) = 1", span:CLOSED_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:1},
    {eq:"\\cos(2x) = 0", span:CLOSED_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:2},
    {eq:"1 - 2\\cos^{2}(x) = 0", span:CLOSED_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:2},
    {eq:"2\\sin(x)\\cos(x) = 1", span:CLOSED_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:2},
    {eq:"\\cos(2x) = -\\frac{1}{2}", span:CLOSED_QUADRANT, answer:60, wrong:[30, 45, 90, 15], tier:2},
    {eq:"\\sin(2x) = \\frac{1}{2}", span:FIRST_HALF, answer:15, wrong:[30, 45, 60, 90], tier:3},
    {eq:"\\sin(2x) = \\frac{\\sqrt{3}}{2}", span:FIRST_HALF, answer:30, wrong:[45, 60, 15, 90], tier:3},
    {eq:"2\\sin(x)\\cos(x) = \\frac{\\sqrt{3}}{2}", span:FIRST_HALF, answer:30, wrong:[45, 60, 15, 90], tier:3}
];

const FACTORED:Row[]=[
    {eq:"2\\sin^{2}(x) + \\sin(x) - 1 = 0", span:CLOSED_QUADRANT, answer:30, wrong:[60, 45, 90, 15], tier:1},
    {eq:"4\\sin^{2}(x) - 1 = 0", span:CLOSED_QUADRANT, answer:30, wrong:[60, 45, 90, 15], tier:1},
    {eq:"2\\cos^{2}(x) + \\cos(x) - 1 = 0", span:CLOSED_QUADRANT, answer:60, wrong:[30, 45, 90, 15], tier:1},
    {eq:"4\\cos^{2}(x) - 1 = 0", span:CLOSED_QUADRANT, answer:60, wrong:[30, 45, 90, 15], tier:2},
    {eq:"2\\sin^{2}(x) - \\sin(x) - 1 = 0", span:CLOSED_QUADRANT, answer:90, wrong:[30, 60, 45, 0], tier:2},
    {eq:"2\\cos^{2}(x) - \\cos(x) - 1 = 0", span:CLOSED_QUADRANT, answer:0, wrong:[60, 45, 90, 30], tier:2},
    {eq:"\\tan^{2}(x) - 1 = 0", span:FIRST_QUADRANT, answer:45, wrong:[30, 60, 90, 15], tier:2},
    {eq:"3\\sin^{2}(x) - \\sin(x) - 2 = 0", span:CLOSED_QUADRANT, answer:90, wrong:[30, 60, 45, 0], tier:3},
    {eq:"3\\cos^{2}(x) - \\cos(x) - 2 = 0", span:CLOSED_QUADRANT, answer:0, wrong:[60, 45, 90, 30], tier:3}
];

/** The reciprocal-ratio rows, which are about inverting the ratio rather than inverting the value. */
const RATIO:Row[]=[
    {eq:"\\frac{\\cos(x)}{\\sin(x)} = 1", span:FIRST_QUADRANT, answer:45, wrong:[30, 60, 15, 90], tier:1},
    {eq:"\\frac{\\sin(x)}{\\cos(x)} = 1", span:FIRST_QUADRANT, answer:45, wrong:[60, 30, 15, 90], tier:1},
    {eq:"\\frac{\\cos(x)}{\\sin(x)} = \\sqrt{3}", span:FIRST_QUADRANT, answer:30, wrong:[60, 45, 15, 90], tier:2},
    {eq:"\\frac{\\sin(x)}{\\cos(x)} = \\frac{\\sqrt{3}}{3}", span:FIRST_QUADRANT, answer:30, wrong:[60, 45, 15, 90], tier:2},
    {eq:"\\frac{\\cos(x)}{\\sin(x)} = \\frac{\\sqrt{3}}{3}", span:FIRST_QUADRANT, answer:60, wrong:[30, 45, 15, 90], tier:3},
    {eq:"\\frac{\\sin(x)}{\\cos(x)} = \\sqrt{3}", span:FIRST_QUADRANT, answer:60, wrong:[30, 45, 15, 90], tier:3}
];

/** The rows that ask how many solutions an equation has, which is the count a division destroys. */
const COUNTED:Row[]=[
    {eq:"\\sin(x)\\cos(x) = 0", span:CLOSED_QUADRANT, answer:2, wrong:[1, 0, 3, 4], tier:1},
    {eq:"\\cos^{2}(x) = \\cos(x)", span:CLOSED_QUADRANT, answer:2, wrong:[1, 0, 3, 4], tier:1},
    {eq:"\\sin^{2}(x) = \\sin(x)", span:CLOSED_QUADRANT, answer:2, wrong:[1, 0, 3, 4], tier:1},
    {eq:"\\sin(x)\\cos(x) = 0", span:HALF_TURN, answer:3, wrong:[1, 2, 4, 0], tier:2},
    {eq:"\\cos^{2}(x) = \\cos(x)", span:HALF_TURN, answer:3, wrong:[1, 2, 4, 0], tier:2},
    {eq:"\\sin^{2}(x) = \\sin(x)", span:HALF_TURN, answer:3, wrong:[1, 2, 4, 0], tier:3}
];

export function generateSolvingTrigEquations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["linear_in_the_angle","double_angle","factored_form","check_for_extraneous"];
    let type=types[Math.floor(rng()*types.length)];
    let tier=difficulty==="easy"?1:difficulty==="hard"?3:2;
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    let display="";
    if (type==="check_for_extraneous"){
        // Two shapes for the same lesson. The first inverts a ratio and the mistake
        // is inverting it twice; the second counts solutions, where a single division
        // loses exactly the root that made the divisor zero.
        let counting=false;
        if (rng()<0.5){
            let row=drawRow(RATIO, tier, rng);
            key=row.answer;
            latex=`Solve \\( ${row.eq} \\) for \\( x \\) on \\( ${row.span} \\), giving the angle in degrees.`;
            wrong=row.wrong;
            display=`x = ${row.answer}^{\\circ}`;
            rungs=[
                "Recognize the ratio before solving: a quotient of sine and cosine is a named tangent or cotangent, and the value on the right then identifies the exact angle.",
                `The left-hand side is a named ratio whose value in the first quadrant is \\( ${row.answer} \\), and that is the one angle on \\( ${row.span} \\).`
            ];
            steps=[
                `Write the left-hand side as one of the named ratios, so the equation becomes a single ratio equal to the value on the right.`,
                `That ratio takes the value \\( ${row.answer} \\) at exactly one angle on \\( ${row.span} \\).`,
                `So $ x = ${row.answer}^{\\circ} $, and the answer is ${key}.`
            ];
        }
        else{
            counting=true;
            let row=drawRow(COUNTED, tier, rng);
            key=row.answer;
            latex=`How many solutions does \\( ${row.eq} \\) have on \\( ${row.span} \\)?`;
            wrong=row.wrong;
            display=`${row.answer} solutions`;
            rungs=[
                "Divide by nothing and count the zeros: a quotient written by dividing out one factor loses whatever made that factor zero, so solve the equation as a product or as a difference of squares.",
                `Solve each factor on its own over the whole interval \\( ${row.span} \\), not only where the divided-out factor is non-zero.`
            ];
            steps=[
                `Rewrite the equation so that every factor that can vanish is visible, rather than dividing one of them away.`,
                `The distinct solutions on \\( ${row.span} \\) number ${row.answer}; dividing by a factor would have removed one of them.`,
                `So the equation has ${key} solution${key===1?"":"s"} on that interval, and the answer is ${key}.`
            ];
        }
        let countText=fmtTrim(key, 2);
        return {
            latex,
            correct: countText,
            alternate: countText,
            display,
            choices: numberOptions(key, wrong, 0),
            expectedFormat: counting?"Enter a whole number":"Enter the angle in degrees",
            subskill: type,
            hints: {rungs, concede: "The answer is "+countText+"."},
            solution: steps
        };
    }
    let table=type==="linear_in_the_angle"?LINEAR:type==="double_angle"?DOUBLE:FACTORED;
    let row=drawRow(table, tier, rng);
    key=row.answer;
    wrong=row.wrong;
    latex=`Solve \\( ${row.eq} \\) for \\( x \\) on \\( ${row.span} \\), giving the angle in degrees.`;
    display=`x = ${row.answer}^{\\circ}`;
    if (type==="linear_in_the_angle"){
        rungs=[
            "Isolate the single ratio in the equation, identify which ratio it is, and then read the exact angle off the special-angle table for that ratio.",
            `The interval \\( ${row.span} \\) leaves a single candidate, so it is enough to name the ratio and its value in the first quadrant.`
        ];
        steps=[
            `Isolate the ratio in \\( ${row.eq} \\).`,
            `On \\( ${row.span} \\) that ratio takes the stated value at exactly one angle, and the special-angle table names it as \\( ${row.answer}^{\\circ} \\).`,
            `So $ x = ${row.answer}^{\\circ} $, and the answer is ${key}.`
        ];
    }
    else if (type==="double_angle"){
        rungs=[
            "Rewrite the equation so that it reads as a single ratio at twice the angle, then solve that and halve the answer.",
            `The interval \\( ${row.span} \\) tells you how much of the double angle you are allowed, so halve the angle you find and check it lands in range.`
        ];
        steps=[
            `Bring the equation to the form \\( \\sin(2x) = k \\) or \\( \\cos(2x) = k \\), using the double-angle identities for the squared terms.`,
            `On \\( ${row.span} \\) the double angle \\( 2x \\) has exactly one candidate, and halving it gives \\( x = ${row.answer}^{\\circ} \\).`,
            `So the answer is ${key}.`
        ];
    }
    else{
        rungs=[
            "Treat the ratio as the unknown, factor the quadratic it satisfies, and then keep only the roots that the interval allows.",
            `The interval \\( ${row.span} \\) decides which of the roots of the quadratic survives, and the other one is not a solution of the original equation.`
        ];
        steps=[
            `Rearrange the equation into a quadratic in the ratio it is written in, then factor that quadratic; each root is a candidate value of the ratio.`,
            `On \\( ${row.span} \\) the ratio takes the value \\( ${row.answer}^{\\circ} \\), and the other root of the quadratic is a value the ratio never takes on that interval.`,
            `So $ x = ${row.answer}^{\\circ} $, and the answer is ${key}.`
        ];
    }
    let text=fmtTrim(key, 2);
    return {
        latex,
        correct: text,
        alternate: text+" degrees",
        display,
        choices: numberOptions(key, wrong, 0),
        expectedFormat:"Enter the angle in degrees",
        subskill: type,
        hints: {rungs, concede: "The answer is "+text+" degrees."},
        solution: steps
    };
}

/**
 * Picks one row a difficulty is allowed to ask, falling back to the easiest row
 * when the tier filter would leave nothing.
 *
 * @param table - The rows to draw from.
 * @param tier - The highest tier the difficulty allows.
 * @param rng - The injected random source.
 * @returns One row.
 */
function drawRow(table: Row[], tier: number, rng: () => number): Row{
    let allowed=table.filter(row => row.tier<=tier);
    if (allowed.length===0) allowed=[table[0]];
    return allowed[Math.floor(rng()*allowed.length)];
}