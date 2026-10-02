import type{RngFn, QuestionDto}from"../../../types/global";
import{gcd, getMaxForDifficulty}from"../AlgebraUtils.js";
import{fmt, fmtTrim, roundTo}from"../../shared/Numeric";
import{fourOptions}from"../../shared/Options.js";

/**
 * Generates a ratio/proportion question (simplify ratio, solve proportion, map scale, or unit rate) with MCQ distractors.
 * @fileoverview Ratios, proportions, scales, unit rates. The unreduced ratio is
 * offered as a wrong answer, because "lowest terms" is what the question asks
 * for; when the drawn ratio is already in lowest terms the unreduced form is the
 * key and the option filter drops it. The unit rate is rounded once, where it is
 * drawn, and every distractor is built from that one rounded value.
 * @date 2026-04-18
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns QuestionDto
 */
export function generateRatioProportion(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["ratio","proportion","scale","unit_rate"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,20);
    let expectedFormat="Enter a number or ratio like 2:3";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "ratio":{
            let a=Math.floor(rng()*maxVal)+1;
            let b=Math.floor(rng()*maxVal)+1;
            let g=gcd(a,b);
            let p=a/g;
            let q=b/g;
            let plain=`${p}:${q}`;
            correct=plain;
            alternate=`${p}/${q}`;
            display=plain;
            mathExpression=`Simplify the ratio \\( ${a}:${b} \\) to lowest terms.`;
            // The unreduced ratio is the mistake this form is testing, so it is
            // offered rather than left out. When a and b are coprime it is the
            // key, and the option filter drops it as the same value written the
            // same way.
            choices=[
                `${a}:${b}`,
                `${p+1}:${q}`,
                `${p}:${q+1}`,
                `${p-1}:${q}`,
                `${p+1}:${q+1}`
            ];
            // A ratio with a zero term is not a ratio, so that rung is only
            // offered when the answer's own second term leaves room for it.
            if (q>1) choices.push(`${p}:${q-1}`);
            break;
        }
        case "proportion":{
            // Cross-multiplying a/b = c/x gives x = c*b/a, not c*a/b. The old
            // formula was inverted, and Math.round then made the printed
            // proportion itself false whenever c*a/b was not whole.
            let a=Math.floor(rng()*5)+2;
            let b=Math.floor(rng()*5)+2;
            let c=a*Math.floor(rng()*6)+1;
            let x=c*b/a;
            correct=String(x);
            alternate=correct;
            display=correct;
            mathExpression=`Solve for x: \\( \\frac{${a}}{${b}}=\\frac{${c}}{x} \\)`;
            // c*a/b is the inverted cross-product, which is the mistake the
            // corrected formula is guarding against.
            choices=[`${x}`, fmtTrim(c*a/b), `${x+1}`, `${x-1}`, `${x+2}`];
            break;
        }
        case "scale":{
            // The drawn map distance must be the actual distance divided by the
            // scale factor exactly, or the question contradicts itself.
            let map=Math.floor(rng()*10)+1;
            let scaled=Math.floor(rng()*40)+2;
            let actual=scaled*map;
            correct=String(actual);
            alternate=correct;
            display=correct;
            mathExpression=`On a map with scale 1:${map}, a distance measures ${scaled} cm. What is the actual distance in cm?`;
            // Reporting the map distance unchanged, and applying the scale factor
            // twice, are the two slips this form is testing. A scale of one makes
            // both of them the key, so the off-by-one and the doubled distance
            // carry the set there.
            choices=[
                `${actual}`,
                `${scaled}`,
                `${scaled*map*map}`,
                `${actual+1}`,
                `${actual-1}`,
                `${scaled*2}`
            ];
            break;
        }
        case "unit_rate":{
            let quantity=Math.floor(rng()*100)+20;
            let units=Math.floor(rng()*10)+2;
            // Rounded once, where the rate is drawn, so the key and every
            // distractor are built from the number the learner is asked for
            // rather than from the quotient behind it.
            let rate=roundTo(quantity/units, 2);
            let ans=fmt(rate, 2);
            correct=ans;
            alternate=fmtTrim(rate);
            display=ans;
            mathExpression=`If ${quantity} items cost ${units} dollars, what is the unit price? (nearest cent)`;
            // Dividing the cost by the quantity instead of the other way round is
            // the mistake this form is testing.
            choices=[
                ans,
                fmt(units/quantity, 2),
                fmt(rate+0.01, 2),
                fmt(rate-0.01, 2),
                fmt(rate*2, 2)
            ];
            break;
        }
    }
    return {
        latex: mathExpression,
        correct,
        alternate,
        display,
        choices: fourOptions(correct, choices),
        expectedFormat
    };
}
