/**
 * @file Absolute value inequalities: the interval a single inequality describes,
 * the whole numbers a stricter one allows, the bound that makes an inequality true
 * for every value, and the solution set in interval notation.
 * @description An inequality describes a set rather than a number, so the questions
 * here are the ones whose answer is a single value a learner can be graded on: the
 * largest whole number allowed, the sum of the whole numbers allowed, the largest
 * bound that makes the statement true for every x, or the interval written the way
 * the question asked for it. Every bound is a whole number and the slopes are drawn
 * so that both endpoints are whole numbers too, which keeps every answer exact.
 *
 * The universal branch is the one that separates an inequality from an equation: an
 * absolute value reaches zero and never goes below it, so exactly one bound is
 * satisfied by every real x and the others can be ruled out by reading the sign of
 * the bars rather than by testing values.
 */
import type{RngFn, QuestionDto}from"../../../types/global";
import{fourOptions, numberOptions}from"../../shared/Options.js";
import{randInt, shuffle}from"../../shared/Random";

/**
 * Renders the inside of the bars with its sign spelled out, so that a negative
 * centre never prints as a minus sign followed by a minus sign.
 *
 * @param slope - The coefficient of x.
 * @param constant - The constant term.
 * @returns The linear expression inside the bars.
 */
function inside(slope: number, constant: number): string{
    let head=Math.abs(slope)===1?"x":Math.abs(slope)+"x";
    if (constant===0) return head;
    if (constant>0) return head+" - "+constant;
    return head+" + "+Math.abs(constant);
}

export function generateAbsoluteValueInequality(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["single_inequality","compound_inequality","always_true","interval_answer"];
    let type=types[Math.floor(rng()*types.length)];
    let slopeMax=difficulty==="hard"?6:difficulty==="easy"?3:4;
    let key="";
    let alternate="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "single_inequality":{
            // A single inequality of this shape describes a closed interval, and the
            // largest whole number in it is one of its endpoints rather than the number
            // of whole numbers it contains.
            let centre=randInt(rng, -8, 8);
            let reach=difficulty==="hard"?14:difficulty==="easy"?5:9;
            let expression=inside(1, centre);
            key=String(centre+reach);
            latex=`Solve \\( | ${expression} | \\le ${reach} \\). What is the greatest whole number that satisfies it?`;
            choices=numberOptions(centre+reach, [centre-reach, centre, centre+reach+1, centre+reach-1], 0);
            rungs=[
                "The bars give a distance, so the inequality says the distance is at most that many, which describes an interval with one endpoint on each side of the centre.",
                `The interval runs from ${centre-reach} to ${centre+reach}, so read off the endpoint on the right.`
            ];
            steps=[
                `| ${expression} | <= ${reach} means ${centre-reach} <= x <= ${centre+reach}.`,
                `The interval is closed, so ${centre+reach} itself is allowed.`,
                `The greatest whole number that satisfies it is ${key}`
            ];
            break;
        }
        case "compound_inequality":{
            // The two endpoints are drawn on opposite sides of zero, so the whole
            // numbers inside the interval are 0 up to the upper endpoint and their
            // sum is a whole number the triangle formula gives exactly.
            let lower=-randInt(rng, 1, difficulty==="hard"?14:9);
            let upper=randInt(rng, 2, difficulty==="hard"?12:9);
            let slope=(lower+upper)%2===0?2:2*randInt(rng, 1, Math.floor(slopeMax/2));
            let constant=-slope*(upper+lower)/2;
            let reach=slope*(upper-lower)/2;
            let expression=inside(slope, constant);
            let top=upper-1;
            let sum=top*(top+1)/2;
            key=String(sum);
            latex=`Solve \\( | ${expression} | < ${reach} \\). What is the sum of all the whole-number values of \\( x \\) that satisfy it?`;
            choices=numberOptions(sum, [top+1, top, sum+1, sum-1, lower+upper], 0);
            rungs=[
                "A strict inequality gives an open interval, so the endpoints themselves are not allowed, and the whole numbers inside are the ones strictly between them.",
                `The interval runs from ${lower} to ${upper} without either end, so the whole numbers allowed are 0, 1, ... up to ${top}.`
            ];
            steps=[
                `| ${expression} | < ${reach} means ${lower} < x < ${upper}.`,
                `The whole numbers inside that interval are 0 to ${top}, which is ${top+1} numbers.`,
                `Their sum is ${top} x ${top+1} / 2 = ${key}`
            ];
            break;
        }
        case "always_true":{
            // An absolute value reaches zero and never goes below it, so exactly one
            // largest bound is satisfied by every real x and the others are ruled out
            // by reading the sign of the bars.
            let centre=randInt(rng, 2, 12);
            let expression=inside(1, centre);
            key="0";
            latex=`The inequality \\( | ${expression} | \\ge c \\) is satisfied by every real number \\( x \\). What is the largest whole number \\( c \\) for which that is true?`;
            choices=numberOptions(0, [1, -1, 2], 0);
            rungs=[
                "An absolute value measures a distance and is never negative, so it is at or above zero for every value of x, and it is exactly zero for one of them.",
                "Choose c as large as the inequality allows, which means looking for the smallest value the bars can take."
            ];
            steps=[
                `| ${expression} | is never negative, because it is a distance.`,
                `At x = ${centre} the bars are exactly 0, so any c above 0 fails there.`,
                `The largest whole number c that every real x satisfies is ${key}`
            ];
            break;
        }
        case "interval_answer":{
            // The answer is a set of numbers rather than one number, so the question
            // asks which of four printed intervals is the solution set. The other three
            // each change an endpoint or a bracket, so each is a different set and only
            // one of them is right.
            let centre=randInt(rng, -6, 8);
            let reach=randInt(rng, 2, difficulty==="hard"?12:8);
            let low=centre-reach;
            let high=centre+reach;
            let expression=inside(1, centre);
            key=`(${low}, ${high})`;
            alternate=`${low} < x < ${high}`;
            let others=[`[${low}, ${high})`, `(${low}, ${high}]`, `[${low-1}, ${high+1}]`];
            let printed=shuffle(rng, [key, ...others]);
            latex=`Solve \\( | ${expression} | < ${reach} \\). Which of these four intervals is the solution set? ${printed.map(interval=>`\\( ${interval} \\)`).join(", ")}.`;
            expectedFormat="Enter an interval in the form (0, 5), using a square bracket where the endpoint is included";
            choices=fourOptions(key, others);
            rungs=[
                "A strict inequality gives an open interval, so both endpoints are excluded and both brackets are round, while a non-strict inequality gives square brackets.",
                `The interval has ${centre} in the middle and reaches ${reach} either side of it, and the endpoints are not included.`
            ];
            steps=[
                `| ${expression} | < ${reach} means the distance from ${centre} is less than ${reach}, which is ${low} < x < ${high}.`,
                "The inequality is strict, so neither endpoint is reached and both brackets are round.",
                `The solution set is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:alternate===""?key:alternate, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
