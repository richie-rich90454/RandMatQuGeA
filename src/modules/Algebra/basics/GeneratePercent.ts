import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fmt} from "../../shared/Numeric";
/**
 * Generates a percentage question: percent of a number, an increase, a decrease,
 * simple interest, or a markup.
 * @fileoverview Percentage calculations. Every question is generated so that the
 * arithmetic is exact: the percentages divide the quantities they are applied to,
 * so no answer ever requires an unstated rounding instruction. Prompts state the
 * result to the precision the answer is given at, or ask the learner to round.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generatePercent(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["percent_of","increase","decrease","interest","markup"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,100);
    let expectedFormat="Enter a number";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let percent=Math.floor(rng()*9)*10+10;
    // Choosing a whole that the percentage divides exactly keeps every answer
    // exact, so no question needs "round to the nearest whole number" in it.
    let whole=percent;
    let multiplier=Math.floor(rng()*Math.max(1, Math.floor(maxVal/percent)))+1;
    whole=percent*multiplier;
    switch(type){
        case "percent_of":{
            let part=whole*percent/100;
            correct=fmt(part, 2);
            alternate=correct;
            display=correct;
            mathExpression=`What is \\( ${percent}\\% \\) of \\( ${whole} \\)?`;
            let numRes=Number(correct);
            choices=[correct];
            choices.push(fmt(numRes+percent/100, 2));
            choices.push(fmt(numRes-percent/100, 2));
            choices.push(fmt(whole-percent, 2));
            choices.push(fmt(whole, 2));
            break;
        }
        case "increase":{
            let newVal=whole*(100+percent)/100;
            correct=fmt(newVal, 2);
            alternate=correct;
            display=correct;
            mathExpression=`If \\( ${whole} \\) increases by \\( ${percent}\\% \\), what is the new value?`;
            let numRes=Number(correct);
            choices=[correct];
            choices.push(fmt(numRes+whole, 2));
            choices.push(fmt(numRes-whole, 2));
            choices.push(fmt(whole+percent, 2));
            choices.push(fmt(whole, 2));
            break;
        }
        case "decrease":{
            let newVal=whole*(100-percent)/100;
            correct=fmt(newVal, 2);
            alternate=correct;
            display=correct;
            mathExpression=`If \\( ${whole} \\) decreases by \\( ${percent}\\% \\), what is the new value?`;
            let numRes=Number(correct);
            choices=[correct];
            choices.push(fmt(numRes+whole, 2));
            choices.push(fmt(numRes-whole, 2));
            choices.push(fmt(whole-percent, 2));
            choices.push(fmt(whole, 2));
            break;
        }
        case "interest":{
            let principal=percent*multiplier*10;
            let rate=Math.floor(rng()*9)+1;
            let years=Math.floor(rng()*4)+1;
            let interest=principal*rate*years/100;
            correct=fmt(interest, 2);
            alternate=correct;
            display=correct;
            mathExpression=`Find the simple interest on a principal of ${principal} dollars at ${rate}% per year for ${years} years.`;
            let numRes=Number(correct);
            choices=[correct];
            choices.push(fmt(numRes+principal, 2));
            choices.push(fmt(numRes-principal, 2));
            choices.push(fmt(principal*rate/100, 2));
            choices.push(fmt(principal*years, 2));
            break;
        }
        case "markup":{
            let markup=Math.floor(rng()*4)*10+10;
            let cost=percent*multiplier*10;
            let price=cost*(100+markup)/100;
            correct=fmt(price, 2);
            alternate=correct;
            display=correct;
            mathExpression=`A store buys an item for ${cost} dollars and marks it up by ${markup}%. What is the selling price?`;
            let numRes=Number(correct);
            choices=[correct];
            choices.push(fmt(cost+markup, 2));
            choices.push(fmt(numRes-cost, 2));
            choices.push(fmt(cost*(100-markup)/100, 2));
            choices.push(fmt(cost*2, 2));
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
