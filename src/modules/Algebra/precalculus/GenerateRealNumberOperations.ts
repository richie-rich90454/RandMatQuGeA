import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fourOptions, numberOptions} from "../../shared/Options.js";
/**
 * Real number operations: absolute, distance, order, interval.
 * @fileoverview Generates real number operation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateRealNumberOperations(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    const types=["absolute","distance","order","interval"];
    const type=types[Math.floor(rng()*types.length)];
    const max=getMaxForDifficulty(difficulty,10);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "absolute":{
            const a=Math.floor(rng()*max*2)-max;
            mathExpression=`Evaluate: \\( |${a}| \\)`;
            const ans=Math.abs(a).toString();
            correct=ans;
            alternate=ans;
            display=ans;
            // The signed input was offered as a distractor, which is the
            // answer itself whenever the input is positive, and that is half
            // the draws. The sign flip and the off-by-one are the real
            // mistakes, and they are distinct from the answer by
            // construction.
            choices=numberOptions(Math.abs(a), [-Math.abs(a), Math.abs(a)+1, Math.abs(a)-1, Math.abs(a)+2, Math.abs(a)-2], 0);
            expectedFormat="Enter a number";
            break;
        }
        case "distance":{
            const a=Math.floor(rng()*max);
            const b=Math.floor(rng()*max);
            mathExpression=`Find the distance between \\( ${a} \\) and \\( ${b} \\) on the number line.`;
            const dist=Math.abs(a-b);
            correct=dist.toString();
            alternate=correct;
            display=correct;
            // Adding the endpoints instead of subtracting them is the mistake
            // this branch exists to catch, so it leads. The off-by-one and the
            // larger-endpoint-only reading back it up. a and b are drawn from
            // 0 upward, so |a|+|b| and a+b are the same value as each other,
            // which is what used to leave the set at three.
            choices=numberOptions(dist, [Math.abs(a)+Math.abs(b), dist+1, dist-1, Math.max(a,b), dist+2, dist*2], 0);
            expectedFormat="Enter a number";
            break;
        }
        case "order":{
            // A true/false answer has two options, and "maybe" and "cannot
            // determine" were offered to reach four. Neither is a verdict a
            // learner gives about two printed numbers, so both taught the
            // lesson the option set exists to prevent. The question is
            // therefore asked as the one it really is: which of the four
            // relations between the two numbers holds. Sorting first makes
            // exactly one of them true by construction.
            let lo=Math.floor(rng()*max);
            let hi=Math.floor(rng()*max);
            let guard=0;
            while(hi===lo&&guard<20){
                hi=Math.floor(rng()*max);
                guard++;
            }
            if (hi===lo) hi=lo+1;
            if (lo>hi){
                let swap=lo;
                lo=hi;
                hi=swap;
            }
            correct=`${lo} < ${hi}`;
            alternate=correct;
            display=correct;
            mathExpression=`Which of the following is true for \\( ${lo} \\) and \\( ${hi} \\)?`;
            choices=fourOptions(correct, [`${hi} < ${lo}`, `${lo} = ${hi}`, `${lo} > ${hi}`, `${hi} ≤ ${lo}`]);
            expectedFormat="Enter the true relation";
            break;
        }
        case "interval":{
            const a=Math.floor(rng()*max)+1;
            const b=a+Math.floor(rng()*max)+2;
            const types=["open","closed","half-open","unbounded"];
            const intervalType=types[Math.floor(rng()*types.length)];
            let interval="";
            let desc="";
            // The ray an unbounded interval is bounded at, so the distractors
            // can be built from the same number as the answer. Reading
            // `interval.includes("(")` for this instead is wrong for
            // `(-∞, b)`, which also contains a bracket, and that is how the
            // two ends used to get crossed.
            let bound=0;
            let upper=false;
            switch(intervalType){
                case "open":
                    interval=`(${a}, ${b})`;
                    desc=`all x such that ${a} < x < ${b}`;
                    break;
                case "closed":
                    interval=`[${a}, ${b}]`;
                    desc=`all x such that ${a} ≤ x ≤ ${b}`;
                    break;
                case "half-open":
                    if(rng()<0.5){
                        interval=`[${a}, ${b})`;
                        desc=`all x such that ${a} ≤ x < ${b}`;
                    }
                    else{
                        interval=`(${a}, ${b}]`;
                        desc=`all x such that ${a} < x ≤ ${b}`;
                    }
                    break;
                case "unbounded":
                    upper=rng()<0.5;
                    bound=upper?b:a;
                    interval=upper?`(-∞, ${b})`:`(${a}, ∞)`;
                    desc=upper?`all x such that x < ${b}`:`all x such that x > ${a}`;
                    break;
            }
            mathExpression=`Write the interval \\( ${interval} \\) in set-builder notation.`;
            correct=desc;
            alternate=desc;
            display=desc;
            // The interval notation itself was offered as an option, and the
            // question asks for set-builder notation, so that was a second
            // correct answer to the same question. The pool is the other
            // readings of the same endpoints: closing the endpoint that is
            // open, moving it by one, and reversing the ray.
            let wrong: string[]=[];
            if(interval.includes("∞")){
                wrong=upper?[`all x such that x ≤ ${bound}`, `all x such that x < ${bound-1}`, `all x such that x > ${bound}`]:[`all x such that x ≥ ${bound}`, `all x such that x > ${bound+1}`, `all x such that x < ${bound}`];
            }
            else{
                wrong=[`all x such that ${a} ≤ x ≤ ${b}`, `all x such that ${a} ≤ x < ${b}`, `all x such that ${a} < x ≤ ${b}`, `all x such that ${a-1} < x < ${b+1}`];
            }
            choices=fourOptions(desc, wrong);
            expectedFormat="Enter a description like 'x > 3' or interval";
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
