import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "./algebraUtils.js";

export function generatePolynomial(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["add", "subtract", "multiply"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxCoeff=getMaxForDifficulty(difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxCoeff)+1;
    let b=Math.floor(Math.random()*maxCoeff)+1;
    let c=Math.floor(Math.random()*maxCoeff)+1;
    let d=Math.floor(Math.random()*maxCoeff)+1;
    switch (type){
        case "add":{
            let p1=`${a}x^2 + ${b}x + ${c}`;
            let p2=`${d}x^2 + ${a}x + ${b}`;
            let sumA=a+d;
            let sumB=b+a;
            let sumC=c+b;
            let result=`${sumA}x^2 + ${sumB}x + ${sumC}`;
            questionArea.innerHTML=`Add: \\( (${p1}) + (${p2}) \\)`;
            window.correctAnswer={
                correct: result,
                alternate: result.replace(/\s+/g,"")
            };
            hint="Enter as a polynomial, e.g., 3x^2+5x+2";
            break;
        }
        case "subtract":{
            let p1=`${a}x^2 + ${b}x + ${c}`;
            let p2=`${d}x^2 + ${a}x + ${b}`;
            let diffA=a-d;
            let diffB=b-a;
            let diffC=c-b;
            let result=`${diffA}x^2 + ${diffB}x + ${diffC}`;
            questionArea.innerHTML=`Subtract: \\( (${p1}) - (${p2}) \\)`;
            window.correctAnswer={
                correct: result,
                alternate: result.replace(/\s+/g,"")
            };
            hint="Enter as a polynomial";
            break;
        }
        case "multiply":{
            let p1=`${a}x + ${b}`;
            let p2=`${c}x + ${d}`;
            let term1=a*c;
            let term2=a*d + b*c;
            let term3=b*d;
            let result=`${term1}x^2 + ${term2}x + ${term3}`;
            questionArea.innerHTML=`Multiply: \\( (${p1})(${p2}) \\)`;
            window.correctAnswer={
                correct: result,
                alternate: result.replace(/\s+/g,"")
            };
            hint="Enter as a polynomial";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generatePolynomialDivision(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["simple", "with_remainder"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "simple":{
            let dividend=`${a}x^2 + ${b}x`;
            let divisor=`x`;
            let quotient=`${a}x + ${b}`;
            questionArea.innerHTML=`Divide: \\( \\frac{${dividend}}{${divisor}} \\)`;
            window.correctAnswer={
                correct: quotient,
                alternate: quotient.replace(/\s+/g,"")
            };
            hint="Enter as a polynomial";
            break;
        }
        case "with_remainder":{
            let dividend=`${a}x^2 + ${b}x + ${a}`;
            let divisor=`x + 1`;
            let remainder=a - b;
            let quotient=`${a}x + ${b - a}`;
            questionArea.innerHTML=`Divide: \\( \\frac{${dividend}}{${divisor}} \\)`;
            window.correctAnswer={
                correct: `${quotient} + \\frac{${remainder}}{${divisor}}`,
                alternate: `${quotient} + ${remainder}/(${divisor})`
            };
            hint="Enter as polynomial + remainder/divisor";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateFactoring(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["gcf", "trinomial", "difference_squares", "sum_cubes", "difference_cubes"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 10);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let c=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "gcf":{
            let expr=`${a*b}x + ${a*c}`;
            questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: `${a}(${b}x + ${c})`,
                alternate: `${a}(${b}x+${c})`
            };
            hint="Enter as a(bx+c)";
            break;
        }
        case "trinomial":{
            let p=a*c;
            let q=a+c;
            questionArea.innerHTML=`Factor: \\( x^2 + ${q}x + ${p} \\)`;
            window.correctAnswer={
                correct: `(x + ${a})(x + ${c})`,
                alternate: `(x+${a})(x+${c})`
            };
            hint="Enter as (x+a)(x+b)";
            break;
        }
        case "difference_squares":{
            let expr=`${a*a}x^2 - ${b*b}`;
            questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: `(${a}x - ${b})(${a}x + ${b})`,
                alternate: `(${a}x-${b})(${a}x+${b})`
            };
            hint="Enter as (ax-b)(ax+b)";
            break;
        }
        case "sum_cubes":{
            let expr=`x^3 + ${a*a*a}`;
            questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: `(x + ${a})(x^2 - ${a}x + ${a*a})`,
                alternate: `(x+${a})(x^2-${a}x+${a*a})`
            };
            hint="Enter as (x+a)(x^2-ax+a^2)";
            break;
        }
        case "difference_cubes":{
            let expr=`x^3 - ${a*a*a}`;
            questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: `(x - ${a})(x^2 + ${a}x + ${a*a})`,
                alternate: `(x-${a})(x^2+${a}x+${a*a})`
            };
            hint="Enter as (x-a)(x^2+ax+a^2)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateFunctionConcepts(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["domain", "range", "notation", "evaluate"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 10);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let x=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "domain":{
            questionArea.innerHTML=`Find the domain of \\( f(x)=\\sqrt{x-${a}} \\). (Enter interval)`;
            window.correctAnswer={
                correct: `[${a}, ∞)`,
                alternate: `[${a}, infinity)`
            };
            hint="Enter interval like [a,∞)";
            break;
        }
        case "range":{
            questionArea.innerHTML=`Find the range of \\( f(x)=x^2 + ${a} \\). (Enter interval)`;
            window.correctAnswer={
                correct: `[${a}, ∞)`,
                alternate: `[${a}, infinity)`
            };
            hint="Enter interval";
            break;
        }
        case "notation":{
            questionArea.innerHTML=`If \\( f(x)=${a}x + 3 \\), find \\( f(${x}) \\).`;
            window.correctAnswer={
                correct: (a*x+3).toString(),
                alternate: (a*x+3).toString()
            };
            hint="Enter a number";
            break;
        }
        case "evaluate":{
            questionArea.innerHTML=`Given \\( f(x)=x^2 - ${a} \\), evaluate \\( f(${x}) \\).`;
            window.correctAnswer={
                correct: (x*x - a).toString(),
                alternate: (x*x - a).toString()
            };
            hint="Enter a number";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateLinearGraphing(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["slope", "intercepts", "equation_from_points", "parallel_perpendicular"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 10);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let x1=Math.floor(Math.random()*maxVal)+1;
    let y1=Math.floor(Math.random()*maxVal)+1;
    let x2=Math.floor(Math.random()*maxVal)+1;
    let y2=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "slope":{
            let slope=(y2-y1)/(x2-x1);
            questionArea.innerHTML=`Find the slope between (${x1},${y1}) and (${x2},${y2}).`;
            window.correctAnswer={
                correct: slope.toFixed(2),
                alternate: slope.toString()
            };
            hint="Enter a number";
            break;
        }
        case "intercepts":{
            let eq=`${a}x + ${b}y=${a*b}`;
            let xInt=b;
            let yInt=a;
            questionArea.innerHTML=`Find the x- and y-intercepts of \\( ${eq} \\).`;
            window.correctAnswer={
                correct: `(${xInt},0) and (0,${yInt})`,
                alternate: `(${xInt},0),(0,${yInt})`
            };
            hint="Enter as (x,0) and (0,y)";
            break;
        }
        case "equation_from_points":{
            let slope=(y2-y1)/(x2-x1);
            let intercept=y1-slope*x1;
            questionArea.innerHTML=`Find the equation of the line through (${x1},${y1}) and (${x2},${y2}).`;
            window.correctAnswer={
                correct: `y=${slope.toFixed(2)}x + ${intercept.toFixed(2)}`,
                alternate: `y=${slope.toFixed(2)}x+${intercept.toFixed(2)}`
            };
            hint="Enter as y=mx+b";
            break;
        }
        case "parallel_perpendicular":{
            let slope=a;
            questionArea.innerHTML=`Line L has slope ${slope}. What is the slope of a line parallel to L? Perpendicular?`;
            window.correctAnswer={
                correct: `parallel: ${slope}, perpendicular: ${-1/slope}`,
                alternate: `${slope}, ${-1/slope}`
            };
            hint="Enter as 'parallel, perpendicular'";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateNonLinearGraphing(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["parabola_vertex", "abs_value", "sqrt", "transform"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let h=Math.floor(Math.random()*maxVal)-2;
    let k=Math.floor(Math.random()*maxVal)-2;
    switch (type){
        case "parabola_vertex":{
            questionArea.innerHTML=`Find the vertex of \\( y=${a}(x - ${h})^2 + ${k} \\).`;
            window.correctAnswer={
                correct: `(${h}, ${k})`,
                alternate: `(${h},${k})`
            };
            hint="Enter as (h,k)";
            break;
        }
        case "abs_value":{
            questionArea.innerHTML=`Describe the transformation of \\( y=|x| \\) to \\( y=|x - ${h}| + ${k} \\).`;
            window.correctAnswer={
                correct: `right ${h}, up ${k}`,
                alternate: `right ${h}, up ${k}`
            };
            hint="Enter direction and amount";
            break;
        }
        case "sqrt":{
            questionArea.innerHTML=`Find the domain of \\( y=\\sqrt{x - ${a}} \\).`;
            window.correctAnswer={
                correct: `x ≥ ${a}`,
                alternate: `[${a},∞)`
            };
            hint="Enter as x ≥ a or [a,∞)";
            break;
        }
        case "transform":{
            questionArea.innerHTML=`If the graph of \\( y=x^2 \\) is shifted left ${h} and down ${k}, what is the new equation?`;
            let newH=-h;
            let newK=-k;
            window.correctAnswer={
                correct: `y=(x + ${newH})^2 - ${newK}`,
                alternate: `y=(x+${newH})^2-${newK}`
            };
            hint="Enter as y=(x-h)^2+k";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}