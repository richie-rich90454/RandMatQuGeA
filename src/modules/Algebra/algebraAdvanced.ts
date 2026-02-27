import {questionArea} from "../../script.js";
import {factorial, getMaxForDifficulty, getOrdinal} from "./algebraUtils.js";

interface SeriesType{
    expr: string;
    conv: string;
}
export function generateLogarithm(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["basic", "change_base", "equation", "properties", "exponential_form"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxBase=getMaxForDifficulty(difficulty, 4);
    let base=Math.floor(Math.random()*maxBase)+2;
    let arg=Math.pow(base, Math.floor(Math.random()*4)+1);
    let newBase=Math.floor(Math.random()*3)+2;
    let hint="";
    switch (type){
        case "basic":{
            let answer=(Math.log(arg)/Math.log(base)).toFixed(2);
            questionArea.innerHTML=`Evaluate: \\( \\log_{${base}} ${arg} \\)`;
            window.correctAnswer={
                correct: answer,
                alternate: answer
            };
            hint="Enter a decimal number, e.g., 2.5";
            break;
        }
        case "change_base":{
            let numerator=Math.log(arg)/Math.log(newBase);
            let denominator=Math.log(base)/Math.log(newBase);
            let numericAnswer=(numerator/denominator).toFixed(2);
            let expr=`log_${newBase}(${arg})/log_${newBase}(${base})`;
            questionArea.innerHTML=`Express \\( \\log_{${base}} ${arg} \\) in base \\( ${newBase} \\)`;
            window.correctAnswer={
                correct: numericAnswer,
                alternate: expr
            };
            hint="Enter as fraction (e.g., log3(8)/log3(2)) or decimal";
            break;
        }
        case "equation":{
            let exponent=Math.floor(Math.random()*3)+2;
            questionArea.innerHTML=`Solve for \\( x \\): \\( ${base}^{x}=${Math.pow(base, exponent)} \\)`;
            window.correctAnswer={
                correct: exponent.toString(),
                alternate: exponent.toString()
            };
            hint="Enter a whole number";
            break;
        }
        case "properties":{
            let a=Math.floor(Math.random()*8)+2;
            let b=Math.floor(Math.random()*8)+2;
            let logSum=(Math.log(a*b)/Math.log(base)).toFixed(2);
            questionArea.innerHTML=`Evaluate: \\( \\log_{${base}} (${a} \\times ${b}) \\)`;
            window.correctAnswer={
                correct: logSum,
                alternate: `\\log_{${base}} ${a}+\\log_{${base}} ${b}=${(Math.log(a)/Math.log(base)).toFixed(2)}+${(Math.log(b)/Math.log(base)).toFixed(2)}=${logSum}`
            };
            break;
        }
        case "exponential_form":{
            let exponent=Math.floor(Math.random()*3)+2;
            let result=Math.pow(base, exponent);
            questionArea.innerHTML=`If \\( \\log_{${base}} x=${exponent} \\), find \\( x \\)`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: `${base}^${exponent}`
            };
            hint="Enter a number or expression (e.g., 8 or 2^3)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateExponent(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["basic", "solve", "laws", "growth", "compare"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxBase=getMaxForDifficulty(difficulty, 4);
    let base=Math.floor(Math.random()*maxBase)+2;
    let exponent=Math.floor(Math.random()*5)+2;
    let hint="";
    switch (type){
        case "basic":
            questionArea.innerHTML=`Evaluate: \\( ${base}^{${exponent}} \\)`;
            window.correctAnswer={
                correct: Math.pow(base, exponent).toString(),
                alternate: Math.pow(base, exponent).toString()
            };
            hint="Enter a number";
            break;
        case "solve":{
            let power=Math.pow(base, exponent);
            questionArea.innerHTML=`Solve for \\( x \\): \\( ${base}^{x}=${power} \\)`;
            window.correctAnswer={
                correct: exponent.toString(),
                alternate: exponent.toString()
            };
            hint="Enter a whole number";
            break;
        }
        case "laws":{
            let a=Math.floor(Math.random()*3)+2;
            let b=Math.floor(Math.random()*3)+2;
            questionArea.innerHTML=`Simplify: \\( (${base}^{${a}}) \\times (${base}^{${b}}) \\)`;
            window.correctAnswer={
                correct: Math.pow(base, a+b).toString(),
                alternate: `${base}^${a+b}`
            };
            hint="Enter a number (e.g., 32) or an expression (e.g., 2^5)";
            break;
        }
        case "growth":{
            let rate=(Math.random()*20+5).toFixed(1);
            questionArea.innerHTML=`A population grows at \\( ${rate}\\% \\) annually. What is the growth factor?`;
            let factor=(1+parseFloat(rate)/100).toFixed(3);
            window.correctAnswer={
                correct: factor,
                alternate: factor
            };
            hint="Enter a decimal (e.g., 1.05)";
            break;
        }
        case "compare":{
            let b1=Math.floor(Math.random()*3)+2;
            let b2=Math.floor(Math.random()*3)+2;
            let e1=Math.floor(Math.random()*4)+2;
            let e2=Math.floor(Math.random()*4)+2;
            questionArea.innerHTML=`Which is larger: \\( ${b1}^{${e1}} \\) or \\( ${b2}^{${e2}} \\)?`;
            let vals=[Math.pow(b1, e1), Math.pow(b2, e2)];
            let largerExpr=vals[0]>vals[1]?`${b1}^${e1}`:`${b2}^${e2}`;
            window.correctAnswer={
                correct: Math.max(...vals).toString(),
                alternate: largerExpr
            };
            hint="Enter the larger value (e.g., 32) or the expression (e.g., 2^5)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateFactorial(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["basic", "division", "equation", "approximation", "prime"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxN=getMaxForDifficulty(difficulty, 7);
    let n=Math.floor(Math.random()*maxN)+5;
    let k=Math.floor(Math.random()*(n-2))+2;
    let hint="";
    switch (type){
        case "basic":
            questionArea.innerHTML=`Calculate \\( ${n}! \\)`;
            window.correctAnswer={
                correct: factorial(n).toString(),
                alternate: factorial(n).toString()
            };
            hint="Enter a whole number";
            break;
        case "division":{
            let result=Array.from({ length: n-k }, (_, i)=> n-i).reduce((a, b)=> a*b, 1);
            questionArea.innerHTML=`Simplify: \\( \\frac{${n}!}{${k}!} \\)`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: (factorial(n)/factorial(k)).toString()
            };
            hint="Enter a whole number";
            break;
        }
        case "equation":{
            let factVal=factorial(n);
            questionArea.innerHTML=`Solve for \\( n \\): \\( n!=${factVal} \\)`;
            window.correctAnswer={
                correct: n.toString(),
                alternate: n.toString()
            };
            hint="Enter a whole number";
            break;
        }
        case "approximation":{
            questionArea.innerHTML=`Estimate \\( ${n}! \\) using Stirling"s approximation`;
            let stirling=Math.sqrt(2*Math.PI*n)*Math.pow(n/Math.E, n);
            window.correctAnswer={
                correct: stirling.toFixed(0),
                alternate: Math.round(stirling).toString()
            };
            hint="Enter a rounded whole number";
            break;
        }
        case "prime":{
            let primes=[2, 3, 5, 7, 11];
            let prime=primes[Math.floor(Math.random()*primes.length)];
            questionArea.innerHTML=`Find the exponent of \\( ${prime} \\) in \\( ${n}! \\) (prime factorization)`;
            let count=0;
            let temp=n;
            while (temp>0){
                temp=Math.floor(temp/prime);
                count+=temp;
            }
            window.correctAnswer={
                correct: count.toString(),
                alternate: count.toString()
            };
            hint="Enter a whole number";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateSeries(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["arithmetic_sum", "geometric_sum", "convergence", "nth_term"];
    let type=types[Math.floor(Math.random()*types.length)];
    let mathExpression="";
    let plainCorrectAnswer="";
    let hint="";
    let maxVal=getMaxForDifficulty(difficulty, 10);
    switch (type){
        case "arithmetic_sum":{
            let a1=Math.floor(Math.random()*maxVal)+1;
            let d=Math.floor(Math.random()*(maxVal/2))+1;
            let n=Math.floor(Math.random()*maxVal)+5;
            let sum=(n/2)*(2*a1+(n-1)*d);
            mathExpression=`Find the sum of the first ${n} terms of the arithmetic sequence: \\[ S_n=\\frac{n}{2} [2a_1+(n-1)d] \\] where \\( a_1=${a1} \\) and \\( d=${d} \\).`;
            plainCorrectAnswer=sum.toString();
            window.correctAnswer={correct: plainCorrectAnswer};
            hint="Enter a number";
            break;
        }
        case "geometric_sum":{
            let a1=Math.floor(Math.random()*maxVal/2)+1;
            let rValue=(Math.random() < 0.5?-1:1)*(Math.random()*0.9+0.1);
            let r=rValue.toFixed(2);
            let n=Math.floor(Math.random()*8)+3;
            let sum=a1*(1-Math.pow(rValue, n))/(1-rValue);
            mathExpression=`Find the sum of the first ${n} terms of the geometric sequence: \\[ S_n=a_1 \\frac{1-r^n}{1-r} \\] where \\( a_1=${a1} \\) and \\( r=${r} \\).`;
            plainCorrectAnswer=sum.toFixed(2);
            window.correctAnswer={
                correct: plainCorrectAnswer,
                alternate: `(${a1}*(1-${r}^${n}))/(1-${r})`
            };
            hint="Enter a decimal or the formula (e.g., 2.5 or (3*(1-0.5^4))/(1-0.5))";
            break;
        }
        case "convergence":{
            let seriesTypes: SeriesType[]=[{expr: "\\frac{1}{n^2}", conv: "converges"}, {expr: "\\frac{1}{\\sqrt{n}}", conv: "diverges"}, {expr: "(-1)^n \\frac{1}{n}", conv: "converges"}];
            let chosen=seriesTypes[Math.floor(Math.random()*seriesTypes.length)];
            mathExpression=`Determine if the series converges or diverges: \\[ \\sum_{n=1}^{\\infty} ${chosen.expr} \\]`;
            plainCorrectAnswer=chosen.conv;
            window.correctAnswer={
                correct: plainCorrectAnswer,
                alternate: plainCorrectAnswer==="converges"?"converge":"diverge"
            };
            hint="Enter \"converges\" or \"diverges\"";
            break;
        }
        case "nth_term":{
            let a1=Math.floor(Math.random()*maxVal)+1;
            let d=Math.floor(Math.random()*(maxVal/2))+1;
            let n=Math.floor(Math.random()*maxVal)+5;
            let an=a1+(n-1)*d;
            mathExpression=`Find the ${n}${getOrdinal(n)} term of the arithmetic sequence: \\[ a_n=a_1+(n-1)d \\] where \\( a_1=${a1} \\) and \\( d=${d} \\).`;
            plainCorrectAnswer=an.toString();
            window.correctAnswer={correct: plainCorrectAnswer};
            hint="Enter a number";
            break;
        }
    }
    window.expectedFormat=hint;
    let mathContainer=document.createElement("div");
    mathContainer.innerHTML=mathExpression;
    questionArea.appendChild(mathContainer);
    if (window.MathJax&&window.MathJax.typesetPromise){
        window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
            console.log("MathJax typeset error:", err)
        );
    }
}
export function generateRoot(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let maxRoot=getMaxForDifficulty(difficulty, 4);
    let maxBase=getMaxForDifficulty(difficulty, 10);
    let root=Math.floor((Math.random()*maxRoot))+2;
    let base=Math.floor((Math.random()*maxBase))+1;
    let radicand=Math.pow(base, root);
    let rootExpression="";
    if (root=== 2){
        rootExpression=`\\[ \\sqrt{${radicand}}=? \\]`;
    }
    else{
        rootExpression=`\\[ \\sqrt[${root}]{${radicand}}=? \\]`;
    }
    let correctRoot=base.toString();
    let mathContainer=document.createElement("div");
    mathContainer.innerHTML=rootExpression;
    questionArea.appendChild(mathContainer);
    if (window.MathJax&&window.MathJax.typesetPromise){
        window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
            console.log("MathJax typeset error:", err)
        );
    }
    window.correctAnswer={
        correct: correctRoot,
        alternate: correctRoot
    };
    window.expectedFormat="Enter a whole number";
}
export function generateLinearWordProblem(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["consecutive_integers", "money", "distance", "age", "mixture"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 20);
    let hint="";
    switch (type){
        case "consecutive_integers":{
            let n=Math.floor(Math.random()*maxVal)+1;
            let sum=n+(n+1);
            questionArea.innerHTML=`The sum of two consecutive integers is ${sum}. Find the smaller integer.`;
            window.correctAnswer={
                correct: n.toString(),
                alternate: n.toString()
            };
            hint="Enter a whole number";
            break;
        }
        case "money":{
            let quarters=Math.floor(Math.random()*5)+2;
            let dimes=Math.floor(Math.random()*5)+2;
            let total=quarters*25+dimes*10;
            questionArea.innerHTML=`You have ${quarters} quarters and ${dimes} dimes. How much money do you have in cents?`;
            window.correctAnswer={
                correct: total.toString(),
                alternate: total.toString()
            };
            hint="Enter a number (cents)";
            break;
        }
        case "distance":{
            let rate=Math.floor(Math.random()*30)+20;
            let time=Math.floor(Math.random()*3)+2;
            let dist=rate*time;
            questionArea.innerHTML=`A car travels at ${rate} mph for ${time} hours. How far does it travel?`;
            window.correctAnswer={
                correct: dist.toString(),
                alternate: dist.toString()
            };
            hint="Enter a number (miles)";
            break;
        }
        case "age":{
            let now=Math.floor(Math.random()*20)+10;
            let past=Math.floor(Math.random()*5)+2;
            let ago=now-past;
            questionArea.innerHTML=`A person is ${now} years old. How old were they ${past} years ago?`;
            window.correctAnswer={
                correct: ago.toString(),
                alternate: ago.toString()
            };
            hint="Enter a number";
            break;
        }
        case "mixture":{
            let total=Math.floor(Math.random()*20)+10;
            let percent=Math.floor(Math.random()*30)+20;
            let amount=Math.round(total*percent/100);
            questionArea.innerHTML=`A ${total} gallon mixture contains ${percent}% alcohol. How many gallons of alcohol are in it?`;
            window.correctAnswer={
                correct: amount.toString(),
                alternate: amount.toString()
            };
            hint="Enter a number (gallons)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateRadicalSimplify(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["simplify", "add", "subtract", "multiply", "divide", "rationalize"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 20);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let c=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "simplify":{
            let radicand=a*a*b;
            questionArea.innerHTML=`Simplify: \\( \\sqrt{${radicand}} \\)`;
            window.correctAnswer={
                correct: `${a}\\sqrt{${b}}`,
                alternate: `${a}√${b}`
            };
            hint="Enter as a√b";
            break;
        }
        case "add":{
            questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} + ${c}\\sqrt{${b}} \\)`;
            let coeff=a+c;
            window.correctAnswer={
                correct: `${coeff}\\sqrt{${b}}`,
                alternate: `${coeff}√${b}`
            };
            hint="Enter as a√b";
            break;
        }
        case "subtract":{
            questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} - ${c}\\sqrt{${b}} \\)`;
            let coeff=a-c;
            window.correctAnswer={
                correct: `${coeff}\\sqrt{${b}}`,
                alternate: `${coeff}√${b}`
            };
            hint="Enter as a√b";
            break;
        }
        case "multiply":{
            questionArea.innerHTML=`Multiply: \\( \\sqrt{${a}} \\times \\sqrt{${b}} \\)`;
            let product=a*b;
            window.correctAnswer={
                correct: `\\sqrt{${product}}`,
                alternate: `√${product}`
            };
            hint="Enter as √n";
            break;
        }
        case "divide":{
            questionArea.innerHTML=`Divide: \\( \\frac{\\sqrt{${a}}}{\\sqrt{${b}}} \\)`;
            let quotient=a/b;
            window.correctAnswer={
                correct: `\\sqrt{${quotient}}`,
                alternate: `√${quotient}`
            };
            hint="Enter as √n";
            break;
        }
        case "rationalize":{
            questionArea.innerHTML=`Rationalize: \\( \\frac{1}{\\sqrt{${a}}} \\)`;
            window.correctAnswer={
                correct: `\\frac{\\sqrt{${a}}}{${a}}`,
                alternate: `√${a}/${a}`
            };
            hint="Enter as √a/a";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateRadicalEquation(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["one_radical", "two_radicals"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 10);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "one_radical":{
            let sol=b*b - a;
            questionArea.innerHTML=`Solve: \\( \\sqrt{x + ${a}}=${b} \\)`;
            window.correctAnswer={
                correct: sol.toString(),
                alternate: sol.toString()
            };
            hint="Enter a number";
            break;
        }
        case "two_radicals":{
            let sol=(b*b - a)/(2*b);
            sol=sol*sol;
            questionArea.innerHTML=`Solve: \\( \\sqrt{x + ${a}} - \\sqrt{x}=${b} \\) (Enter solution)`;
            window.correctAnswer={
                correct: sol.toFixed(2),
                alternate: sol.toString()
            };
            hint="Enter a decimal";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateRationalExponents(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["convert_to_radical", "convert_to_exponent", "evaluate"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+2;
    let m=Math.floor(Math.random()*2)+2;
    let n=Math.floor(Math.random()*2)+2;
    switch (type){
        case "convert_to_radical":{
            questionArea.innerHTML=`Write \\( x^{${m}/${n}} \\) in radical form.`;
            window.correctAnswer={
                correct: `\\sqrt[${n}]{x^{${m}}}`,
                alternate: `x^(${m}/${n})`
            };
            hint="Enter as n√(x^m)";
            break;
        }
        case "convert_to_exponent":{
            questionArea.innerHTML=`Write \\( \\sqrt[${n}]{x^{${m}}} \\) using a rational exponent.`;
            window.correctAnswer={
                correct: `x^{${m}/${n}}`,
                alternate: `x^(${m}/${n})`
            };
            hint="Enter as x^(m/n)";
            break;
        }
        case "evaluate":{
            let base=a;
            let exponent=m/n;
            let result=Math.pow(base, exponent).toFixed(2);
            questionArea.innerHTML=`Evaluate: \\( ${a}^{${m}/${n}} \\)`;
            window.correctAnswer={
                correct: result,
                alternate: result
            };
            hint="Enter a decimal";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateExponentRules(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["product", "quotient", "power", "negative", "zero"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxBase=getMaxForDifficulty(difficulty, 4);
    let base=Math.floor(Math.random()*maxBase)+2;
    let m=Math.floor(Math.random()*3)+1;
    let n=Math.floor(Math.random()*3)+1;
    let hint="";
    switch (type){
        case "product":{
            questionArea.innerHTML=`Simplify: \\( ${base}^{${m}} \\times ${base}^{${n}} \\)`;
            let exponent=m+n;
            window.correctAnswer={
                correct: `${base}^${exponent}`,
                alternate: `${base}^${exponent}`
            };
            hint="Enter as a^b";
            break;
        }
        case "quotient":{
            questionArea.innerHTML=`Simplify: \\( \\frac{${base}^{${m+n}}}{${base}^{${n}}} \\)`;
            window.correctAnswer={
                correct: `${base}^${m}`,
                alternate: `${base}^${m}`
            };
            hint="Enter as a^b";
            break;
        }
        case "power":{
            questionArea.innerHTML=`Simplify: \\( (${base}^{${m}})^{${n}} \\)`;
            window.correctAnswer={
                correct: `${base}^${m*n}`,
                alternate: `${base}^${m*n}`
            };
            hint="Enter as a^b";
            break;
        }
        case "negative":{
            questionArea.innerHTML=`Write with a positive exponent: \\( ${base}^{-${m}} \\)`;
            window.correctAnswer={
                correct: `\\frac{1}{${base}^{${m}}}`,
                alternate: `1/${base}^${m}`
            };
            hint="Enter as 1/a^b";
            break;
        }
        case "zero":{
            questionArea.innerHTML=`Evaluate: \\( ${base}^{0} \\)`;
            window.correctAnswer={
                correct: "1",
                alternate: "1"
            };
            hint="Enter 1";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateScientificNotation(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["to_standard", "to_scientific", "multiply", "divide"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 1000);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*3)+1;
    switch (type){
        case "to_standard":{
            let sci=`${a} \\times 10^{${b}}`;
            let std=a * Math.pow(10,b);
            questionArea.innerHTML=`Convert to standard notation: \\( ${sci} \\)`;
            window.correctAnswer={
                correct: std.toString(),
                alternate: std.toString()
            };
            hint="Enter a number";
            break;
        }
        case "to_scientific":{
            let std=a * 100;
            let sci=std.toExponential(1).replace('e+','×10^');
            questionArea.innerHTML=`Write in scientific notation: \\( ${std} \\)`;
            window.correctAnswer={
                correct: sci,
                alternate: sci
            };
            hint="Enter as a×10^b";
            break;
        }
        case "multiply":{
            let sci1=`(${a} \\times 10^{${b}})`;
            let sci2=`(${a} \\times 10^{${b+1}})`;
            let product=a*a * Math.pow(10, 2*b+1);
            questionArea.innerHTML=`Multiply: \\( ${sci1} \\times ${sci2} \\)`;
            window.correctAnswer={
                correct: product.toExponential(2).replace('e+','×10^'),
                alternate: product.toString()
            };
            hint="Enter in scientific notation";
            break;
        }
        case "divide":{
            let sci1=`(${a} \\times 10^{${b+1}})`;
            let sci2=`(${a} \\times 10^{${b}})`;
            let quotient=10;
            questionArea.innerHTML=`Divide: \\( \\frac{${sci1}}{${sci2}} \\)`;
            window.correctAnswer={
                correct: quotient.toString(),
                alternate: quotient.toString()
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
export function generateComplex(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["add", "subtract", "multiply", "divide", "powers_i"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let c=Math.floor(Math.random()*maxVal)+1;
    let d=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "add":{
            questionArea.innerHTML=`Add: \\( (${a} + ${b}i) + (${c} + ${d}i) \\)`;
            let real=a+c;
            let imag=b+d;
            window.correctAnswer={
                correct: `${real} + ${imag}i`,
                alternate: `${real}+${imag}i`
            };
            hint="Enter as a+bi";
            break;
        }
        case "subtract":{
            questionArea.innerHTML=`Subtract: \\( (${a} + ${b}i) - (${c} + ${d}i) \\)`;
            let real=a-c;
            let imag=b-d;
            window.correctAnswer={
                correct: `${real} + ${imag}i`,
                alternate: `${real}+${imag}i`
            };
            hint="Enter as a+bi";
            break;
        }
        case "multiply":{
            questionArea.innerHTML=`Multiply: \\( (${a} + ${b}i)(${c} + ${d}i) \\)`;
            let real=a*c - b*d;
            let imag=a*d + b*c;
            window.correctAnswer={
                correct: `${real} + ${imag}i`,
                alternate: `${real}+${imag}i`
            };
            hint="Enter as a+bi";
            break;
        }
        case "divide":{
            questionArea.innerHTML=`Divide: \\( \\frac{${a} + ${b}i}{${c} + ${d}i} \\)`;
            let denom=c*c+d*d;
            let real=(a*c + b*d)/denom;
            let imag=(b*c - a*d)/denom;
            window.correctAnswer={
                correct: `${real.toFixed(2)} + ${imag.toFixed(2)}i`,
                alternate: `${real.toFixed(2)}+${imag.toFixed(2)}i`
            };
            hint="Enter as a+bi decimals";
            break;
        }
        case "powers_i":{
            let n=Math.floor(Math.random()*4)+1;
            let ans=["i","-1","-i","1"][(n-1)%4];
            questionArea.innerHTML=`Simplify: \\( i^{${n}} \\)`;
            window.correctAnswer={
                correct: ans,
                alternate: ans
            };
            hint="Enter i, -1, -i, or 1";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateVariation(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["direct", "inverse", "joint"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 10);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let x=Math.floor(Math.random()*maxVal)+1;
    let y=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "direct":{
            questionArea.innerHTML=`If y varies directly with x, and y=${a} when x=${b}, find y when x=${x}.`;
            let k=a/b;
            let result=k*x;
            window.correctAnswer={
                correct: result.toFixed(2),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "inverse":{
            questionArea.innerHTML=`If y varies inversely with x, and y=${a} when x=${b}, find y when x=${x}.`;
            let k=a*b;
            let result=k/x;
            window.correctAnswer={
                correct: result.toFixed(2),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "joint":{
            let c=Math.floor(Math.random()*maxVal)+1;
            questionArea.innerHTML=`If z varies jointly with x and y, and z=${a} when x=${b}, y=${c}, find z when x=${x}, y=${y}.`;
            let k=a/(b*c);
            let result=k*x*y;
            window.correctAnswer={
                correct: result.toFixed(2),
                alternate: result.toString()
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