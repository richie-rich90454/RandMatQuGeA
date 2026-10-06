import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fourOptions, numberOptions} from "../../shared/Options.js";
/**
 * Polynomial end behavior: end behavior, multiplicity, IVT.
 * @fileoverview Generates polynomial property questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generatePolynomialEndBehavior(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    const types=["endbehavior","multiplicity","ivt"];
    const type=types[Math.floor(rng()*types.length)];
    const max=getMaxForDifficulty(difficulty,3);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    const a=Math.floor(rng()*max)+1;
    const b=Math.floor(rng()*max)+1;
    switch(type){
        case "endbehavior":{
            const deg=Math.floor(rng()*2)+3;
            const lc=rng()<0.5?1:-1;
            const poly=lc===1?`x^${deg} + ...`:`-x^${deg} + ...`;
            mathExpression=`Describe the end behavior of \\( ${poly} \\).`;
            let desc="";
            if(deg%2===0){
                desc=lc===1?"both ends up":"both ends down";
            }else{
                desc=lc===1?"left down, right up":"left up, right down";
            }
            correct=desc;
            alternate=desc;
            display=desc;
            // The four descriptions are the whole domain of the answer, so all
            // four are offered and the one that is right leads.
            choices=fourOptions(desc, ["both ends up","both ends down","left down, right up","left up, right down"]);
            expectedFormat="Enter description like 'both ends up'";
            break;
        }
        case "multiplicity":{
            const root=a;
            const mult=Math.floor(rng()*2)+1;
            const poly=`(x - ${root})^${mult}`;
            mathExpression=`For the polynomial \\( ${poly} \\), what is the multiplicity of the root at x=${root}?`;
            const ans=mult.toString();
            correct=ans;
            alternate=ans;
            display=ans;
            // A multiplicity of 1 made `mult+1`, `1` and the key the same
            // option, which left the set at three. The pool is the whole
            // answer domain a learner would reach for: the exponent read
            // one high or one low, zero for a root that is not repeated,
            // and the root's own location.
            choices=numberOptions(mult, [mult+1, mult-1, 0, 3, 2*mult, root], 0);
            expectedFormat="Enter a number";
            break;
        }
        case "ivt":{
            const val1=Math.floor(rng()*10)-5;
            const val2=val1+Math.floor(rng()*5)+2;
            const poly=`x^3 - ${a}x + ${b}`;
            const f=(x:number):number=>x*x*x-a*x+b;
            // "maybe" and "cannot determine" were offered here, and neither is
            // an answer a learner could give to a sign computation: they
            // were filler that taught the learner to pick the option that
            // looked like an answer. The question is asked as the sign
            // comparison the theorem actually turns on, whose four
            // outcomes are mutually exclusive and exhaustive.
            const first=f(val1);
            const second=f(val2);
            if (first===0||second===0){
                correct="at least one of them is zero";
            }
            else if (first>0&&second>0){
                correct="both positive";
            }
            else if (first<0&&second<0){
                correct="both negative";
            }
            else{
                correct="opposite signs";
            }
            alternate=correct;
            display=correct;
            mathExpression=`Use the Intermediate Value Theorem: compute \\( ${poly} \\) at \\( x = ${val1} \\) and at \\( x = ${val2} \\), then report their signs.`;
            choices=fourOptions(correct, ["both positive","both negative","opposite signs","at least one of them is zero"]);
            expectedFormat="Enter a description of the two signs";
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
