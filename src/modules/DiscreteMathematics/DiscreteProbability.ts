/**
 * Probability questions generator with MCQ distractors
 * @fileoverview Generates various probability questions (basic, conditional, independent, mutually exclusive, Bayes, binomial, expected value, complement, permutation/combination, geometric). Returns a QuestionDto with correct value, alternate representation, display LaTeX, and plausible wrong answers for MCQ mode.
 * @date 2026-03-29
 */
import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxN, nPr, nCr, getOrdinal, factorial} from "./DiscreteUtils.js";
import {fourOptions} from "../shared/Options.js";
export function generateProbability(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let questionTypes=["basic","conditional","independent","mutually_exclusive","bayes","binomial","expected_value","complement","permutation_combination","geometric"];
    let questionType=questionTypes[Math.floor(rng()*questionTypes.length)];
    let plainCorrectAnswer: string="";
    let content: string[]=[];
    let scale=getMaxN(difficulty);
    let hint="";
    let choices: string[]=[];
    let answerAlternate="";
    let answerDisplay="";
    switch (questionType){
        case "basic":{
            let total=Math.floor(rng()*50)+10*scale/8;
            let favorable=Math.floor(rng()*(total-1))+1;
            let prob=favorable/total;
            let probStr=prob.toFixed(2);
            content.push(`A bag contains <span class="math">\\(${total}\\)</span> marbles, <span class="math">\\(${favorable}\\)</span> of which are red. What is the probability of drawing a red marble?`);
            plainCorrectAnswer=probStr;
            answerAlternate=`${favorable}/${total}`;
            answerDisplay=`\\frac{${favorable}}{${total}}`;
            hint="Enter a decimal or fraction";
            choices=[
                plainCorrectAnswer,
                ((favorable+1)/total).toFixed(2),
                ((favorable-1)/total).toFixed(2),
                (1-prob).toFixed(2),
                (favorable/total).toFixed(1)
            ];
            break;
        }
        case "conditional":{
            let total=Math.floor(rng()*100)+50*scale/8;
            let eventA=Math.floor(rng()*(total-10))+10;
            let eventB=Math.floor(rng()*(eventA-5))+5;
            let prob=eventB/eventA;
            let probStr=prob.toFixed(2);
            content.push(`Given <span class="math">\\(${total}\\)</span> items, <span class="math">\\(${eventA}\\)</span> are type A, and <span class="math">\\(${eventB}\\)</span> of those are also type B. Find the probability of type B given type A.`);
            plainCorrectAnswer=probStr;
            answerAlternate=`${eventB}/${eventA}`;
            answerDisplay=`\\frac{${eventB}}{${eventA}}`;
            hint="Enter a decimal or fraction";
            choices=[
                plainCorrectAnswer,
                ((eventB+1)/eventA).toFixed(2),
                ((eventB-1)/eventA).toFixed(2),
                (eventB/total).toFixed(2),
                (eventA/total).toFixed(2)
            ];
            break;
        }
        case "independent":{
            let probA=rng()*0.8+0.1;
            let probB=rng()*0.8+0.1;
            let probBoth=probA*probB;
            let probAStr=probA.toFixed(2);
            let probBStr=probB.toFixed(2);
            let probBothStr=probBoth.toFixed(2);
            content.push(`The probability of event A is <span class="math">\\(${probAStr}\\)</span>, and event B is <span class="math">\\(${probBStr}\\)</span>. If A and B are independent, find the probability of both occurring.`);
            plainCorrectAnswer=probBothStr;
            answerAlternate=`${probAStr} \\times ${probBStr}`;
            answerDisplay=`${probAStr} \\times ${probBStr}`;
            hint="Enter a decimal";
            choices=[
                plainCorrectAnswer,
                (probA+probB).toFixed(2),
                Math.max(probA, probB).toFixed(2),
                Math.min(probA, probB).toFixed(2),
                (probA*probB+0.1).toFixed(2)
            ];
            break;
        }
        case "mutually_exclusive":{
            let probA=rng()*0.5+0.2;
            let probB=rng()*(0.9-probA)+0.1;
            let probEither=probA+probB;
            let probAStr=probA.toFixed(2);
            let probBStr=probB.toFixed(2);
            let probEitherStr=probEither.toFixed(2);
            content.push(`Events A and B are mutually exclusive with <span class="math">\\(P(A)=${probAStr}\\)</span> and <span class="math">\\(P(B)=${probBStr}\\)</span>. Find the probability of A or B occurring.`);
            plainCorrectAnswer=probEitherStr;
            answerAlternate=`${probAStr}+${probBStr}`;
            answerDisplay=`${probAStr} + ${probBStr}`;
            hint="Enter a decimal";
            choices=[
                plainCorrectAnswer,
                (probA*probB).toFixed(2),
                Math.max(probA, probB).toFixed(2),
                Math.min(probA, probB).toFixed(2),
                (probA-probB).toFixed(2)
            ];
            break;
        }
        case "bayes":{
            let probA=rng()*0.5+0.2;
            let probBgivenA=rng()*0.8+0.1;
            const minB=probBgivenA*probA;
            let probB=minB+rng()*(0.7-minB);
            let probAgivenB=(probBgivenA*probA)/probB;
            let probAStr=probA.toFixed(2);
            let probBStr=probB.toFixed(2);
            let probBgivenAStr=probBgivenA.toFixed(2);
            let probAgivenBStr=probAgivenB.toFixed(2);
            content.push(`Given <span class="math">\\(P(A)=${probAStr}\\)</span>, <span class="math">\\(P(B)=${probBStr}\\)</span>, and <span class="math">\\(P(B|A)=${probBgivenAStr}\\)</span>, find <span class="math">\\(P(A|B)\\)</span>.`);
            plainCorrectAnswer=probAgivenBStr;
            answerAlternate=`\\frac{${probBgivenAStr} \\cdot ${probAStr}}{${probBStr}}`;
            answerDisplay=`\\frac{${probBgivenAStr} \\cdot ${probAStr}}{${probBStr}}`;
            hint="Enter a decimal";
            choices=[
                plainCorrectAnswer,
                (probBgivenA*probB).toFixed(2),
                (probBgivenA).toFixed(2),
                (probA/probB).toFixed(2),
                (1-probAgivenB).toFixed(2)
            ];
            break;
        }
        case "binomial":{
            let n=Math.floor(rng()*5)+5;
            let p=0.3+rng()*0.5;
            // The count of successes is drawn near the mode rather than anywhere in
            // the range. A binomial probability out at the tail rounds to 0.00 at
            // two places, and then the answer and three of the four mistakes print
            // as "0.00" too, which is a two-option question about nothing.
            let k=Math.max(1, Math.min(n-1, Math.round(n*p)+Math.floor(rng()*5)-2));
            let q=1-p;
            let prob=nCr(n, k)*Math.pow(p, k)*Math.pow(q, n-k);
            let pStr=p.toFixed(2);
            let qStr=q.toFixed(2);
            let probStr=prob.toFixed(2);
            content.push(`A trial has a success probability of <span class="math">\\(${pStr}\\)</span>. In <span class="math">\\(${n}\\)</span> trials, find the probability of exactly <span class="math">\\(${k}\\)</span> successes.`);
            plainCorrectAnswer=probStr;
            answerAlternate=`C(${n},${k}) \\cdot ${pStr}^{${k}} \\cdot ${qStr}^{${n-k}}`;
            answerDisplay=`\\binom{${n}}{${k}} \\cdot ${pStr}^{${k}} \\cdot ${qStr}^{${n-k}}`;
            hint="Enter a decimal";
            // The candidates are the neighbouring probabilities, the count with the
            // exponents swapped, and the same probability with the combination
            // factor dropped. The candidate that leaves out the (1-p) factor is no
            // longer offered: for a count near the top of the range it comes out
            // above one, and an option a learner could never write is not a
            // distractor, it is a bug in the question.
            let at=(j: number): string=>(nCr(n, j)*Math.pow(p, j)*Math.pow(q, n-j)).toFixed(2);
            choices=fourOptions(plainCorrectAnswer, [
                at(k+1),
                at(k-1),
                (nCr(n, k)*Math.pow(p, n-k)*Math.pow(q, k)).toFixed(2),
                (Math.pow(p, k)*Math.pow(q, n-k)).toFixed(2)
            ]);
            break;
        }
        case "expected_value":{
            let values=Array.from({length:3}, ()=>Math.floor(rng()*10)+1);
            let rawProbs=Array.from({length:3}, ()=>rng()*0.3+0.1);
            let sum=rawProbs.reduce((a,b)=>a+b,0);
            let probs=rawProbs.map(p=>p/sum);
            let expected=values.reduce((acc,v,i)=>acc+v*probs[i],0);
            let expectedStr=expected.toFixed(2);
            let valsStr=values.join(", ");
            let probsStr=probs.map(p=>p.toFixed(2)).join(", ");
            content.push(`A random variable takes values <span class="math">\\(${valsStr}\\)</span> with probabilities <span class="math">\\(${probsStr}\\)</span>. Find the expected value.`);
            plainCorrectAnswer=expectedStr;
            answerAlternate=plainCorrectAnswer;
            answerDisplay=plainCorrectAnswer;
            hint="Enter a decimal";
            let wrong1=values.reduce((a,b)=>a+b,0)/3;
            let wrong2=values[0]*probs[0]+values[1]*probs[1];
            let wrong3=(values[0]+values[1]+values[2])*probs[0];
            choices=[
                plainCorrectAnswer,
                wrong1.toFixed(2),
                wrong2.toFixed(2),
                wrong3.toFixed(2),
                (1/expected).toFixed(2)
            ];
            break;
        }
        case "complement":{
            let probA=rng()*0.8+0.1;
            let probNotA=1-probA;
            let probAStr=probA.toFixed(2);
            let probNotAStr=probNotA.toFixed(2);
            content.push(`If <span class="math">\\(P(A)=${probAStr}\\)</span>, find <span class="math">\\(P(\\text{not } A)\\)</span>.`);
            plainCorrectAnswer=probNotAStr;
            answerAlternate=`1-${probAStr}`;
            answerDisplay=`1 - ${probAStr}`;
            hint="Enter a decimal";
            choices=[
                plainCorrectAnswer,
                (1-probA+0.1).toFixed(2),
                (1-probA-0.1).toFixed(2),
                probAStr,
                (1+probA).toFixed(2)
            ];
            break;
        }
        case "permutation_combination":{
            let n=Math.floor(rng()*8)+5;
            // Two or more are chosen: P(n,1), C(n,1) and n^1 are all n, so every
            // candidate this branch offers collapses onto the answer.
            let r=Math.floor(rng()*(n-2))+2;
            let isPerm=rng()<0.5;
            let answer=isPerm?nPr(n, r):nCr(n, r);
            let answerStr=answer.toString();
            let symbol=isPerm?"P":"C";
            let display=isPerm?`P(${n},${r})`:`\\binom{${n}}{${r}}`;
            content.push(`Calculate <div class="math display">\\[${symbol}(${n}, ${r})\\]</div>`);
            plainCorrectAnswer=answerStr;
            answerAlternate=`${symbol}(${n},${r})`;
            answerDisplay=display;
            hint="Enter a number";
            let wrong1=isPerm?nCr(n, r):nPr(n, r);
            let wrong2=Math.pow(n, r);
            let wrong3=factorial(n);
            let wrong4=n*r;
            choices=fourOptions(plainCorrectAnswer, [wrong1.toString(), wrong2.toString(), wrong3.toString(), wrong4.toString()]);
            break;
        }
        case "geometric":{
            // The success probability is bounded away from one so that the first
            // success on the k-th trial keeps a two-decimal probability. At p above
            // 0.6 the answer rounds to 0.00 and the branch collapses to two options.
            let p=0.2+rng()*0.4;
            let k=Math.floor(rng()*5)+1;
            let prob=Math.pow(1-p, k-1)*p;
            let pStr=p.toFixed(2);
            let probStr=prob.toFixed(2);
            content.push(`A trial has success probability <span class="math">\\(${pStr}\\)</span>. Find the probability of the first success on the <span class="math">\\(${k}${getOrdinal(k)}\\)</span> trial.`);
            plainCorrectAnswer=probStr;
            let q=(1-p).toFixed(2);
            answerAlternate=`${pStr} \\cdot ${q}^{${k-1}}`;
            answerDisplay=`${pStr} \\cdot ${q}^{${k-1}}`;
            hint="Enter a decimal";
            let wrong1=Math.pow(1-p, k)*p;
            let wrong2=Math.pow(1-p, k-1);
            let wrong3=p;
            let wrong4=Math.pow(p, k);
            choices=fourOptions(plainCorrectAnswer, [
                wrong1.toFixed(2),
                wrong2.toFixed(2),
                wrong3.toFixed(2),
                wrong4.toFixed(2),
                (1-prob).toFixed(2)
            ]);
            break;
        }
    }
    let uniqueChoices=fourOptions(plainCorrectAnswer, choices);
    return {
        latex: content.join("<br>"),
        correct: plainCorrectAnswer,
        alternate: answerAlternate,
        display: answerDisplay,
        choices: uniqueChoices,
        expectedFormat: hint
    };
}
