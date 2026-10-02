import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty, getOrdinal} from "../AlgebraUtils.js";
import {numberOptions} from "../../shared/Options.js";
import {fmt, fmtTrim} from "../../shared/Numeric";
/**
 * Power function modeling: direct, inverse, power variation.
 * @fileoverview Generates power function modeling questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generatePowerFunctionModeling(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    const types=["direct","inverse","power"];
    const type=types[Math.floor(rng()*types.length)];
    const max=getMaxForDifficulty(difficulty,10);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    const k=Math.floor(rng()*max)+1;
    const x1=Math.floor(rng()*max)+1;
    const y1=k*x1;
    const x2=Math.floor(rng()*max)+1;
    switch(type){
        case "direct":{
            mathExpression=`If y varies directly with x, and y=${y1} when x=${x1}, find y when x=${x2}.`;
            const y2=k*x2;
            const ans=y2.toString();
            correct=ans;
            alternate=ans;
            display=ans;
            // The classic mistakes here are dropping the constant of
            // variation and answering with the x that was asked about, so
            // both lead. x2 is the key itself whenever k is 1, which is
            // what used to collapse this set to three.
            choices=numberOptions(y2, [k, x2, y1, x1, k*x2+1, k*x2-1, y2*2], 0);
            expectedFormat="Enter a number";
            break;
        }
        case "inverse":{
            const kInv=x1*y1;
            mathExpression=`If y varies inversely with x, and y=${y1} when x=${x1}, find y when x=${x2}.`;
            const y2=kInv/x2;
            // fmt, not toFixed: this is the one rounding decision the whole
            // branch is graded on, and the option set has to be rendered
            // through it too, or a value that rounds differently is offered
            // as a wrong answer when it is the answer.
            const ans=fmt(y2,2);
            correct=ans;
            alternate=fmtTrim(y2,2);
            display=ans;
            // Inverse variation is where a learner forgets to invert, so
            // k*x2 leads and the value at a neighbouring x backs it up.
            // The old +/-0.5 perturbation was the same value as the key
            // whenever kInv divided x2 evenly, which is most of the time,
            // so the set could not be relied on.
            choices=numberOptions(y2, [kInv, k*x2, kInv/(x2+1), y1, kInv*x2, kInv/(x2-1||1), kInv+1], 2);
            expectedFormat="Enter a number";
            break;
        }
        case "power":{
            const exp=Math.floor(rng()*2)+2;
            const y1pow=k*Math.pow(x1,exp);
            // getOrdinal, not a literal "rd": a prompt that reads "the 2rd
            // power of x" is not a question a learner can answer.
            mathExpression=`If y varies as the ${exp}${getOrdinal(exp)} power of x, and y=${y1pow} when x=${x1}, find y when x=${x2}.`;
            const y2=k*Math.pow(x2,exp);
            const ans=y2.toString();
            correct=ans;
            alternate=ans;
            display=ans;
            // Reading the exponent one off in either direction, and dropping
            // the exponent entirely by treating the relation as direct
            // variation, are the mistakes this branch exists to catch.
            choices=numberOptions(y2, [k*Math.pow(x2,exp+1), k*Math.pow(x2,exp-1), y1pow, k*x2, k, k*Math.pow(x2,exp)+1, k*Math.pow(x2,exp)-1], 0);
            expectedFormat="Enter a number";
            break;
        }
    }
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: choices,
        expectedFormat: expectedFormat
    };
}
