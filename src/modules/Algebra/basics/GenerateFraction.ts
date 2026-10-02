import type{RngFn, QuestionDto}from"../../../types/global";
import{gcd, getMaxForDifficulty}from"../AlgebraUtils.js";
import{fourOptions}from"../../shared/Options.js";

/**
 * Builds the wrong answers a learner can actually write for a reduced fraction
 * `p/q`. Every entry is a perturbation of the answer itself, so each is a
 * fraction in the same shape and a learner who has made one of these slips
 * would write it. Six of them are always distinct in value, which is what lets
 * the caller's option filter take the first three without ever topping the set
 * up with something a learner would not write.
 *
 * @param p - The reduced numerator.
 * @param q - The reduced denominator, which must be positive.
 * @returns Six candidate wrong fractions, nearest mistake first.
 */
function fractionLadder(p: number, q: number): string[]{
    let out=[`${p+1}/${q}`, `${p-1}/${q}`, `${p}/${q+1}`];
    // A denominator of zero is not a fraction, so that rung is only offered when
    // the answer's own denominator leaves room for it.
    if (q>1) out.push(`${p}/${q-1}`);
    out.push(`${p+1}/${q+1}`);
    out.push(`${p-1}/${q+1}`);
    return out;
}

/**
 * Finds the smallest divisor of a common factor greater than one, which is the
 * factor a learner cancels by before stopping one step short of the answer. The
 * search is bounded by the common factor itself, so it cannot spin.
 *
 * @param g - The greatest common divisor, which must be greater than one.
 * @returns The smallest divisor of `g` greater than one.
 */
function smallestFactor(g: number): number{
    let factor=2;
    let attempts=0;
    while(g%factor!==0&&attempts<g){
        factor++;
        attempts++;
    }
    return factor;
}

/**
 * Generates a fraction arithmetic question (add, subtract, multiply, divide, simplify, or convert decimal to fraction) with MCQ distractors.
 * @fileoverview Fraction operations. Every answer is reduced, and the wrong
 * answers are the mistakes the drawn fractions invite: adding the numerators to
 * the denominators, cancelling only part of the common factor, or reading the
 * decimal with the wrong number of places. The unreduced form of the answer is
 * never offered, because it is the same value written differently and would give
 * the question two correct options.
 * @date 2026-04-18
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns QuestionDto
 */
export function generateFraction(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["add","subtract","multiply","divide","simplify","convert"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,12);
    let expectedFormat="Enter a fraction in simplest form like 3/4";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let num1=Math.floor(rng()*maxVal)+1;
    let den1=Math.floor(rng()*(maxVal-1))+2;
    let num2=Math.floor(rng()*maxVal)+1;
    let den2=Math.floor(rng()*(maxVal-1))+2;
    switch(type){
        case "add":{
            let commonDen=den1*den2;
            let newNum1=num1*den2;
            let newNum2=num2*den1;
            let sumNum=newNum1+newNum2;
            let g=gcd(sumNum,commonDen);
            let simplifiedNum=sumNum/g;
            let simplifiedDen=commonDen/g;
            let plain=`${simplifiedNum}/${simplifiedDen}`;
            let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
            correct=plain;
            alternate=`${sumNum}/${commonDen}`;
            display=latex;
            mathExpression=`Add: \\( \\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}} \\)`;
            choices=[
                `${num1+num2}/${den1+den2}`,
                `${newNum1-newNum2}/${commonDen}`
            ];
            choices=choices.concat(fractionLadder(simplifiedNum, simplifiedDen));
            break;
        }
        case "subtract":{
            let commonDen=den1*den2;
            let newNum1=num1*den2;
            let newNum2=num2*den1;
            let diffNum=newNum1-newNum2;
            let g=gcd(diffNum,commonDen);
            let simplifiedNum=diffNum/g;
            let simplifiedDen=commonDen/g;
            let plain=`${simplifiedNum}/${simplifiedDen}`;
            let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
            correct=plain;
            alternate=`${diffNum}/${commonDen}`;
            display=latex;
            mathExpression=`Subtract: \\( \\frac{${num1}}{${den1}} - \\frac{${num2}}{${den2}} \\)`;
            choices=[
                `${num1+num2}/${den1+den2}`,
                `${newNum1+newNum2}/${commonDen}`
            ];
            choices=choices.concat(fractionLadder(simplifiedNum, simplifiedDen));
            break;
        }
        case "multiply":{
            let prodNum=num1*num2;
            let prodDen=den1*den2;
            let g=gcd(prodNum,prodDen);
            let simplifiedNum=prodNum/g;
            let simplifiedDen=prodDen/g;
            let plain=`${simplifiedNum}/${simplifiedDen}`;
            let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
            correct=plain;
            alternate=`${prodNum}/${prodDen}`;
            display=latex;
            mathExpression=`Multiply: \\( \\frac{${num1}}{${den1}} \\times \\frac{${num2}}{${den2}} \\)`;
            choices=[
                `${prodNum}/${den1+den2}`,
                `${num1+num2}/${prodDen}`
            ];
            choices=choices.concat(fractionLadder(simplifiedNum, simplifiedDen));
            break;
        }
        case "divide":{
            let quotNum=num1*den2;
            let quotDen=den1*num2;
            let g=gcd(quotNum,quotDen);
            let simplifiedNum=quotNum/g;
            let simplifiedDen=quotDen/g;
            let plain=`${simplifiedNum}/${simplifiedDen}`;
            let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
            correct=plain;
            alternate=`${quotNum}/${quotDen}`;
            display=latex;
            mathExpression=`Divide: \\( \\frac{${num1}}{${den1}} \\div \\frac{${num2}}{${den2}} \\)`;
            // Inverting the divisor instead of taking its reciprocal is the slip
            // this form is testing; adding the two fractions is the other.
            choices=[
                `${num1*den1}/${num2*den2}`,
                `${num1*den2+num2*den1}/${den1*den2}`
            ];
            choices=choices.concat(fractionLadder(simplifiedNum, simplifiedDen));
            break;
        }
        case "simplify":{
            let num=Math.floor(rng()*30)+2;
            let den=Math.floor(rng()*30)+2;
            let g=gcd(num,den);
            let simplifiedNum=num/g;
            let simplifiedDen=den/g;
            let plain=`${simplifiedNum}/${simplifiedDen}`;
            let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
            correct=plain;
            alternate=plain;
            display=latex;
            mathExpression=`Simplify: \\( \\frac{${num}}{${den}} \\)`;
            // Cancelling by only the smallest common factor, or by that factor on
            // one side alone, is what a learner writes when they stop one step
            // early. With no common factor there is nothing to stop early on, and
            // the ladder carries the set.
            if (g>1){
                let f=smallestFactor(g);
                choices=[
                    `${num/f}/${den/f}`,
                    `${num/f}/${den}`,
                    `${num}/${den/f}`
                ];
            }
            else{
                choices=[];
            }
            choices=choices.concat(fractionLadder(simplifiedNum, simplifiedDen));
            break;
        }
        case "convert":{
            // Drawn above zero so the question is never "convert 0.00", which has
            // no fraction to find.
            let decimal=(0.1+rng()*9.9).toFixed(2);
            let num=Math.round(parseFloat(decimal)*100);
            let den=100;
            let g=gcd(num,den);
            let simplifiedNum=num/g;
            let simplifiedDen=den/g;
            let plain=`${simplifiedNum}/${simplifiedDen}`;
            let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
            correct=plain;
            alternate=plain;
            display=latex;
            mathExpression=`Convert \\( ${decimal} \\) to a fraction in simplest form.`;
            // Reading the last digit wrong, and reading the number of decimal
            // places wrong, are the two slips this form is testing.
            choices=[
                `${num+1}/${den}`,
                `${num*10}/${den}`,
                `${num}/${den*10}`
            ];
            choices=choices.concat(fractionLadder(simplifiedNum, simplifiedDen));
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
