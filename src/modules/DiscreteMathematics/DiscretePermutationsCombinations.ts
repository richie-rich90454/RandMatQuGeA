/**
 * Discrete mathematics: permutations and combinations generator
 * @fileoverview Provides functions to generate permutation and combination questions with MCQ distractors.
 * Each question returns a QuestionDto with:
 * - latex: question text (may contain LaTeX delimiters \(...\))
 * - correct: plain text answer
 * - alternate: plain text answer for tolerant checking
 * - display: LaTeX string for display (pure LaTeX, no outer delimiters)
 * - choices: array of plausible wrong answers for MCQ mode
 * - expectedFormat: hint string for the user
 * @date 2026-03-29
 */
import type {RngFn, QuestionDto} from "../../types/global";
import {factorial, nPr, nCr, getMaxN} from "./DiscreteUtils.js";
import {fourOptions} from "../shared/Options.js";
/**
 * Generates a random permutation question with MCQ distractors.
 * @param difficulty - optional difficulty level
 * @param rng - optional random number generator (defaults to Math.random)
 * @returns QuestionDto
 */
export function generatePermutation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["basic","equation","word","circular","identical","withReplacement"];
    let type=types[Math.floor(rng()*types.length)];
    let maxN=getMaxN(difficulty);
    let n=Math.floor(rng()*maxN)+5;
    // Two or more items are chosen. Choosing one makes P(n,1), C(n,1) and n^1 all
    // equal to n, so every candidate this branch offers collapses onto the answer
    // and the question ships with two options.
    let r=Math.floor(rng()*(n-2))+2;
    let correctAns: string="";
    let choices: string[]=[];
    let mathExpression="";
    switch (type){
        case "basic":
            correctAns=nPr(n, r).toString();
            mathExpression=`\\( P(${n}, ${r}) \\)`;
            choices=[
                correctAns,
                nCr(n, r).toString(),
                Math.pow(n, r).toString(),
                factorial(n).toString(),
                (n*r).toString()
            ];
            break;
        case "equation":{
            let val=nPr(n, r);
            correctAns=n.toString();
            mathExpression=`Find \\( n \\) if \\( P(n, ${r})=${val} \\)`;
            // A candidate that guesses the order of the two factors, and one that
            // drops the constraint altogether, are the answers a learner reaches by
            // taking the root the other way round. The two roots used to be offered
            // and collide for small r, which is what left three options.
            choices=[
                correctAns,
                (r+1).toString(),
                Math.floor(Math.pow(val, 1/r)).toString(),
                r.toString(),
                (r-1).toString(),
                Math.floor(Math.sqrt(val)).toString()
            ];
            break;
        }
        case "word":{
            let objs=["books","cars","students","colors"];
            let obj=objs[Math.floor(rng()*objs.length)];
            correctAns=nPr(n, r).toString();
            mathExpression=`In how many ways can you arrange \\( ${r} \\) ${obj} chosen from \\( ${n} \\)?`;
            choices=[
                correctAns,
                nCr(n, r).toString(),
                factorial(n).toString(),
                Math.pow(n, r).toString(),
                (n*r).toString()
            ];
            break;
        }
        case "circular":
            correctAns=factorial(n-1).toString();
            mathExpression=`How many circular arrangements of \\( ${n} \\) distinct objects?`;
            choices=[
                correctAns,
                factorial(n).toString(),
                (factorial(n-1)/2).toString(),
                (n-1).toString(),
                n.toString()
            ];
            break;
        case "identical":{
            // Two or more identical items, for the same reason as r above: with one
            // identical item every arrangement is distinct and the three candidate
            // formulas all reduce to n!.
            let k=Math.floor(rng()*(n-2))+2;
            correctAns=(factorial(n)/factorial(k)).toString();
            mathExpression=`Permutations of \\( ${n} \\) items when \\( ${k} \\) are identical`;
            choices=[correctAns, factorial(n).toString(), (factorial(n)/factorial(n-k)).toString(), (factorial(n)/factorial(k)/factorial(n-k)).toString(), n.toString()];
            break;
        }
        case "withReplacement":{
            // The count of ordered selections with repetition is n to the power r,
            // and past the eighth power that is past nine digits: it cannot be typed
            // into an answer box and it is past the largest whole number a double
            // holds exactly, so the printed count would be wrong in its last digits.
            let draws=Math.min(r, 8);
            correctAns=Math.pow(n, draws).toString();
            mathExpression=`How many ordered selections of \\( ${draws} \\) items from \\( ${n} \\) types if repetition is allowed?`;
            choices=[
                correctAns,
                nPr(n, draws).toString(),
                nCr(n, draws).toString(),
                factorial(n).toString(),
                (n*draws).toString()
            ];
            break;
        }
    }
    let uniqueChoices=fourOptions(correctAns, choices);
    return {
        latex: mathExpression,
        correct: correctAns,
        alternate: correctAns,
        display: correctAns,
        choices: uniqueChoices,
        expectedFormat: "Enter a number"
    };
}
/**
 * Generates a random combination question with MCQ distractors.
 * @param difficulty - optional difficulty level
 * @param rng - optional random number generator (defaults to Math.random)
 * @returns QuestionDto
 */
export function generateCombination(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["basic","equation","word","complement","paths","multiset"];
    let type=types[Math.floor(rng()*types.length)];
    let maxN=getMaxN(difficulty);
    let n=Math.floor(rng()*maxN)+5;
    let r=Math.floor(rng()*(n-2))+2;
    let correctAns: string="";
    let choices: string[]=[];
    let mathExpression="";
    switch (type){
        case "basic":
            correctAns=nCr(n, r).toString();
            mathExpression=`\\( C(${n}, ${r}) \\)`;
            choices=[
                correctAns,
                nPr(n, r).toString(),
                Math.pow(n, r).toString(),
                factorial(n).toString(),
                (n*r).toString()
            ];
            break;
        case "equation":{
            let val=nCr(n, r);
            correctAns=n.toString();
            mathExpression=`Find \\( n \\) if \\( C(n, ${r})=${val} \\)`;
            // Same reasoning as the permutation branch: the two roots of the value
            // collide for small r, so the pool offers the order of the factors and
            // a doubled factor instead of a second root.
            choices=[
                correctAns,
                (r+1).toString(),
                Math.floor(Math.pow(val, 1/r)).toString(),
                r.toString(),
                (r-1).toString(),
                (2*r).toString()
            ];
            break;
        }
        case "word":{
            let items=["fruits","committee members","pizzas"];
            let item=items[Math.floor(rng()*items.length)];
            correctAns=nCr(n, r).toString();
            mathExpression=`How many ways to choose \\( ${r} \\) ${item} from \\( ${n} \\)?`;
            choices=[
                correctAns,
                nPr(n, r).toString(),
                Math.pow(n, r).toString(),
                factorial(n).toString(),
                (n*r).toString()
            ];
            break;
        }
        case "complement":
            correctAns=nCr(n, r).toString();
            mathExpression=`Show that \\( C(${n}, ${n-r})=C(${n}, ${r}) \\). What is its value?`;
            choices=[
                correctAns,
                nCr(n, n-r+1).toString(),
                (nCr(n, r)+1).toString(),
                (nCr(n, r)-1).toString(),
                factorial(n).toString()
            ];
            break;
        case "paths":{
            let g=Math.floor(rng()*4)+3;
            correctAns=nCr(2*g, g).toString();
            mathExpression=`Number of shortest paths in a \\( ${g} \\times ${g} \\) grid (right & up moves)?`;
            choices=[
                correctAns,
                Math.pow(2, g).toString(),
                Math.pow(g, 2).toString(),
                nCr(2*g, g-1).toString(),
                factorial(2*g).toString()
            ];
            break;
        }
        case "multiset":
            correctAns=nCr(n+r-1, r).toString();
            mathExpression=`Ways to choose \\( ${r} \\) items from \\( ${n} \\) types if repeats allowed?`;
            // The factorial of the combined total is not offered: above twenty it
            // leaves the range a double can hold exactly and prints in exponential
            // notation, which is not a spelling of any number a learner writes. The
            // ordered count is offered instead, capped for the same reason the
            // with-replacement branch caps its own.
            choices=[
                correctAns,
                nCr(n+r-1, n-1).toString(),
                nCr(n+r, r).toString(),
                Math.pow(n, Math.min(r, 8)).toString(),
                factorial(n).toString()
            ];
            break;
    }
    let uniqueChoices=fourOptions(correctAns, choices);
    return {
        latex: mathExpression,
        correct: correctAns,
        alternate: correctAns,
        display: correctAns,
        choices: uniqueChoices,
        expectedFormat: "Enter a number"
    };
}
