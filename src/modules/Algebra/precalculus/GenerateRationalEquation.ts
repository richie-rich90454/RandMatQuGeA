import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fourOptions} from "../../shared/Options.js";
import {fmt} from "../../shared/Numeric";
/**
 * Rational equation: simple or extraneous.
 * @fileoverview Generates rational equation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateRationalEquation(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    const max=getMaxForDifficulty(difficulty,5);
    const a=Math.floor(rng()*max)+1;
    const b=Math.floor(rng()*max)+1;
    const c=Math.floor(rng()*max)+1;
    const type=rng()<0.5?"simple":"extraneous";
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    if(type==="simple"){
        const d=Math.floor(rng()*max)+1;
        const e=Math.floor(rng()*max)+1;
        let numA=Math.floor(rng()*max)+1;
        const numB=Math.floor(rng()*max)+1;
        const denC=Math.floor(rng()*max)+1;
        const denD=d;
        const denominatorVal=denC*e;
        let guard=0;
        while(numA===denominatorVal&&guard<20){
            numA=Math.floor(rng()*max)+1;
            guard++;
        }
        if(numA===denominatorVal) numA=denominatorVal+1;
        const x=(e*denD-numB)/(numA-denominatorVal);
        const ans=fmt(x,2);
        correct=ans;
        alternate=x.toString();
        display=ans;
        mathExpression=`Solve: \\( \\frac{${numA}x + ${numB}}{${denC}x + ${denD}} = ${e} \\)`;
        // The reported defect here was `e` offered as "1" against a key of
        // "1.00": two spellings of one value, which is one option, not two.
        // Every candidate is rendered through the same fmt as the key, so the
        // filter compares values and the set always reaches four.
        choices=fourOptions(ans, [fmt(e,2), fmt(numA-denominatorVal,2), fmt(x+0.1,2), fmt(x-0.1,2), "no solution", fmt(numA,2)]);
        expectedFormat="Enter decimal answer";
    }
    else{
        const extraneousVal=a;
        const eq=`\\frac{1}{x - ${extraneousVal}} = \\frac{${b}}{x - ${extraneousVal}} + ${c}`;
        mathExpression=`Solve and check for extraneous solutions: \\( ${eq} \\)`;
        if(b===1){
            correct="no solution";
            alternate="no solution";
            display="no solution";
            // The excluded value is the answer a learner keeps when they cross-multiply
            // without excluding it, which is the whole point of this branch.
            choices=fourOptions(correct, [`x = ${extraneousVal}`,`x = ${extraneousVal+1}`,`x = ${extraneousVal-1}`,`x = ${extraneousVal+2}`]);
        }
        else{
            // Cross-multiplying gives 1 = b + c(x-a), so x = a + (1-b)/c.
            // b is not 1 here, so the solution is not the excluded value and
            // `x = a` is provably wrong.
            const sol=a+(1-b)/c;
            correct=fmt(sol,2);
            alternate=sol.toString();
            display=correct;
            choices=fourOptions(correct, [fmt(sol+0.1,2), fmt(sol-0.1,2), "no solution", `x = ${extraneousVal}`]);
        }
        expectedFormat="Enter 'no solution' or the solution";
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
