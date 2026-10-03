/**
 * @file The law of cosines: finding a side, finding an angle, an applied problem,
 * and the angle at which the rule collapses into the Pythagorean theorem.
 * @description The cosine rule produces an irrational side for almost every choice
 * of data, so the side and angle branches do not hope for a whole number: they
 * search a bounded range for a triple whose square is a perfect one, and the search
 * falls back to a triple checked by hand. That is why every key in this file is
 * exact.
 *
 * The `compare_with_pythagoras` branch holds the other half of the same fact: the
 * rule reduces to the Pythagorean theorem in one particular case, and asking which
 * case that is has four honest candidate angles.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmtTrim}from"../shared/Numeric.js";

/** The angles whose cosine is a whole number, so that `arccos` of it is exact. */
const EXACT_ANGLES:{degrees: number, cosine: number}[]=[
    {degrees:60, cosine:0.5},
    {degrees:90, cosine:0},
    {degrees:120, cosine:-0.5}
];

/** One triangle whose cosine rule produces a whole number on every entry. */
interface Triple{
    /** First side. */
    a: number;
    /** Second side. */
    b: number;
    /** The angle between them, in degrees. */
    included: number;
    /** The third side. */
    c: number;
}

/**
 * Finds a pair of sides and an included angle whose cosine rule gives a whole
 * number. The search is bounded and falls back to the 5-8-7 triangle, which has
 * `c^2 = 25 + 64 - 40 = 49`.
 *
 * @param wide - Whether the difficulty is hard.
 * @param rng - The injected random source.
 * @returns A triangle with a whole-number third side.
 */
function exactTriple(wide: boolean, rng: () => number): Triple{
    let angles=wide?[60, 90, 120]:[90, 120];
    for(let attempt=0; attempt<64; attempt++){
        let a=randInt(rng, 3, wide?16:10);
        let b=randInt(rng, 3, wide?16:10);
        let included=angles[Math.floor(rng()*angles.length)];
        let cosine=included===60?0.5:included===90?0:-0.5;
        let squared=a*a+b*b-2*a*b*cosine;
        let c=Math.round(Math.sqrt(squared));
        if (c*c!==squared||c<=0) continue;
        if (a+b<=c) continue;
        if (a+c<=b||b+c<=a) continue;
        return {a, b, included, c};
    }
    return {a:5, b:8, included:60, c:7};
}

export function generateLawOfCosines(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["find_the_side","find_the_angle","an_application","compare_with_pythagoras"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    if (type==="compare_with_pythagoras") return pythagorasQuestion(rng);
    if (type==="find_the_side") return sideQuestion(rng, wide);
    if (type==="find_the_angle") return angleQuestion(rng, wide);
    return applicationQuestion(rng, wide);
}

/**
 * The side branch: the cosine rule, with the third side already known to be a whole
 * number.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function sideQuestion(rng: () => number, wide: boolean): QuestionDto{
    let triangle=exactTriple(wide, rng);
    let key=triangle.c;
    let cosine=triangle.included===60?"\\frac{1}{2}":triangle.included===90?"0":"-\\frac{1}{2}";
    let rungs=[
        "Square the unknown side out of the rule: the third side is the root of the sum of the two known squares less twice their product times the cosine of the angle between them.",
        `The rule is \\( c^{2} = a^{2} + b^{2} - 2ab\\cos C \\), so the numbers to substitute are \\( ${triangle.a} \\), \\( ${triangle.b} \\) and the cosine of \\( ${triangle.included} \\).`
    ];
    let steps=[
        `$ c^{2} = ${triangle.a}^{2} + ${triangle.b}^{2} - 2 \\times ${triangle.a} \\times ${triangle.b} \\cos(${triangle.included}^{\\circ}) = ${triangle.a*triangle.a} + ${triangle.b*triangle.b} - 2 \\times ${triangle.a} \\times ${triangle.b} \\times ${cosine} = ${triangle.c*triangle.c} $.`,
        `$ c = \\sqrt{${triangle.c*triangle.c}} = ${triangle.c} $.`,
        `So $ c = ${key} $, and the answer is ${key}.`
    ];
    return {
        latex:`In triangle \\( ABC \\), \\( a = ${triangle.a} \\) and \\( b = ${triangle.b} \\), and the angle between them is \\( C = ${triangle.included}^{\\circ} \\). Find \\( c \\).`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2),
        display:`\\sqrt{${triangle.c*triangle.c}} = ${key}`,
        choices: numberOptions(key, [triangle.a+triangle.b, Math.abs(triangle.a-triangle.b), triangle.a*triangle.b, triangle.a*triangle.a, key+1], 0),
        expectedFormat:"Enter a whole number",
        subskill:"find_the_side",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+"."},
        solution: steps
    };
}

/**
 * The angle branch. The cosine is a whole number, so the angle is exact, and the
 * three wrong options are the operations a learner performs on it instead of
 * taking the inverse cosine.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function angleQuestion(rng: () => number, wide: boolean): QuestionDto{
    let triangle=exactTriple(wide, rng);
    let entry=EXACT_ANGLES.filter(candidate => candidate.degrees===triangle.included)[0];
    let key=entry.degrees;
    let cosine=entry.cosine;
    let printed=cosine===0?"0":cosine>0?"\\frac{1}{2}":"-\\frac{1}{2}";
    let rungs=[
        "Rearrange the cosine rule into `cos C = (a^2 + b^2 - c^2) / 2ab`, evaluate that fraction, and only then take the inverse cosine.",
        `The rule inverts to \\( \\cos C = \\dfrac{a^{2} + b^{2} - c^{2}}{2ab} \\), and the value of that fraction at the printed sides is what identifies the angle.`
    ];
    let steps=[
        `$ \\cos C = \\dfrac{${triangle.a}^{2} + ${triangle.b}^{2} - ${triangle.c}^{2}}{2 \\times ${triangle.a} \\times ${triangle.b}} = \\dfrac{${triangle.a*triangle.a} + ${triangle.b*triangle.b} - ${triangle.c*triangle.c}}{${2*triangle.a*triangle.b}} = ${cosine} $.`,
        `The angle between 0 and 180 degrees whose cosine is ${printed} is $ ${key}^{\\circ} $.`,
        `So $ C = ${key}^{\\circ} $, and the answer is ${key}.`
    ];
    return {
        latex:`In triangle \\( ABC \\), \\( a = ${triangle.a} \\), \\( b = ${triangle.b} \\) and \\( c = ${triangle.c} \\). Find the angle \\( C \\) between the sides \\( a \\) and \\( b \\), in degrees.`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" degrees",
        display:`\\cos C = ${printed} = \\cos(${key}^{\\circ})`,
        choices: numberOptions(key, [180-key, 90-key, key+30, 360-key], 0),
        expectedFormat:"Enter the angle in degrees",
        subskill:"find_the_angle",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+" degrees."},
        solution: steps
    };
}

/**
 * The applied branch: the cosine rule on a triangle a builder would recognize.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function applicationQuestion(rng: () => number, wide: boolean): QuestionDto{
    let triangle=exactTriple(wide, rng);
    let key=triangle.c;
    let cross=triangle.included===60?`-${triangle.a*triangle.b}`:triangle.included===90?`- 0`:`+ ${triangle.a*triangle.b}`;
    let rungs=[
        "Two sides and the angle between them is exactly the data the cosine rule is built for, so substitute them directly and take the square root of the result.",
        `The rule is \\( c^{2} = a^{2} + b^{2} - 2ab\\cos C \\), and a triangle with sides \\( ${triangle.a} \\) and \\( ${triangle.b} \\) meeting at \\( ${triangle.included} \\) degrees needs no other measurement.`
    ];
    let steps=[
        `$ c^{2} = ${triangle.a}^{2} + ${triangle.b}^{2} - 2 \\times ${triangle.a} \\times ${triangle.b} \\cos(${triangle.included}^{\\circ}) = ${triangle.a*triangle.a} + ${triangle.b*triangle.b} ${cross} = ${triangle.c*triangle.c} $.`,
        `$ c = \\sqrt{${triangle.c*triangle.c}} = ${triangle.c} $ meters.`,
        `So the third side measures ${key} meters, and the answer is ${key}.`
    ];
    return {
        latex:`Two straight fence panels of ${triangle.a} m and ${triangle.b} m are hinged together at one end. The far ends are held ${triangle.included} degrees apart by a rope. How long is the rope, in meters?`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" meters",
        display:`\\sqrt{${triangle.c*triangle.c}} = ${key}`,
        choices: numberOptions(key, [triangle.a+triangle.b, Math.abs(triangle.a-triangle.b), triangle.a*triangle.b, triangle.a*triangle.a, triangle.b*triangle.b], 0),
        expectedFormat:"Enter a whole number of meters",
        subskill:"an_application",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+" meters."},
        solution: steps
    };
}

/**
 * The branch that compares the rule with the Pythagorean theorem, in both
 * directions: the angle at which the two agree, and a right triangle computed
 * through the rule instead of the theorem.
 *
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function pythagorasQuestion(rng: () => number): QuestionDto{
    let asksForAngle=rng()<0.5;
    if (asksForAngle){
        let rungs=[
            "Compare the two rules term by term: the cosine rule only turns into the Pythagorean theorem when the term subtracted from the sum of squares vanishes.",
            "That happens exactly when the cosine of the included angle is zero, and the only angle between 0 and 180 degrees with a zero cosine is the right angle."
        ];
        let steps=[
            "The Pythagorean theorem says $ c^{2} = a^{2} + b^{2} $, and the cosine rule says $ c^{2} = a^{2} + b^{2} - 2ab\\cos C $.",
            "The two agree exactly when $ 2ab\\cos C = 0 $, and since $ a $ and $ b $ are sides of a triangle that means $ \\cos C = 0 $.",
            "That is a right angle, so $ C = 90 $ degrees, and the answer is 90."
        ];
        return {
            latex:"The law of cosines reduces to the Pythagorean theorem for one particular value of the included angle. How many degrees is that angle?",
            correct: fmtTrim(90, 2),
            alternate: "90 degrees",
            display:"\\cos C = 0 = \\cos(90^{\\circ})",
            choices: numberOptions(90, [60, 120, 45, 30], 0),
            expectedFormat:"Enter the angle in degrees",
            subskill:"compare_with_pythagoras",
            hints: {rungs, concede: "The answer is 90 degrees."},
            solution: steps
        };
    }
    let legs=[[3, 4], [6, 8], [5, 12], [8, 15], [9, 12]];
    let pair=legs[Math.floor(rng()*legs.length)];
    let key=pair[2];
    let rungs=[
        "Apply the cosine rule with the included angle set to 90 degrees; its cosine is zero, so the cross term disappears and what remains is the Pythagorean theorem written as a formula.",
        `With a right angle between them, $ \\cos 90^{\\circ} = 0 $, so the rule reduces to $ c^{2} = ${pair[0]}^{2} + ${pair[1]}^{2} $.`
    ];
    let steps=[
        `$ c^{2} = ${pair[0]}^{2} + ${pair[1]}^{2} - 2 \\times ${pair[0]} \\times ${pair[1]} \\cos(90^{\\circ}) = ${pair[0]*pair[0]} + ${pair[1]*pair[1]} - 0 = ${key*key} $.`,
        `$ c = \\sqrt{${key*key}} = ${key} $.`,
        `So the hypotenuse is ${key} units long, and the answer is ${key}.`
    ];
    return {
        latex:`A right triangle has two perpendicular sides of ${pair[0]} units and ${pair[1]} units. Use the law of cosines with the right angle as the included angle to find the third side, in units.`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" units",
        display:`\\sqrt{${key*key}} = ${key}`,
        choices: numberOptions(key, [pair[0]+pair[1], Math.abs(pair[0]-pair[1]), pair[0]*pair[1], pair[0]*2, pair[1]*2], 0),
        expectedFormat:"Enter a whole number of units",
        subskill:"compare_with_pythagoras",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+"."},
        solution: steps
    };
}