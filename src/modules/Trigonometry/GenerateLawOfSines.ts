/**
 * @file The law of sines: finding a side, finding an angle, an applied problem,
 * and recognising which theorem a question calls for.
 * @description The side branch is exact by construction. Among the special angles
 * the only ratios of two sines that terminate are the ones pairing a third of a
 * turn with a right angle, so those are the angle pairs drawn and the key is a
 * whole number; a draw that produced an angle pair whose sine ratio is irrational
 * would have no exact answer and the table is how that is prevented. The angle
 * branch cannot be exact for general data, so its prompt states the rounding and
 * the key is that rounded value.
 *
 * The theorem-choosing branch answers with a sentence rather than a number. Its
 * four options are the four theorems the curriculum offers, so there is no filler
 * and no second reading of the question under which two of them would be right.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmt, fmtTrim}from"../shared/Numeric.js";

/** How many decimal places an angle answered by a non-exact computation is graded at. */
const ANGLE_PLACES=1;

/**
 * The angle pairs whose sine ratio is a whole number and whose angles still sum
 * below a straight angle. Nothing else is drawn, because any other pair makes the
 * answer irrational and an irrational key is not a key this file is allowed to have.
 */
const SIDES:{known: string, knownAngle: string, knownDegrees: number, unknown: string, unknownAngle: string, unknownDegrees: number, factor: number}[]=[
    {known:"b", knownAngle:"B", knownDegrees:90, unknown:"a", unknownAngle:"A", unknownDegrees:30, factor:0.5},
    {known:"a", knownAngle:"A", knownDegrees:30, unknown:"c", unknownAngle:"C", unknownDegrees:90, factor:2},
    {known:"a", knownAngle:"A", knownDegrees:90, unknown:"c", unknownAngle:"C", unknownDegrees:30, factor:0.5},
    {known:"b", knownAngle:"B", knownDegrees:30, unknown:"a", unknownAngle:"A", unknownDegrees:90, factor:2}
];

export function generateLawOfSines(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["find_a_side","find_an_angle","an_application","choose_the_theorem"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    if (type==="choose_the_theorem") return theoremQuestion(rng, wide);
    if (type==="find_a_side") return sideQuestion(rng, wide);
    if (type==="find_an_angle") return angleQuestion(rng, wide);
    return applicationQuestion(rng, wide);
}

/**
 * The side branch: the ratio of two sines that terminates is chosen by
 * construction rather than discovered after the fact.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function sideQuestion(rng: () => number, wide: boolean): QuestionDto{
    let shape=SIDES[Math.floor(rng()*(wide?SIDES.length:2))];
    let known=randInt(rng, 4, wide?16:9)*2;
    let key=known*shape.factor;
    let rungs=[
        "Write the two side-and-opposite-angle pairs the rule relates, solve for the side you want, and keep the pairing straight: each sine belongs to the side opposite its own angle.",
        `The rule gives the missing side as the known side times the ratio of the sines of the two angles, and the sines of ${shape.knownDegrees} and ${shape.unknownDegrees} degrees are whole numbers.`
    ];
    let knownSine=shape.knownDegrees===90?1:0.5;
    let steps=[
        `$ \\dfrac{${shape.unknown}}{\\sin(${shape.unknownDegrees}°)} = \\dfrac{${shape.known}}{\\sin(${shape.knownDegrees}°)} = \\dfrac{${known}}{${knownSine}} $, pairing each side with the angle opposite it.`,
        `So $ ${shape.unknown} = ${known} \\times \\frac{\\sin(${shape.unknownDegrees}°)}{\\sin(${shape.knownDegrees}°)} = ${known} \\times ${shape.factor} $.`,
        `So $ ${shape.unknown} = ${key} $, and the answer is ${key}.`
    ];
    return {
        latex:`In triangle \\( ABC \\), side \\( ${shape.known} = ${known} \\), angle \\( ${shape.knownAngle} = ${shape.knownDegrees}^{\\circ} \\) and angle \\( ${shape.unknownAngle} = ${shape.unknownDegrees}^{\\circ} \\). Find side \\( ${shape.unknown} \\).`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2),
        display:`${shape.unknown} = ${known} \\times \\sin(${shape.unknownDegrees}°) / \\sin(${shape.knownDegrees}°)`,
        choices: numberOptions(key, [known, key/2, key*2, known*3, key+2], 0),
        expectedFormat:"Enter a whole number",
        subskill:"find_a_side",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+"."},
        solution: steps
    };
}

/**
 * The angle branch. The sine rule inverts to `sin B = b sin A / a`, which is not
 * one of the exact values for general data, so the prompt states the rounding and
 * the key is that rounded value. The supplementary candidate is offered as a
 * distractor because failing the angle sum is exactly how it is caught.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function angleQuestion(rng: () => number, wide: boolean): QuestionDto{
    let a=randInt(rng, 4, wide?14:9);
    let b=randInt(rng, 1, a-1);
    let A=randInt(rng, 20, 70);
    let sine=b*Math.sin(A*Math.PI/180)/a;
    let acute=Math.asin(sine)*180/Math.PI;
    let obtuse=180-acute;
    let third=180-A-acute;
    let key=fmt(acute, ANGLE_PLACES);
    let rungs=[
        "Invert the law of sines to get the sine of the angle you want, take the inverse sine, and then check the angle sum: a supplementary candidate has to leave a positive third angle to be acceptable.",
        `The rule gives \\( \\sin B = b \\sin A / a \\), and because $ b < a $ the resulting acute angle is smaller than $ A $, which is what rules out the supplementary one.`
    ];
    let steps=[
        `$ \\sin B = \\dfrac{b \\sin A}{a} = \\dfrac{${b} \\sin(${A}°)}{${a}} = ${fmt(sine, 4)} $, and $ A = ${A}° $ with $ b = ${b} < a = ${a} $, so only the acute candidate can leave a positive third angle.`,
        `$ B = \\arcsin(${fmt(sine, 4)}) \\approx ${fmt(acute, 4)}° $, and the supplementary candidate ${fmt(obtuse, 1)}° would already exceed 180° together with $ A = ${A}° $.`,
        `Rounded to one decimal place, $ B = ${key} $ degrees, so the answer is ${key}.`
    ];
    return {
        latex:`In triangle \\( ABC \\), \\( a = ${a} \\), \\( b = ${b} \\) and \\( A = ${A}^{\\circ} \\). Find the acute value of angle \\( B \\), rounded to the nearest tenth of a degree.`,
        correct: key,
        alternate: key+" degrees",
        display:`B = \\arcsin\\left(\\frac{${b} \\sin(${A}°)}{${a}}\\right)`,
        choices: numberOptions(acute, [obtuse, third, A, acute+30], ANGLE_PLACES),
        expectedFormat:"Round your answer to one decimal place",
        subskill:"find_an_angle",
        hints: {rungs, concede: "The answer is "+key+" degrees."},
        solution: steps
    };
}

/**
 * The applied branch: the same exact arithmetic in a triangle a surveyor or a
 * builder would recognize.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function applicationQuestion(rng: () => number, wide: boolean): QuestionDto{
    let hyp=randInt(rng, 4, wide?12:8)*6;
    let key=hyp/2;
    let rungs=[
        "Recognize the right triangle first: a right angle makes the side the prompt names the hypotenuse, and the law of sines then relates it to the short leg through the sines of 30 and 90 degrees.",
        "The triangle has angles 30, 60 and 90 degrees, and the side of the stated length is opposite the right angle, so it is the hypotenuse."
    ];
    let steps=[
        `The triangle has angles $ 30^{\\circ} $, $ 60^{\\circ} $ and $ 90^{\\circ} $, and the side of length $ ${hyp} $ is opposite the right angle, so it is the hypotenuse.`,
        `$ \\dfrac{a}{\\sin 30^{\\circ}} = \\dfrac{c}{\\sin 90^{\\circ}} = \\dfrac{${hyp}}{1} = ${hyp} $, so $ a = ${hyp} \\times \\frac{1}{2} $.`,
        `So $ a = ${key} $, and the answer is ${key}.`
    ];
    return {
        latex:`A surveyor measures a triangular plot with a right angle at \\( C \\), an angle of \\( 30^{\\circ} \\) at \\( A \\), and the side \\( c = AB = ${hyp} \\) meters. Find the length of side \\( a = BC \\) in meters.`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" meters",
        display:`a = ${hyp} \\times \\sin(30^{\\circ})`,
        choices: numberOptions(key, [hyp*3/2, hyp/3, hyp*2, hyp/4, hyp/6], 0),
        expectedFormat:"Enter a whole number of meters",
        subskill:"an_application",
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+" meters."},
        solution: steps
    };
}

/**
 * The theorem-choosing branch. Its four options are the four theorems the
 * curriculum offers, so there is no filler option and no second reading of the
 * question under which two of them would be right.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function theoremQuestion(rng: () => number, wide: boolean): QuestionDto{
    let variants=[
        {
            given:"two sides and the angle between them",
            key:"the law of cosines",
            wrong:["the law of sines", "the law of tangents", "the Pythagorean theorem"],
            why:"The cosine rule is the only one of the four that takes two sides together with the angle between them."
        },
        {
            given:"all three sides",
            key:"the law of cosines",
            wrong:["the law of sines", "the law of tangents", "the Pythagorean theorem"],
            why:"Three sides leave no angle given, and the cosine rule is the one that inverts to an angle from the two sides adjacent to it."
        },
        {
            given:"one side, the angle opposite that side, and one other side",
            key:"the law of sines",
            wrong:["the law of cosines", "the law of tangents", "the Pythagorean theorem"],
            why:"A side paired with the angle opposite it is exactly the pair the sine rule is built on."
        },
        {
            given:"one side and two angles",
            key:"the law of sines",
            wrong:["the law of cosines", "the law of tangents", "the Pythagorean theorem"],
            why:"Two angles give the third by the angle sum, and with a side and its opposite angle the sine rule supplies the rest."
        }
    ];
    let entry=variants[Math.floor(rng()*(wide?variants.length:2))];
    let key=entry.key;
    let rungs=[
        "Match the data you are given to the theorem that takes exactly those quantities: the sine rule always pairs a side with the angle opposite it, and the cosine rule always needs two sides with the angle between them.",
        `The sine rule needs a side paired with its opposite angle, while the cosine rule needs two sides and the angle between them. The question gives ${entry.given}.`
    ];
    let steps=[
        `The question gives ${entry.given}.`,
        entry.why,
        `So the theorem to use is ${key}, and that is the answer.`
    ];
    return {
        latex:`You are given ${entry.given} of a triangle. Which theorem should you use to find the missing quantity?`,
        correct: key,
        alternate: key,
        display: key,
        choices: fourOptions(key, entry.wrong),
        expectedFormat:"Choose the theorem to use",
        subskill:"choose_the_theorem",
        hints: {rungs, concede: "The answer is "+key+"."},
        solution: steps
    };
}