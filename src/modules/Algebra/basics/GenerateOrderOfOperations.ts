import type{RngFn, QuestionDto}from"../../../types/global";
import{getMaxForDifficulty}from"../AlgebraUtils.js";
import{fourOptions}from"../../shared/Options.js";

/**
 * Generates an order‑of‑operations question (basic, with exponents, or with parentheses) with MCQ distractors.
 * @fileoverview Order of operations evaluation. Every answer is a whole number
 * the printed expression evaluates to exactly, so nothing is rounded. The wrong
 * answers are the three ways a learner gets precedence wrong: evaluating left to
 * right, dropping the operation that should bind tightest, and binding it to the
 * wrong pair of terms.
 * @date 2026-04-18
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns QuestionDto
 */
export function generateOrderOfOperations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["basic","with_exponents","with_parentheses"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,5);
    let expectedFormat="Enter a number";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxVal)+1;
    let b=Math.floor(rng()*maxVal)+1;
    let c=Math.floor(rng()*maxVal)+1;
    switch(type){
        case "basic":{
            let expr=`${a} + ${b} \\times ${c}`;
            let result=a + b*c;
            correct=result.toString();
            alternate=correct;
            display=correct;
            mathExpression=`Evaluate: \\( ${expr} \\)`;
            choices=[
                `${(a+b)*c}`,
                `${a+b+c}`,
                `${a*b+c}`,
                `${a*b*c}`,
                `${a*c+b}`,
                `${a-b*c}`
            ];
            break;
        }
        case "with_exponents":{
            // The base is drawn above one, because an exponent of one makes the
            // superscript the only thing in the expression that is not itself.
            let power=Math.max(2, b);
            let expr=`${a} + ${power}^2`;
            let result=a + power*power;
            correct=result.toString();
            alternate=correct;
            display=correct;
            mathExpression=`Evaluate: \\( ${expr} \\)`;
            // Reading the exponent as covering the whole sum is the mistake this
            // form is testing; the other two are squaring the wrong term and
            // treating the exponent as an ordinary factor.
            choices=[
                `${(a+power)*(a+power)}`,
                `${a*a+power}`,
                `${a+power}`,
                `${a*power}`,
                `${a+power+power}`
            ];
            break;
        }
        case "with_parentheses":{
            // The multiplier is drawn above one, because a parenthesis times one
            // is the same expression with the parenthesis deleted, which asks
            // nothing about precedence.
            let factor=Math.max(2, c);
            let expr=`(${a} + ${b}) \\times ${factor}`;
            let result=(a+b)*factor;
            correct=result.toString();
            alternate=correct;
            display=correct;
            mathExpression=`Evaluate: \\( ${expr} \\)`;
            // Dropping the parentheses, dropping the multiplication, binding the
            // multiplication to one term rather than the sum, and multiplying all
            // three terms are the four slips this form is testing.
            choices=[
                `${a+b*factor}`,
                `${a+b}`,
                `${a*b+factor}`,
                `${a*factor+b}`,
                `${a*b*factor}`,
                `${a+b+factor}`
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
