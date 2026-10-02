/**
 * Polynomial operations: addition, subtraction, multiplication, division, factoring.
 * Function concepts: domain, range, notation, evaluation.
 * Graphing: linear (slope, intercepts, equation from points, parallel/perpendicular), nonlinear (parabola vertex, absolute value, sqrt, transformations).
 * @fileoverview Generates algebra questions with MCQ distractors.
 * @date 2026-04-18
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{getMaxForDifficulty}from"./AlgebraUtils.js";
import{fmt, roundTo}from"../shared/Numeric";
import{fourOptions}from"../shared/Options.js";

/**
 * Quadratic polynomial addition, subtraction and multiplication.
 *
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
export function generatePolynomial(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["add","subtract","multiply"];
    let type=types[Math.floor(rng()*types.length)];
    let maxCoeff=getMaxForDifficulty(difficulty,5);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxCoeff)+1;
    let b=Math.floor(rng()*maxCoeff)+1;
    let c=Math.floor(rng()*maxCoeff)+1;
    let d=Math.floor(rng()*maxCoeff)+1;
    switch(type){
        case "add":{
            let p1=`${a}x^2 + ${b}x + ${c}`;
            let p2=`${d}x^2 + ${a}x + ${b}`;
            let sumA=a+d;
            let sumB=b+a;
            let sumC=c+b;
            let result=`${sumA}x^2 + ${sumB}x + ${sumC}`;
            correct=result;
            alternate=result.replace(/\s+/g,"");
            display=result;
            mathExpression=`Add: \\( (${p1}) + (${p2}) \\)`;
            choices=[correct];
            choices.push(`${sumA}x^2 + ${sumB+1}x + ${sumC}`);
            choices.push(`${sumA}x^2 + ${sumB}x + ${sumC+1}`);
            choices.push(`${sumA+1}x^2 + ${sumB}x + ${sumC}`);
            choices.push(`${sumA}x^2 + ${sumB-1}x + ${sumC}`);
            expectedFormat="Enter polynomial";
            break;
        }
        case "subtract":{
            let p1=`${a}x^2 + ${b}x + ${c}`;
            let p2=`${d}x^2 + ${a}x + ${b}`;
            let diffA=a-d;
            let diffB=b-a;
            let diffC=c-b;
            let result=`${diffA}x^2 + ${diffB}x + ${diffC}`;
            correct=result;
            alternate=result.replace(/\s+/g,"");
            display=result;
            mathExpression=`Subtract: \\( (${p1}) - (${p2}) \\)`;
            choices=[correct];
            choices.push(`${diffA}x^2 + ${diffB+1}x + ${diffC}`);
            choices.push(`${diffA}x^2 + ${diffB}x + ${diffC+1}`);
            choices.push(`${diffA+1}x^2 + ${diffB}x + ${diffC}`);
            choices.push(`${diffA}x^2 + ${diffB-1}x + ${diffC}`);
            expectedFormat="Enter polynomial";
            break;
        }
        case "multiply":{
            let p1=`${a}x + ${b}`;
            let p2=`${c}x + ${d}`;
            let term1=a*c;
            let term2=a*d + b*c;
            let term3=b*d;
            let result=`${term1}x^2 + ${term2}x + ${term3}`;
            correct=result;
            alternate=result.replace(/\s+/g,"");
            display=result;
            mathExpression=`Multiply: \\( (${p1})(${p2}) \\)`;
            choices=[correct];
            choices.push(`${term1}x^2 + ${term2+1}x + ${term3}`);
            choices.push(`${term1}x^2 + ${term2}x + ${term3+1}`);
            choices.push(`${term1+1}x^2 + ${term2}x + ${term3}`);
            choices.push(`${term1}x^2 + ${term2-1}x + ${term3}`);
            expectedFormat="Enter polynomial";
            break;
        }
        default:
            return {latex: mathExpression, correct, alternate, display, choices, expectedFormat};
    }
    let optionSet=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: optionSet,
        expectedFormat: expectedFormat
    };
}
/**
 * Division of a quadratic by a monomial, with and without a remainder.
 *
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
export function generatePolynomialDivision(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["simple","with_remainder"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,5);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxVal)+1;
    let b=Math.floor(rng()*maxVal)+1;
    switch(type){
        case "simple":{
            let dividend=`${a}x^2 + ${b}x`;
            let divisor=`x`;
            let quotient=`${a}x + ${b}`;
            correct=quotient;
            alternate=quotient.replace(/\s+/g,"");
            display=quotient;
            mathExpression=`Divide: \\( \\frac{${dividend}}{${divisor}} \\)`;
            choices=[correct];
            choices.push(`${a}x + ${b+1}`);
            choices.push(`${a}x + ${b-1}`);
            choices.push(`${a+1}x + ${b}`);
            choices.push(`${a-1}x + ${b}`);
            expectedFormat="Enter polynomial";
            break;
        }
        case "with_remainder":{
            let dividend=`${a}x^2 + ${b}x + ${a}`;
            let divisor=`x + 1`;
            let quotientCoef=a;
            let quotientConst=b - a;
            let remainder=2*a - b;
            let quotientStr=`${quotientCoef}x + ${quotientConst}`;
            let answer;
            if(remainder===0){
                answer=quotientStr;
            }
            else{
                answer=`${quotientStr} + \\frac{${remainder}}{${divisor}}`;
            }
            correct=answer;
            alternate=answer.replace(/\s+/g,"").replace(/\\\\frac/g,"frac");
            display=answer;
            mathExpression=`Divide: \\( \\frac{${dividend}}{${divisor}} \\)`;
            choices=[correct];
            choices.push(`${quotientCoef}x + ${quotientConst+1} + \\frac{${remainder}}{${divisor}}`);
            choices.push(`${quotientCoef}x + ${quotientConst-1} + \\frac{${remainder}}{${divisor}}`);
            choices.push(`${quotientCoef+1}x + ${quotientConst} + \\frac{${remainder}}{${divisor}}`);
            choices.push(`${quotientCoef}x + ${quotientConst} + \\frac{${remainder+1}}{${divisor}}`);
            expectedFormat="Enter expression";
            break;
        }
        default:
            return {latex: mathExpression, correct, alternate, display, choices, expectedFormat};
    }
    let optionSet=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: optionSet,
        expectedFormat: expectedFormat
    };
}
/**
 * Factoring by greatest common factor, trinomial, difference of squares, and
 * the sum and difference of cubes.
 *
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
export function generateFactoring(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["gcf","trinomial","difference_squares","sum_cubes","difference_cubes"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,10);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxVal)+1;
    let b=Math.floor(rng()*maxVal)+1;
    let c=Math.floor(rng()*maxVal)+1;
    switch(type){
        case "gcf":{
            let expr=`${a*b}x + ${a*c}`;
            let ans=`${a}(${b}x + ${c})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Factor: \\( ${expr} \\)`;
            choices=[correct];
            choices.push(`${a+1}(${b}x + ${c})`);
            choices.push(`${a-1}(${b}x + ${c})`);
            choices.push(`${a}(${b+1}x + ${c})`);
            choices.push(`${a}(${b}x + ${c+1})`);
            expectedFormat="Enter factored form";
            break;
        }
        case "trinomial":{
            let p=a*c;
            let q=a+c;
            let ans=`(x + ${a})(x + ${c})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Factor: \\( x^2 + ${q}x + ${p} \\)`;
            choices=[correct];
            choices.push(`(x + ${a+1})(x + ${c})`);
            choices.push(`(x + ${a})(x + ${c+1})`);
            choices.push(`(x + ${a-1})(x + ${c})`);
            choices.push(`(x + ${a})(x + ${c-1})`);
            expectedFormat="Enter factored form";
            break;
        }
        case "difference_squares":{
            let expr=`${a*a}x^2 - ${b*b}`;
            let ans=`(${a}x - ${b})(${a}x + ${b})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Factor: \\( ${expr} \\)`;
            choices=[correct];
            choices.push(`(${a+1}x - ${b})(${a+1}x + ${b})`);
            choices.push(`(${a}x - ${b+1})(${a}x + ${b+1})`);
            choices.push(`(${a-1}x - ${b})(${a-1}x + ${b})`);
            choices.push(`(${a}x - ${b-1})(${a}x + ${b-1})`);
            expectedFormat="Enter factored form";
            break;
        }
        case "sum_cubes":{
            let expr=`x^3 + ${a*a*a}`;
            let ans=`(x + ${a})(x^2 - ${a}x + ${a*a})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Factor: \\( ${expr} \\)`;
            choices=[correct];
            choices.push(`(x + ${a+1})(x^2 - ${a+1}x + ${(a+1)*(a+1)})`);
            choices.push(`(x + ${a-1})(x^2 - ${a-1}x + ${(a-1)*(a-1)})`);
            choices.push(`(x - ${a})(x^2 + ${a}x + ${a*a})`);
            choices.push(`(x + ${a})(x^2 + ${a}x + ${a*a})`);
            expectedFormat="Enter factored form";
            break;
        }
        case "difference_cubes":{
            let expr=`x^3 - ${a*a*a}`;
            let ans=`(x - ${a})(x^2 + ${a}x + ${a*a})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Factor: \\( ${expr} \\)`;
            choices=[correct];
            choices.push(`(x - ${a+1})(x^2 + ${a+1}x + ${(a+1)*(a+1)})`);
            choices.push(`(x - ${a-1})(x^2 + ${a-1}x + ${(a-1)*(a-1)})`);
            choices.push(`(x + ${a})(x^2 - ${a}x + ${a*a})`);
            choices.push(`(x - ${a})(x^2 - ${a}x + ${a*a})`);
            expectedFormat="Enter factored form";
            break;
        }
        default:
            return {latex: mathExpression, correct, alternate, display, choices, expectedFormat};
    }
    let optionSet=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: optionSet,
        expectedFormat: expectedFormat
    };
}
/**
 * Domain, range, function notation and evaluation of a linear function.
 *
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
export function generateFunctionConcepts(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["domain","range","notation","evaluate"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,10);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxVal)+1;
    let x=Math.floor(rng()*maxVal)+1;
    switch(type){
        case "domain":{
            mathExpression=`Find the domain of \\( f(x)=\\sqrt{x-${a}} \\). (Enter interval)`;
            correct=`[${a}, ∞)`;
            alternate=correct;
            display=correct;
            choices=[correct];
            choices.push(`(${a}, ∞)`);
            choices.push(`(-∞, ${a}]`);
            choices.push(`(-∞, ${a})`);
            choices.push(`[${a+1}, ∞)`);
            expectedFormat="Enter interval";
            break;
        }
        case "range":{
            mathExpression=`Find the range of \\( f(x)=x^2 + ${a} \\). (Enter interval)`;
            correct=`[${a}, ∞)`;
            alternate=correct;
            display=correct;
            choices=[correct];
            choices.push(`(${a}, ∞)`);
            choices.push(`(-∞, ${a}]`);
            choices.push(`(-∞, ${a})`);
            choices.push(`[${a+1}, ∞)`);
            expectedFormat="Enter interval";
            break;
        }
        case "notation":{
            mathExpression=`If \\( f(x)=${a}x + 3 \\), find \\( f(${x}) \\).`;
            let ans=(a*x+3).toString();
            correct=ans;
            alternate=ans;
            display=ans;
            let numAns=parseInt(correct);
            choices=[correct];
            choices.push((numAns+1).toString());
            choices.push((numAns-1).toString());
            choices.push((a*x).toString());
            choices.push((a*x+4).toString());
            expectedFormat="Enter a number";
            break;
        }
        case "evaluate":{
            mathExpression=`Given \\( f(x)=x^2 - ${a} \\), evaluate \\( f(${x}) \\).`;
            let ans=(x*x - a).toString();
            correct=ans;
            alternate=ans;
            display=ans;
            let numAns=parseInt(correct);
            choices=[correct];
            choices.push((numAns+1).toString());
            choices.push((numAns-1).toString());
            choices.push((x*x).toString());
            choices.push((x*x - a + 1).toString());
            expectedFormat="Enter a number";
            break;
        }
        default:
            return {latex: mathExpression, correct, alternate, display, choices, expectedFormat};
    }
    let optionSet=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: optionSet,
        expectedFormat: expectedFormat
    };
}
/**
 * Slope from two points, the intercepts of a line, the equation of a line
 * through two points, and the parallel and perpendicular slopes of a given one.
 *
 * A slope between two integer points is a rational number that is usually not
 * exact in two decimal places, so every branch that returns one says where to
 * round and derives the key and every distractor from the single rounded value.
 *
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
export function generateLinearGraphing(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["slope","intercepts","equation_from_points","parallel_perpendicular"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,10);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxVal)+1;
    let b=Math.floor(rng()*maxVal)+1;
    let x1=Math.floor(rng()*maxVal)+1;
    let y1=Math.floor(rng()*maxVal)+1;
    let x2=Math.floor(rng()*maxVal)+1;
    let y2=Math.floor(rng()*maxVal)+1;
    let attempts=0;
    while(x1===x2&&attempts<10){
        x2=Math.floor(rng()*maxVal)+1;
        attempts++;
    }
    if(x1===x2) x2=x1+1;
    switch(type){
        case "slope":{
            let slope=(y2-y1)/(x2-x1);
            let rounded=roundTo(slope, 2);
            let ans=fmt(rounded, 2);
            correct=ans;
            alternate=ans;
            display=ans;
            mathExpression=`Find the slope between (${x1},${y1}) and (${x2},${y2}). (Round to the nearest hundredth.)`;
            // The two classic slips are to report the rise or the run instead of
            // their quotient, and to invert the quotient. The reciprocal is only
            // offered when the slope is nonzero, because a horizontal line has
            // no reciprocal slope and Infinity is not an answer.
            choices=[fmt(rounded+0.1, 2), fmt(rounded-0.1, 2), `${y2-y1}`, `${x2-x1}`];
            if (rounded!==0) choices.push(fmt(roundTo(1/rounded, 2), 2));
            expectedFormat="Enter a decimal number";
            break;
        }
        case "intercepts":{
            let eq=`${a}x + ${b}y=${a*b}`;
            let xInt=b;
            let yInt=a;
            let ans=`(${xInt},0) and (0,${yInt})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Find the x- and y-intercepts of \\( ${eq} \\).`;
            // The swap is the slip this form is testing: dividing the equation by
            // the y coefficient first and reading the two intercepts the wrong
            // way round.
            choices=[
                `(${xInt+1},0) and (0,${yInt})`,
                `(${xInt},0) and (0,${yInt+1})`,
                `(${xInt-1},0) and (0,${yInt})`,
                `(${xInt},0) and (0,${yInt-1})`,
                `(${yInt},0) and (0,${xInt})`
            ];
            expectedFormat="Enter as (x,0) and (0,y)";
            break;
        }
        case "equation_from_points":{
            let slope=(y2-y1)/(x2-x1);
            // Each of the two numbers in the key comes from one rounding of the
            // exact value, and every distractor is rendered from those same two
            // rounded numbers. Writing the intercept into a distractor as a bare
            // number while the key printed it as "0.00" made the two the same
            // value, so the question had two correct options.
            let roundedSlope=roundTo(slope, 2);
            let roundedIntercept=roundTo(y1-slope*x1, 2);
            let ans=`y=${fmt(roundedSlope,2)}x + ${fmt(roundedIntercept,2)}`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Find the equation of the line through (${x1},${y1}) and (${x2},${y2}). (Round the slope and the intercept to the nearest hundredth.)`;
            choices=[
                `y=${fmt(roundedSlope+0.1,2)}x + ${fmt(roundedIntercept,2)}`,
                `y=${fmt(roundedSlope,2)}x + ${fmt(roundedIntercept+0.1,2)}`,
                `y=${fmt(roundedSlope-0.1,2)}x + ${fmt(roundedIntercept,2)}`,
                `y=${fmt(roundedSlope,2)}x + ${fmt(roundedIntercept-0.1,2)}`,
                `y=${fmt(-roundedSlope,2)}x + ${fmt(roundedIntercept,2)}`
            ];
            expectedFormat="Enter equation like y = mx + b";
            break;
        }
        case "parallel_perpendicular":{
            let slope=a;
            let perp=roundTo(-1/slope, 2);
            let ans=`parallel: ${slope}, perpendicular: ${fmt(perp,2)}`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            mathExpression=`Line L has slope ${slope}. What is the slope of a line parallel to L? Perpendicular? (Round the perpendicular slope to the nearest hundredth.)`;
            choices=[
                `parallel: ${slope+1}, perpendicular: ${fmt(perp,2)}`,
                `parallel: ${slope}, perpendicular: ${fmt(perp+0.1,2)}`,
                `parallel: ${slope-1}, perpendicular: ${fmt(perp,2)}`,
                `parallel: ${slope}, perpendicular: ${fmt(perp-0.1,2)}`,
                `parallel: ${slope}, perpendicular: ${fmt(roundTo(1/slope, 2),2)}`
            ];
            expectedFormat="Enter 'parallel: m, perpendicular: n'";
            break;
        }
        default:
            return {latex: mathExpression, correct, alternate, display, choices, expectedFormat};
    }
    let optionSet=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: optionSet,
        expectedFormat: expectedFormat
    };
}
/**
 * Vertex, absolute-value shift, square-root domain and a shifted parabola.
 *
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns The generated question.
 */
export function generateNonLinearGraphing(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["parabola_vertex","abs_value","sqrt","transform"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,5);
    let expectedFormat="";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    let a=Math.floor(rng()*maxVal)+1;
    let h=Math.floor(rng()*maxVal)-2;
    let k=Math.floor(rng()*maxVal)-2;
    switch(type){
        case "parabola_vertex":{
            mathExpression=`Find the vertex of \\( y=${a}(x - ${h})^2 + ${k} \\).`;
            let ans=`(${h}, ${k})`;
            correct=ans;
            alternate=ans.replace(/\s+/g,"");
            display=ans;
            choices=[correct];
            choices.push(`(${h+1}, ${k})`);
            choices.push(`(${h}, ${k+1})`);
            choices.push(`(${h-1}, ${k})`);
            choices.push(`(${h}, ${k-1})`);
            expectedFormat="Enter as (h,k)";
            break;
        }
        case "abs_value":{
            let rightShift=h>0?`right ${h}`:`left ${-h}`;
            let upShift=k>0?`up ${k}`:`down ${-k}`;
            let ans=`${rightShift}, ${upShift}`;
            correct=ans;
            alternate=ans;
            display=ans;
            mathExpression=`Describe the transformation of \\( y=|x| \\) to \\( y=|x - ${h}| + ${k} \\).`;
            let wrongShift1=h>0?`left ${h}`:`right ${-h}`;
            let wrongShift2=k>0?`down ${k}`:`up ${-k}`;
            choices=[correct];
            choices.push(`${wrongShift1}, ${upShift}`);
            choices.push(`${rightShift}, ${wrongShift2}`);
            choices.push(`${wrongShift1}, ${wrongShift2}`);
            choices.push(`no shift`);
            expectedFormat="Enter description like 'right 3, up 2'";
            break;
        }
        case "sqrt":{
            mathExpression=`Find the domain of \\( y=\\sqrt{x - ${a}} \\).`;
            let ans=`x ≥ ${a}`;
            correct=ans;
            alternate=`[${a},∞)`;
            display=ans;
            choices=[correct];
            choices.push(`x ≥ ${a+1}`);
            choices.push(`x ≤ ${a}`);
            choices.push(`x > ${a}`);
            choices.push(`x < ${a}`);
            expectedFormat="Enter inequality like x ≥ a";
            break;
        }
        case "transform":{
            mathExpression=`If the graph of \\( y=x^2 \\) is shifted left ${h} and down ${k}, what is the new equation?`;
            let newEq=`y=(x + ${h})^2 - ${k}`;
            correct=newEq;
            alternate=newEq.replace(/\s+/g,"");
            display=newEq;
            choices=[correct];
            choices.push(`y=(x - ${h})^2 - ${k}`);
            choices.push(`y=(x + ${h})^2 + ${k}`);
            choices.push(`y=(x - ${h})^2 + ${k}`);
            choices.push(`y=(x + ${h+1})^2 - ${k}`);
            expectedFormat="Enter equation";
            break;
        }
        default:
            return {latex: mathExpression, correct, alternate, display, choices, expectedFormat};
    }
    let optionSet=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct: correct,
        alternate: alternate,
        display: display,
        choices: optionSet,
        expectedFormat: expectedFormat
    };
}