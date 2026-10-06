/**
 * @file Long division: quotients and remainders, and the two things done with
 * them, which are estimating before dividing and checking the answer afterwards.
 * @description Every answer here is a whole number reached by integer arithmetic.
 * Divisors are never zero, dividends are never negative, and the exact-division
 * branch draws its dividend as a multiple of its divisor, so there is never a
 * remainder the question did not mention.
 *
 * The estimating branch is the one that has to be stated carefully: the prompt
 * names the rounding to apply to each number and to nothing else, and the key is
 * computed from exactly those rounded values. An estimate computed from the
 * unrounded dividend is an answer the learner cannot reproduce from the numbers
 * printed on screen.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/**
 * Inserts a thousands separator into a whole number, so that the grouping does not
 * depend on the host's locale data.
 *
 * @param value - The whole number.
 * @returns The number with commas every three digits from the right.
 */
function grouped(value: number): string{
    let digits=String(value);
    let out="";
    for(let i=0; i<digits.length; i++){
        if (i>0&&(digits.length-i)%3===0) out+=",";
        out+=digits[i];
    }
    return out;
}

export function generateLongDivision(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["with_remainder","exact_division","estimate_first","check_by_multiplying"];
    let type=types[Math.floor(rng()*types.length)];
    let divisorMax=difficulty==="hard"?89:difficulty==="easy"?9:23;
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "with_remainder":{
            // A remainder is always smaller than the divisor, so a question that
            // offers the divisor itself, or the quotient, as a distractor is asking
            // about the division rather than about the remainder.
            let divisor=randInt(rng, 4, divisorMax);
            let quotient=randInt(rng, 12, difficulty==="hard"?260:90);
            let remainder=randInt(rng, 1, divisor-1);
            let dividend=quotient*divisor+remainder;
            key=remainder;
            latex=`What is the remainder when \\( ${grouped(dividend)} \\) is divided by \\( ${divisor} \\)?`;
            wrong=[divisor-remainder, quotient, quotient+1, remainder+1];
            rungs=[
                "The remainder is what is left after the largest whole number of divisor-sized groups has been taken, so it is always smaller than the divisor.",
                `Divide ${grouped(dividend)} by ${divisor}: ${grouped(dividend)} = ${quotient} groups of ${divisor}, and the rest is the remainder.`
            ];
            steps=[
                `${quotient} x ${divisor} = ${quotient*divisor}, and ${quotient*divisor} + ${remainder} = ${grouped(dividend)}.`,
                `The remainder ${remainder} is less than the divisor ${divisor}, so the division stops there.`,
                `The remainder is ${key}`
            ];
            break;
        }
        case "exact_division":{
            let divisor=randInt(rng, 3, divisorMax);
            let quotient=randInt(rng, 8, difficulty==="hard"?400:120);
            let dividend=divisor*quotient;
            key=quotient;
            latex=`What is the quotient when \\( ${grouped(dividend)} \\) is divided by \\( ${divisor} \\)?`;
            wrong=[divisor*quotient+1, divisor, quotient+divisor, quotient+1];
            rungs=[
                "The quotient is how many whole groups of the divisor fit into the dividend, and the last group must come out exactly.",
                `${grouped(dividend)} is ${divisor} times a whole number, so keep multiplying ${divisor} until you reach it.`
            ];
            steps=[
                `${divisor} x ${quotient} = ${grouped(dividend)}.`,
                `The product comes out exactly, so nothing is left over.`,
                `${grouped(dividend)} divided by ${divisor} = ${key}`
            ];
            break;
        }
        case "estimate_first":{
            // The divisor is a multiple of ten and the estimate is a whole number of
            // divisors, so the estimate is exact. Both printed numbers are off their
            // rounded values by less than half of the rounding unit, and both are off
            // by a nonzero amount, so the rounding the prompt names really happens.
            let divisorTens=randInt(rng, 2, 5);
            let roundedDivisor=divisorTens*10;
            let estimate=randInt(rng, 2, 9)*10;
            let roundedDividend=estimate*roundedDivisor;
            let offset=(randInt(rng, 0, 1)===0?-1:1)*randInt(rng, 1, 49);
            let divisorOffset=(randInt(rng, 0, 1)===0?-1:1)*randInt(rng, 1, 4);
            let dividend=roundedDividend+offset;
            let divisor=roundedDivisor+divisorOffset;
            key=estimate;
            latex=`Estimate how many times \\( ${divisor} \\) goes into \\( ${grouped(dividend)} \\). Round \\( ${grouped(dividend)} \\) to the nearest hundred and \\( ${divisor} \\) to the nearest ten, and then divide those two rounded numbers.`;
            wrong=[
                Math.round(dividend/divisor),
                Math.round(roundedDividend/divisor),
                Math.round(dividend/roundedDivisor),
                estimate+1
            ];
            rungs=[
                "Estimating a quotient means rounding both numbers first and then dividing, and it is only honest if both roundings are written down, because the estimate is a division of the rounded numbers and not of the original ones.",
                `Round ${grouped(dividend)} to the nearest hundred and ${divisor} to the nearest ten, then divide the two rounded numbers.`
            ];
            steps=[
                `${grouped(dividend)} rounds to the nearest hundred as ${fmt(roundedDividend, 0)}, and ${divisor} rounds to the nearest ten as ${roundedDivisor}.`,
                `Divide the rounded numbers: ${fmt(roundedDividend, 0)} divided by ${roundedDivisor}.`,
                `${fmt(roundedDividend, 0)} divided by ${roundedDivisor} = ${key}`
            ];
            break;
        }
        case "check_by_multiplying":{
            // The check relation is quotient x divisor + remainder = dividend, so a
            // stated remainder has to be removed before the division, and forgetting
            // to is the mistake this branch is for.
            let divisor=randInt(rng, 4, divisorMax);
            let quotient=randInt(rng, 12, difficulty==="hard"?220:80);
            let remainder=randInt(rng, 1, divisor-1);
            let dividend=quotient*divisor+remainder;
            key=quotient;
            latex=`Dividing \\( ${grouped(dividend)} \\) by \\( ${divisor} \\) leaves a remainder of \\( ${remainder} \\). The check is \\( \\text{quotient} \\times ${divisor} + ${remainder} = ${grouped(dividend)} \\). What is the quotient?`;
            wrong=[Math.round(dividend/divisor), quotient+1, quotient-1, dividend-remainder];
            rungs=[
                "Checking a division means multiplying the quotient by the divisor and adding the remainder to get the dividend back, so the remainder has to come off the dividend before the division is done.",
                `Remove the remainder first, then divide what is left by ${divisor}.`
            ];
            steps=[
                `The dividend with the remainder removed is ${grouped(dividend)} - ${remainder} = ${quotient*divisor}.`,
                `${quotient*divisor} divided by ${divisor} = ${quotient}.`,
                `Checking: ${quotient} x ${divisor} + ${remainder} = ${grouped(dividend)}, so the quotient is ${key}`
            ];
            break;
        }
    }
    let keyText=String(key);
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:numberOptions(key, wrong, 0), expectedFormat:"Enter a whole number", subskill:type, hints:{rungs, concede:"The answer is "+keyText+"."}, solution: steps};
}
