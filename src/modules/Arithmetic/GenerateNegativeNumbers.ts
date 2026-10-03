/**
 * @file Negative numbers: positions on a number line, additive inverses, and the
 * four operations on signed values.
 * @description Every answer here is a whole number reached by integer arithmetic,
 * so nothing is rounded and no prompt value and graded value can drift apart. The
 * divisions are drawn so that the quotient is exact, because a remainder in an
 * answer the question never mentions would be a question the learner cannot
 * answer from what is printed.
 *
 * A negative number is a position, not a smaller amount of something, so the
 * distractors are the two failures that follow from treating it as one: reversing
 * only the sign of the result, and reversing the sign of the subtrahend.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

export function generateNegativeNumbers(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["number_line","opposite_values","add_signed","subtract_signed","multiply_signed","divide_signed"];
    let type=types[Math.floor(rng()*types.length)];
    let bound=difficulty==="hard"?30:difficulty==="easy"?10:18;
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "number_line":{
            // Moving to the left of a marked point is what a negative number is, so
            // the question is asked as a movement and the four options are four
            // positions rather than two. Asking "is it to the left or the right"
            // would be a yes/no question with no honest third answer.
            let start=randInt(rng, -bound, bound);
            let moves=randInt(rng, 3, bound);
            key=start-moves;
            latex=`A number line has \\( ${start} \\) marked on it. Which number is \\( ${moves} \\) units to the left of \\( ${start} \\)?`;
            wrong=[start+moves, start, start-moves-2, start-moves+2];
            rungs=[
                "On a number line, moving left decreases the value and moving right increases it, whatever the signs of the numbers involved.",
                `Start at ${start} and count ${moves} units to the left.`
            ];
            steps=[
                `${start} is the marked point.`,
                `Counting ${moves} units to the left subtracts ${moves} from it.`,
                `${start} - ${moves} = ${key}, so the number is ${key}`
            ];
            break;
        }
        case "opposite_values":{
            let value=randInt(rng, 2, bound);
            let signed=randInt(rng, 0, 1)===0?-value:value;
            key=-signed;
            latex=`What is the opposite of \\( ${signed} \\)?`;
            wrong=[signed, signed*2, key+1, key-1];
            rungs=[
                "The opposite of a number is its additive inverse: the number the same distance from zero on the other side, which is found by changing the sign and nothing else.",
                `The opposite of ${signed} is the same distance from zero but on the other side of it.`
            ];
            steps=[
                `${signed} is ${Math.abs(signed)} units from zero, on the ${signed<0?"negative":"positive"} side.`,
                "The opposite is the same distance on the other side.",
                `The opposite of ${signed} is ${key}`
            ];
            break;
        }
        case "add_signed":{
            let first=randInt(rng, 1, bound);
            // Equal magnitudes would cancel to zero and leave the sign rule with
            // nothing to decide, so the second magnitude is redrawn until it differs.
            // The loop is bounded and the last draw is used anyway.
            let second=first;
            for(let attempt=0; attempt<32&&second===first; attempt++) second=randInt(rng, 1, bound);
            let negativeFirst=randInt(rng, 0, 1)===0;
            let a=negativeFirst?-first:first;
            let b=negativeFirst?second:-second;
            key=a+b;
            latex=`What is \\( ${a} + ${b} \\)?`;
            wrong=[a-b, b-a, -key, Math.abs(a)+Math.abs(b)];
            rungs=[
                "Two numbers with unlike signs are added by subtracting their magnitudes from each other and keeping the sign of the one with the larger magnitude.",
                `${Math.abs(a)} and ${Math.abs(b)} are the two magnitudes, so subtract the smaller from the larger and keep the sign of ${Math.abs(a)>Math.abs(b)?a:b}.`
            ];
            steps=[
                `${a} and ${b} have unlike signs.`,
                `The magnitudes are ${Math.abs(a)} and ${Math.abs(b)}, and the difference is ${Math.abs(key)}.`,
                `The larger magnitude is ${Math.abs(a)>Math.abs(b)?Math.abs(a):Math.abs(b)}, so the result keeps that sign: ${a} + ${b} = ${key}`
            ];
            break;
        }
        case "subtract_signed":{
            let first=randInt(rng, 2, bound);
            // As in the addition branch, equal magnitudes would give a zero answer
            // and leave the sign rule with nothing to decide.
            let second=first;
            for(let attempt=0; attempt<32&&second===first; attempt++) second=randInt(rng, 2, bound);
            let negativeFirst=randInt(rng, 0, 1)===0;
            let a=negativeFirst?-first:first;
            let b=negativeFirst?second:-second;
            key=a-b;
            latex=`What is \\( ${a} - ${b} \\)?`;
            wrong=[a+b, b-a, -key, Math.abs(a)-Math.abs(b)];
            rungs=[
                "Subtracting a negative number is adding its opposite, so a minus a negative b is a plus b.",
                `${b} is ${Math.abs(b)} below zero, so subtracting it means moving up by ${Math.abs(b)}.`
            ];
            steps=[
                `The sign inside the second bracket is ${b<0?"negative":"positive"}.`,
                b<0?
                    `Subtracting a negative means adding the positive, so ${a} - ( ${b} ) = ${a} + ${Math.abs(b)}.`:
                    `Subtracting a positive means moving down by it, so ${a} - ${b} = ${key}.`,
                `${a} - ${b} = ${key}`
            ];
            break;
        }
        case "multiply_signed":{
            let first=randInt(rng, 2, bound);
            let second=randInt(rng, 2, bound);
            let negativeFirst=randInt(rng, 0, 1)===0;
            let a=negativeFirst?-first:first;
            let b=negativeFirst?second:-second;
            key=a*b;
            latex=`What is \\( ${a} \\times ${b} \\)?`;
            wrong=[-key, a*(b+1), a+b, a*(b-1)];
            rungs=[
                "The sign of a product is positive when the two signs match and negative when they differ, and the size is the product of the two magnitudes either way.",
                `${Math.abs(a)} x ${Math.abs(b)} = ${Math.abs(key)}, and the signs ${(a<0)===(b<0)?"match":"differ"}.`
            ];
            steps=[
                `The magnitudes multiply: ${Math.abs(a)} x ${Math.abs(b)} = ${Math.abs(key)}.`,
                (a<0)===(b<0)?
                    `Both factors have the same sign, so the product is positive.`:
                    `The signs differ, so the product is negative.`,
                `${a} x ${b} = ${key}`
            ];
            break;
        }
        case "divide_signed":{
            // The divisor is drawn to divide the dividend exactly, so the answer the
            // question asks for is the one that is printed and no remainder has to
            // be invented. A negative divisor is drawn half the time, because
            // dividing by a negative is the one that changes sign.
            let quotient=randInt(rng, 2, bound);
            let divisorMagnitude=randInt(rng, 2, Math.min(9, bound));
            let negativeDivisor=randInt(rng, 0, 1)===0;
            let divisor=negativeDivisor?-divisorMagnitude:divisorMagnitude;
            let dividend=key=divisor*quotient;
            latex=`What is \\( ${dividend} \\div ${divisor} \\)?`;
            wrong=[-key, divisor*Math.abs(key), key+1, key-1];
            rungs=[
                "The sign of a quotient follows the same rule as a product: it is negative exactly when the dividend and the divisor have different signs.",
                `${dividend} divided by ${Math.abs(divisor)} gives ${Math.abs(key)}, and the signs ${(dividend<0)===(divisor<0)?"match":"differ"}.`
            ];
            steps=[
                `${dividend} divided by the magnitude ${Math.abs(divisor)} gives ${Math.abs(key)}.`,
                (dividend<0)===(divisor<0)?
                    `The two signs match, so the quotient is positive.`:
                    `The two signs differ, so the quotient is negative.`,
                `${dividend} divided by ${divisor} = ${key}`
            ];
            break;
        }
    }
    let keyText=String(key);
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:numberOptions(key, wrong, 0), expectedFormat:"Enter a whole number, negative answers written with a minus sign", subskill:type, hints:{rungs, concede:"The answer is "+keyText+"."}, solution: steps};
}
