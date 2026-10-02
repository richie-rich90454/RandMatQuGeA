import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {numberOptions} from "../../shared/Options.js";
import {fmt} from "../../shared/Numeric";
/**
 * Radical equations: one radical or two radicals.
 * @fileoverview Generates radical equation questions with MCQ distractors. Sets window.correctAnswer with correct value and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateRadicalEquation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["one_radical","two_radicals"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,10);
    let expectedFormat="Enter a number";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "one_radical":{
            let a=Math.floor(rng()*maxVal)+1;
            let b=Math.floor(rng()*maxVal)+1;
            let sol=b*b-a;
            correct=sol.toString();
            alternate=correct;
            display=correct;
            mathExpression=`Solve for x: \\( \\sqrt{x + ${a}} = ${b} \\)`;
            // Squaring without subtracting a leaves b^2, which is the key
            // itself whenever a is 1, and that is what used to leave three
            // options. The sign slip and the double-counted shift are the
            // other two mistakes.
            choices=numberOptions(sol, [b*b, a-b*b, sol+1, sol-1, b, sol+2], 0);
            break;
        }
        case "two_radicals":{
            let b=Math.floor(rng()*maxVal)+1;
            let a=b*b+Math.floor(rng()*maxVal)+1;
            // Isolate one radical, then square: x = ((a-b^2)/(2b))^2.
            // sqrt(x) = (a-b^2)/(2b) is the intermediate, and offering it as
            // a distractor is honest because it is the classic half-finished
            // answer; it is the key itself when that intermediate happens to
            // be 1, and the value filter drops it in exactly that case.
            let intermediate=(a-b*b)/(2*b);
            let sol=intermediate*intermediate;
            correct=fmt(sol,2);
            alternate=sol.toString();
            display=correct;
            mathExpression=`Solve for x: \\( \\sqrt{x + ${a}} - \\sqrt{x} = ${b} \\)`;
            choices=numberOptions(sol, [intermediate, (a+b*b)/(2*b), sol+0.5, sol-0.5, sol*2, (a-b*b)/b], 2);
            break;
        }
    }
    let latex=mathExpression;
    return {
        latex,
        correct,
        alternate,
        display,
        choices,
        expectedFormat
    };
}
