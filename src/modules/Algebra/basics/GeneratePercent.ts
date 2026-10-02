import type{RngFn, QuestionDto}from"../../../types/global";
import{getMaxForDifficulty}from"../AlgebraUtils.js";
import{fmt}from"../../shared/Numeric";
import{fourOptions}from"../../shared/Options.js";
/**
 * Generates a percentage question: percent of a number, an increase, a decrease,
 * simple interest, or a markup.
 * @fileoverview Percentage calculations. Every question is generated so that the
 * arithmetic is exact: the percentages divide the quantities they are applied to,
 * so no answer ever requires an unstated rounding instruction. Prompts state the
 * result to the precision the answer is given at, or ask the learner to round.
 * The wrong answers are the mistakes each form invites, and the option filter
 * drops any of them that happens to equal the key: on a one-year loan the
 * interest for a single year is the key, so that candidate is not offered twice.
 * @date 2026-04-18
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
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
            // Taking the percent off instead of off the base, and moving the
            // decimal one place, are the two slips this form is testing.
            choices=[
                fmt(whole-percent, 2),
                fmt(whole+percent, 2),
                fmt(part+percent/100, 2),
                fmt(part-percent/100, 2)
            ];
            break;
        }
        case "increase":{
            let newVal=whole*(100+percent)/100;
            correct=fmt(newVal, 2);
            alternate=correct;
            display=correct;
            mathExpression=`If \\( ${whole} \\) increases by \\( ${percent}\\% \\), what is the new value?`;
            // Adding the percent as if it were a whole number, and leaving the
            // number unchanged, are the two slips this form is testing.
            choices=[
                fmt(whole+percent, 2),
                fmt(whole, 2),
                fmt(whole-percent, 2),
                fmt(whole*2, 2)
            ];
            break;
        }
        case "decrease":{
            let newVal=whole*(100-percent)/100;
            correct=fmt(newVal, 2);
            alternate=correct;
            display=correct;
            mathExpression=`If \\( ${whole} \\) decreases by \\( ${percent}\\% \\), what is the new value?`;
            choices=[
                fmt(whole-percent, 2),
                fmt(whole+percent, 2),
                fmt(whole, 2),
                fmt(whole*2, 2)
            ];
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
            // Reporting the amount repaid rather than the interest, and forgetting
            // to divide by a hundred, are the two slips this form is testing. The
            // interest for a single year is the key, so that candidate is dropped.
            choices=[
                fmt(interest+principal, 2),
                fmt(principal*rate*years, 2),
                fmt(principal*rate/100, 2),
                fmt(principal*years, 2)
            ];
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
            // The markup on its own, and the discounted price, are the two slips
            // this form is testing.
            choices=[
                fmt(cost+markup, 2),
                fmt(price-cost, 2),
                fmt(cost*(100-markup)/100, 2),
                fmt(cost*2, 2)
            ];
            break;
        }
    }
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: fourOptions(correct, choices),
        expectedFormat: expectedFormat
    };
}
