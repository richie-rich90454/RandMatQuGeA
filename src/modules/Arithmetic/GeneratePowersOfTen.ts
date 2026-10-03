/**
 * @file Powers of ten: multiplying and dividing by them, rounding to the nearest
 * one, and reading a power of ten as a shift of the decimal point.
 * @description Every answer here is produced by moving a decimal point or by a
 * whole multiple of ten, and every one of them is computed in integer arithmetic
 * and rendered by string surgery rather than by dividing, because a power of ten
 * divided into a decimal in binary floating point prints as 0.30000000000000004.
 *
 * The decimal-shift branch works on the digits of a whole number and never
 * evaluates a quotient at all, so the key is the shifted digit string and cannot
 * drift from what the learner sees.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{fourOptions, numberOptions}from"../shared/Options.js";
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

/**
 * Moves the decimal point of a whole number a number of places to the left,
 * padding with leading zeros where the shift runs off the front. Nothing is
 * evaluated, so the result is exactly the decimal the prompt asks for.
 *
 * @param value - The whole number.
 * @param places - How many places to move the point left. Zero leaves it off.
 * @returns The shifted decimal.
 */
function shiftLeft(value: number, places: number): string{
    let digits=String(value);
    if (places<=0) return digits;
    if (places>=digits.length) return "0."+"0".repeat(places-digits.length)+digits;
    return digits.slice(0, digits.length-places)+"."+digits.slice(digits.length-places);
}

/**
 * Moves the decimal point of a whole number a number of places to the right.
 *
 * @param value - The whole number.
 * @param places - How many places to move the point right.
 * @returns The shifted decimal.
 */
function shiftRight(value: number, places: number): string{
    return String(value)+"0".repeat(Math.max(0, places));
}

export function generatePowersOfTen(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["multiply_by_power","divide_by_power","order_of_magnitude","decimal_shift"];
    let type=types[Math.floor(rng()*types.length)];
    let topPower=difficulty==="hard"?5:difficulty==="easy"?3:4;
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number, written out in full";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "multiply_by_power":{
            // The mantissa is a whole number of hundredths and the exponent is at
            // least two, so the "read the decimal point as nothing" mistake produces
            // a number that is different from the answer.
            let hundredths=randInt(rng, 11, 99);
            let exponent=randInt(rng, 2, topPower);
            let mantissa=fmt(hundredths/10, 1);
            let keyValue=hundredths*Math.pow(10, exponent-1);
            key=String(keyValue);
            latex=`What is \\( ${mantissa} \\times 10^{${exponent}} \\)?`;
            let unit=Math.pow(10, exponent-1);
            choices=numberOptions(keyValue, [keyValue*10, hundredths, keyValue+unit, keyValue-unit], 0);
            rungs=[
                "Multiplying by a positive power of ten moves the decimal point that many places to the right, padding with zeros where the number runs out of digits.",
                `${mantissa} has the decimal point one place from the right, and multiplying by 10 to the power ${exponent} moves it ${exponent} places right.`
            ];
            steps=[
                `${mantissa} is the number ${hundredths} with its decimal point one place to the left.`,
                `Multiplying by 10 to the power ${exponent} moves the decimal point ${exponent} places to the right.`,
                `The result is ${key}`
            ];
            break;
        }
        case "divide_by_power":{
            let quotient=randInt(rng, 3, difficulty==="hard"?900:200);
            let exponent=randInt(rng, 1, 4);
            let dividend=quotient*Math.pow(10, exponent);
            key=String(quotient);
            latex=`What is \\( ${grouped(dividend)} \\div 10^{${exponent}} \\)?`;
            choices=numberOptions(quotient, [quotient*10, quotient+1, quotient-1, dividend], 0);
            rungs=[
                "Dividing by a positive power of ten moves the decimal point that many places to the left, and a number written as whole digits has nothing to move, so those digits simply become the quotient.",
                `Dividing by 10 to the power ${exponent} shifts ${grouped(dividend)} ${exponent} places to the left.`
            ];
            steps=[
                `${grouped(dividend)} = ${grouped(dividend)} x 1 divided by 10 to the power ${exponent}.`,
                `Moving the decimal point ${exponent} places left leaves ${quotient}.`,
                `${grouped(dividend)} divided by 10 to the power ${exponent} = ${key}`
            ];
            break;
        }
        case "order_of_magnitude":{
            // Rounding to the nearest power of ten is decided by whether the number
            // is above or below the square root of ten times its own place. Drawing
            // the leading digit between six and nine puts every such number above
            // five times its own place, which is the same decision, and puts it far
            // enough above the boundary that no rounding error can move it.
            let power=randInt(rng, 1, topPower);
            let block=Math.pow(10, power);
            let leading=randInt(rng, 6, 9);
            let offset=(randInt(rng, 0, 1)===0?-1:1)*randInt(rng, 0, Math.floor(0.4*block));
            let value=leading*block+offset;
            key=String(block*10);
            latex=`Round \\( ${grouped(value)} \\) to the nearest power of ten. What do you get?`;
            expectedFormat="Enter a whole number, written out in full";
            choices=numberOptions(block*10, [block, block*100, 5*block, leading*block], 0);
            rungs=[
                "Rounding to the nearest power of ten asks which single power of ten the number is closest to, which is decided by its first two digits rather than by its last.",
                `${grouped(value)} lies between ${leading*block} and ${leading*block+block}, and ${key} is the power of ten it is closest to.`
            ];
            steps=[
                `${grouped(value)} is about ${leading} times 10 to the power ${power}.`,
                `It sits between 10 to the power ${power} and 10 to the power ${power+1}.`,
                `It is nearer 10 to the power ${power+1}, so the nearest power of ten is ${key}`
            ];
            break;
        }
        case "decimal_shift":{
            // Ten to a negative power is a shift left, and the shift is done on the
            // digits rather than by dividing, so the key is exactly the decimal that
            // appears on the paper.
            let digits=randInt(rng, 11, 99);
            let places=randInt(rng, 1, difficulty==="hard"?4:3);
            key=shiftLeft(digits, places);
            latex=`What is \\( ${digits} \\times 10^{-${places}} \\), written as a decimal?`;
            expectedFormat="Enter a decimal, for example 0.042";
            let wrong=[shiftLeft(digits, places-1), shiftLeft(digits, places+1), shiftRight(digits, places), shiftLeft(digits, places+2)];
            choices=fourOptions(key, wrong);
            rungs=[
                "A negative exponent is a division: ten to the power minus n moves the decimal point n places to the left, and the digit before the point is filled with zeros.",
                `${digits} has its decimal point one place from the right, and the power ${places} moves it ${places} places to the left.`
            ];
            steps=[
                `${digits} times 10 to the power minus ${places} divides by 10 ${places} times.`,
                `Moving the decimal point ${places} places left gives ${key}.`,
                `The decimal is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
