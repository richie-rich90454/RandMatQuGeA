import type{RngFn, QuestionDto}from"../../../types/global";
import{getMaxForDifficulty}from"../AlgebraUtils.js";
import{fmt}from"../../shared/Numeric";
import{fourOptions}from"../../shared/Options.js";

/**
 * Splits a positive whole number into a normalized mantissa and a power of ten.
 * The mantissa is exact in the precision the question asks for, because a whole
 * number divided by the largest power of ten below it carries no digits past
 * that power. This is what lets the generator print a key in the form the
 * question declared instead of a rounded one.
 *
 * @param value - A positive whole number.
 * @returns The mantissa and the exponent whose product is the value.
 */
function decompose(value: number): {mantissa: number, exponent: number}{
    let exponent=String(value).length-1;
    return {mantissa: value/Math.pow(10, exponent), exponent};
}

/**
 * Scientific notation: convert to standard, to scientific, multiply, divide.
 * @fileoverview Generates scientific notation questions with MCQ distractors.
 * Every quantity drawn here is an exact product of one-digit mantissas and powers
 * of ten, so every key is exact in the precision the prompt declares and nothing
 * is rounded. The key is written the way the prompt asks for, which is the
 * spelling `toExponential` does not produce: it emits a leading sign in the
 * exponent, as in `4.00e+5`, which contradicts a declared format of `1.2e3` and
 * is not a spelling a learner would write. The power of ten, not the mantissa, is
 * what grows with the difficulty, because a mantissa of two digits or more makes
 * the product inexact in the two decimal places the format asks for.
 * @date 2026-04-18
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns QuestionDto
 */
export function generateScientificNotation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["to_standard","to_scientific","multiply","divide"];
    let type=types[Math.floor(rng()*types.length)];
    // Only the power of ten grows with the difficulty. The mantissa stays a
    // single digit so that every product is exact in two decimal places, which
    // a larger mantissa would not be.
    let expMax=Math.max(2, getMaxForDifficulty(difficulty,3));
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "to_standard":{
            let a=2+Math.floor(rng()*8);
            let b=1+Math.floor(rng()*expMax);
            let sci=`${a} \\times 10^{${b}}`;
            let std=a*Math.pow(10, b);
            correct=String(std);
            alternate=correct;
            display=correct;
            mathExpression=`Convert to standard notation: \\( ${sci} \\)`;
            expectedFormat="Enter a whole number";
            // Reporting the mantissa on its own, and shifting the power of ten by
            // one, are the two slips this form is testing.
            choices=[
                `${std}`,
                `${a}`,
                `${std*10}`,
                `${std+1}`,
                `${std-1}`
            ];
            break;
        }
        case "to_scientific":{
            let a=2+Math.floor(rng()*8);
            let std=a*Math.pow(10, 2+Math.floor(rng()*expMax));
            let parts=decompose(std);
            correct=`${fmt(parts.mantissa,1)}e${parts.exponent}`;
            alternate=String(std);
            display=`${parts.mantissa} \\times 10^{${parts.exponent}}`;
            mathExpression=`Write in scientific notation: \\( ${std} \\)`;
            expectedFormat="Enter in form like 1.2e3 or 1.2×10^3";
            // Moving the decimal and moving the exponent are the two ways a
            // learner can be a factor of ten out without the value changing.
            choices=[
                `${fmt(parts.mantissa+0.1,1)}e${parts.exponent}`,
                `${fmt(parts.mantissa-0.1,1)}e${parts.exponent}`,
                `${parts.mantissa}e${parts.exponent+1}`,
                `${parts.mantissa}e${parts.exponent-1}`
            ];
            break;
        }
        case "multiply":{
            let m1=2+Math.floor(rng()*8);
            let m2=2+Math.floor(rng()*8);
            let p=1+Math.floor(rng()*expMax);
            let q=1+Math.floor(rng()*expMax);
            let sci1=`(${m1} \\times 10^{${p}})`;
            let sci2=`(${m2} \\times 10^{${q}})`;
            let lead=m1*m2;
            let product=lead*Math.pow(10, p+q);
            // A product of two single digits is at most 81, so normalizing it
            // divides by ten at most once and the mantissa stays exact.
            let parts=lead<10?{mantissa:lead, exponent:p+q}:{mantissa:lead/10, exponent:p+q+1};
            correct=`${fmt(parts.mantissa,2)}e${parts.exponent}`;
            alternate=String(product);
            display=`${parts.mantissa} \\times 10^{${parts.exponent}}`;
            mathExpression=`Multiply: \\( ${sci1} \\times ${sci2} \\)`;
            expectedFormat="Enter in scientific notation like 1.23e4";
            // The last candidate is the unnormalized form, which is the value ten
            // times the answer once the product is a two-digit number. When the
            // product is a single digit it is the key, and the filter drops it.
            choices=[
                `${fmt(parts.mantissa+0.1,2)}e${parts.exponent}`,
                `${fmt(parts.mantissa-0.1,2)}e${parts.exponent}`,
                `${parts.mantissa}e${parts.exponent+1}`,
                `${parts.mantissa}e${parts.exponent-1}`,
                `${lead}e${p+q}`
            ];
            break;
        }
        case "divide":{
            // The numerator's mantissa is drawn as a multiple of the
            // denominator's, so the quotient is whole. A pair that is not a
            // multiple makes the answer a repeating decimal, which the question
            // cannot grade and which no format hint covers.
            let bottom=2+Math.floor(rng()*3);
            let factor=2+Math.floor(rng()*Math.floor(9/bottom));
            let top=bottom*factor;
            let lowExp=1+Math.floor(rng()*expMax);
            let gap=1+Math.floor(rng()*2);
            let highExp=lowExp+gap;
            let sci1=`(${top} \\times 10^{${highExp}})`;
            let sci2=`(${bottom} \\times 10^{${lowExp}})`;
            let quotient=factor*Math.pow(10, gap);
            correct=String(quotient);
            alternate=correct;
            display=correct;
            mathExpression=`Divide: \\( \\frac{${sci1}}{${sci2}} \\)`;
            expectedFormat="Enter a number";
            // Dividing the mantissas and stopping, and dividing the exponents by
            // subtracting one instead of the gap, are the two slips this form is
            // testing. One is never right: the quotient is at least twenty.
            choices=[
                `${quotient}`,
                `${factor}`,
                `${quotient*10}`,
                `${quotient/10}`,
                "1"
            ];
            break;
        }
    }
    return {
        latex: mathExpression,
        correct,
        alternate,
        display,
        choices: fourOptions(correct, choices),
        expectedFormat
    };
}
