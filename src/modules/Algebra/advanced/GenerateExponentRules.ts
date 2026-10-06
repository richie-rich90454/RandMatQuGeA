import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fourOptions} from "../../shared/Options.js";
/**
 * Exponent rules: product, quotient, power, negative, zero.
 * @fileoverview Generates questions on exponent rules with MCQ distractors. Sets window.correctAnswer with correct expression and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateExponentRules(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["product","quotient","power","negative","zero"];
    let type=types[Math.floor(rng()*types.length)];
    let maxBase=getMaxForDifficulty(difficulty,4);
    let base=Math.floor(rng()*maxBase)+2;
    let m=Math.floor(rng()*3)+1;
    let n=Math.floor(rng()*3)+1;
    // (a^1)^1 is a^1, so the power rule is not exercised and every candidate the
    // branch can name collapses onto the answer or onto each other, leaving a
    // three-option question. Moving the outer exponent keeps the branch asking
    // the question it exists for.
    if (type==="power"&&m===1&&n===1) n=2;
    let expectedFormat="Enter an expression like 2^3 or 1/2^3";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "product":{
            correct=base+"^"+(m+n);
            alternate=correct;
            display=correct;
            expectedFormat="Enter as a^b";
            mathExpression="Simplify: \\( " + base + "^{" + m + "} \\times " + base + "^{" + n + "} \\)";
            // m and n are each 1, 2 or 3, so base^m, base^n and base^(m*n) are
            // frequently the same option and the set used to collapse to three.
            choices=fourOptions(correct, [`${base}^${m+n+1}`, `${base}^${m*n}`, `${base}^${m}`, `${base}^${n}`, `${base}^${m+n-1}`, `${base}^${2*(m+n)}`]);
            break;
        }
        case "quotient":{
            correct=base+"^"+m;
            alternate=correct;
            display=correct;
            mathExpression="Simplify: \\( \\frac{" + base + "^{" + (m+n) + "}}{" + base + "^{" + n + "}} \\)";
            // `1` and `base^(m-1)` are the same value whenever m is 1, so the
            // set kept both and collapsed to three. Only the one a learner
            // actually writes is offered, and the off-by-one on the numerator
            // backs it up.
            choices=fourOptions(correct, [`${base}^${m+n}`, `1`, `${base}^${m+1}`, `${base}^${m+n+1}`, `${base}^${n+1}`]);
            break;
        }
        case "power":{
            correct=base+"^"+(m*n);
            alternate=correct;
            display=correct;
            mathExpression="Simplify: \\( (" + base + "^{" + m + "})^{" + n + "} \\)";
            // The mistake this branch exists to catch is distributing the outer
            // exponent to one factor, so the off-by-one on the product of the
            // exponents leads and the rest back it up.
            choices=fourOptions(correct, [`${base}^${m*n+1}`, `${base}^${m*n-1}`, `${base}^${m+n}`, `${base}^${m}`, `${base}^${n}`, `${base}^${m*n+n}`, `${base}^${m*n+m}`]);
            break;
        }
        case "negative":{
            correct=`\\frac{1}{${base}^{${m}}}`;
            alternate=`1/${base}^${m}`;
            display=correct;
            expectedFormat="Enter as 1/a^b";
            mathExpression="Write with a positive exponent: \\( " + base + "^{-" + m + "} \\)";
            // `base^-m` was offered here as a distractor, and it is the same
            // value as the answer: a learner who typed it would be marked
            // right, which makes the question have two answers. Every candidate
            // below is a different value from the key and from each other.
            choices=fourOptions(correct, [`${base}^${m}`, `\\frac{1}{${base}^{${m+1}}}`, `\\frac{1}{${base}^{${m-1}}}`, `\\frac{1}{${base}^{${2*m}}}`, `-1`]);
            break;
        }
        case "zero":{
            correct="1";
            alternate="1";
            display="1";
            expectedFormat="Enter 1";
            mathExpression="Evaluate: \\( " + base + "^{0} \\)";
            // "undefined" is a real answer for a zero base, and a learner
            // reaches for it here, but the base is drawn from 2 upward so this
            // branch never asks the question that would make it correct.
            choices=fourOptions(correct, ["0","-1","undefined",`${base}^1`]);
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
