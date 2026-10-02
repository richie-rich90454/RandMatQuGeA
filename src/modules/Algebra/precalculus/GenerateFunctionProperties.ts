import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fourOptions} from "../../shared/Options.js";
/**
 * Function properties: continuity, extrema, symmetry, asymptotes, end behavior.
 * @fileoverview Generates function property questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateFunctionProperties(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    const types=["continuity","extrema","symmetry","asymptotes","endbehavior"];
    const type=types[Math.floor(rng()*types.length)];
    const max=getMaxForDifficulty(difficulty,5);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "continuity":{
            const a=Math.floor(rng()*max)+1;
            const functions=[
                `f(x)=\\frac{1}{x-${a}}`,
                `f(x)=\\sqrt{x-${a}}`,
                `f(x)=x^2+${a}`
            ];
            const chosen=functions[Math.floor(rng()*functions.length)];
            mathExpression=`Where is \\( ${chosen} \\) discontinuous? (Enter x-value or 'none' or interval)`;
            let answer="";
            if(chosen.includes("frac")) answer=`x = ${a}`;
            else if(chosen.includes("sqrt")) answer=`x < ${a}`;
            else answer="none";
            correct=answer;
            alternate=answer;
            display=answer;
            if(answer==="none"){
                // A learner who cannot find a discontinuity reaches for a
                // value rather than for "nowhere", and for "everywhere" when
                // they read it as continuity instead.
                choices=fourOptions(answer, [`x = ${a}`, "all reals", "x = 0", `x = ${a+1}`]);
            }
            else if(answer.includes("x =")){
                // `a-1` is 0 whenever a is 1, and `x = 0` was also offered,
                // so the pair collapsed and left three. Off-by-one on the
                // shift and a sign that was not accounted for back it up.
                choices=fourOptions(answer, [`x = ${a+1}`,`x = ${a-1}`,`x = ${a+2}`,"x = 0",`x ≠ ${a}`]);
            }
            else{
                // The four interval readings of the radical's domain, all
                // of which a learner writes before settling on the strict
                // one the prompt asks for.
                choices=fourOptions(answer, [`x ≤ ${a}`,`x > ${a}`,`x ≥ ${a}`,`x ≠ ${a}`]);
            }
            expectedFormat="Enter x value, interval, or 'none'";
            break;
        }
        case "extrema":{
            const a=Math.floor(rng()*max)+1;
            const b=Math.floor(rng()*max)+1;
            mathExpression=`Does \\( f(x)=x^2 - ${a}x + ${b} \\) have a local minimum or maximum? (Enter 'min' or 'max')`;
            correct="min";
            alternate="minimum";
            display="min";
            choices=["min","max","neither","both"];
            expectedFormat="Enter 'min' or 'max'";
            break;
        }
        case "symmetry":{
            const functions=[
                {expr:"f(x)=x^2",type:"even"},
                {expr:"f(x)=x^3",type:"odd"},
                {expr:"f(x)=x^2+x",type:"neither"}
            ];
            const chosen=functions[Math.floor(rng()*functions.length)];
            mathExpression=`Is \\( ${chosen.expr} \\) even, odd, or neither?`;
            correct=chosen.type;
            alternate=chosen.type;
            display=chosen.type;
            // Three words cannot make four options. The fourth is the fourth
            // word in the same register, which this generator already uses in
            // its extrema branch: the zero function is both even and odd, so
            // "both" is a real answer to this question, and a learner reaches
            // for it. None of these three polynomials is the zero function,
            // so it is wrong here.
            choices=fourOptions(correct, ["even","odd","neither","both"]);
            expectedFormat="Enter 'even', 'odd', 'neither', or 'both'";
            break;
        }
        case "asymptotes":{
            const a=Math.floor(rng()*max)+1;
            const b=Math.floor(rng()*max)+1;
            const expr=`\\frac{${a}x+${b}}{x-${a}}`;
            mathExpression=`Find the vertical asymptote of \\( ${expr} \\). (Enter x=value)`;
            const ans=`x=${a}`;
            correct=ans;
            alternate=ans;
            display=ans;
            // The horizontal asymptote, which is the numerator's leading
            // coefficient, is the mistake this branch exists to catch, so it
            // leads. a-1 is 0 whenever a is 1 and `y=0` was also offered.
            choices=fourOptions(ans, [`y=${a}`,"y=0",`x=${a+1}`,`x=${a-1}`,`x=${a+2}`]);
            expectedFormat="Enter x = number";
            break;
        }
        case "endbehavior":{
            const aSign=Math.floor(rng()*2)+1;
            const deg=Math.floor(rng()*2)+3;
            const sign=aSign===1?"positive":"negative";
            const evenOdd=deg%2===0?"even":"odd";
            let desc="";
            if(evenOdd==="even"){
                desc=sign==="positive"?"both ends up":"both ends down";
            }else{
                desc=sign==="positive"?"left down, right up":"left up, right down";
            }
            mathExpression=`Describe the end behavior of a polynomial with leading coefficient ${sign} and degree ${deg}.`;
            correct=desc;
            alternate=desc;
            display=desc;
            // Reading the degree's parity backwards and reading the leading
            // coefficient's sign backwards are the two mistakes, and the
            // four descriptions are the whole answer domain.
            choices=fourOptions(desc, ["both ends up","both ends down","left down, right up","left up, right down"]);
            expectedFormat="Enter description like 'both ends up'";
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
