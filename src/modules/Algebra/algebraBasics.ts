import {questionArea} from "../../script.js";
import {gcd, getMaxForDifficulty} from "./algebraUtils.js";

export function generateFraction(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["add", "subtract", "multiply", "divide", "simplify", "convert"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 12);
    let hint="";
    let num1=Math.floor(Math.random()*maxVal)+1;
    let den1=Math.floor(Math.random()*(maxVal-1))+2;
    let num2=Math.floor(Math.random()*maxVal)+1;
    let den2=Math.floor(Math.random()*(maxVal-1))+2;
    switch (type){
        case "add":{
            let commonDen=den1*den2;
            let newNum1=num1*den2;
            let newNum2=num2*den1;
            let sumNum=newNum1+newNum2;
            let g=gcd(sumNum, commonDen);
            let simplified=`${sumNum/g}/${commonDen/g}`;
            questionArea.innerHTML=`Add: \\( \\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}} \\)`;
            window.correctAnswer={
                correct: simplified,
                alternate: `${sumNum}/${commonDen}`
            };
            hint="Enter as a fraction (e.g., 3/4)";
            break;
        }
        case "subtract":{
            let commonDen=den1*den2;
            let newNum1=num1*den2;
            let newNum2=num2*den1;
            let diffNum=newNum1-newNum2;
            let g=gcd(diffNum, commonDen);
            let simplified=`${diffNum/g}/${commonDen/g}`;
            questionArea.innerHTML=`Subtract: \\( \\frac{${num1}}{${den1}} - \\frac{${num2}}{${den2}} \\)`;
            window.correctAnswer={
                correct: simplified,
                alternate: `${diffNum}/${commonDen}`
            };
            hint="Enter as a fraction (e.g., 1/2)";
            break;
        }
        case "multiply":{
            let prodNum=num1*num2;
            let prodDen=den1*den2;
            let g=gcd(prodNum, prodDen);
            let simplified=`${prodNum/g}/${prodDen/g}`;
            questionArea.innerHTML=`Multiply: \\( \\frac{${num1}}{${den1}} \\times \\frac{${num2}}{${den2}} \\)`;
            window.correctAnswer={
                correct: simplified,
                alternate: `${prodNum}/${prodDen}`
            };
            hint="Enter as a fraction (e.g., 5/8)";
            break;
        }
        case "divide":{
            let quotNum=num1*den2;
            let quotDen=den1*num2;
            let g=gcd(quotNum, quotDen);
            let simplified=`${quotNum/g}/${quotDen/g}`;
            questionArea.innerHTML=`Divide: \\( \\frac{${num1}}{${den1}} \\div \\frac{${num2}}{${den2}} \\)`;
            window.correctAnswer={
                correct: simplified,
                alternate: `${quotNum}/${quotDen}`
            };
            hint="Enter as a fraction (e.g., 7/3)";
            break;
        }
        case "simplify":{
            let num=Math.floor(Math.random()*30)+2;
            let den=Math.floor(Math.random()*30)+2;
            let g=gcd(num, den);
            let simplified=`${num/g}/${den/g}`;
            questionArea.innerHTML=`Simplify: \\( \\frac{${num}}{${den}} \\)`;
            window.correctAnswer={
                correct: simplified,
                alternate: simplified
            };
            hint="Enter as a fraction in lowest terms";
            break;
        }
        case "convert":{
            let decimal=(Math.random()*10).toFixed(2);
            let fraction=`${Math.round(parseFloat(decimal)*100)}/100`;
            questionArea.innerHTML=`Convert \\( ${decimal} \\) to a fraction in simplest form.`;
            window.correctAnswer={
                correct: fraction,
                alternate: fraction
            };
            hint="Enter as a fraction (e.g., 3/4)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generatePercent(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["percent_of", "increase", "decrease", "interest", "markup"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 100);
    let hint="";
    let percent=Math.floor(Math.random()*50)+10;
    let whole=Math.floor(Math.random()*maxVal)+10;
    let part=Math.round(whole*percent/100);
    switch (type){
        case "percent_of":{
            questionArea.innerHTML=`What is \\( ${percent}\\% \\) of \\( ${whole} \\)?`;
            window.correctAnswer={
                correct: part.toString(),
                alternate: part.toString()
            };
            hint="Enter a number";
            break;
        }
        case "increase":{
            let increase=Math.floor(Math.random()*50)+5;
            let newVal=whole+Math.round(whole*increase/100);
            questionArea.innerHTML=`If \\( ${whole} \\) increases by \\( ${increase}\\% \\), what is the new value?`;
            window.correctAnswer={
                correct: newVal.toString(),
                alternate: newVal.toString()
            };
            hint="Enter a number";
            break;
        }
        case "decrease":{
            let decrease=Math.floor(Math.random()*30)+5;
            let newVal=whole-Math.round(whole*decrease/100);
            questionArea.innerHTML=`If \\( ${whole} \\) decreases by \\( ${decrease}\\% \\), what is the new value?`;
            window.correctAnswer={
                correct: newVal.toString(),
                alternate: newVal.toString()
            };
            hint="Enter a number";
            break;
        }
        case "interest":{
            let principal=Math.floor(Math.random()*1000)+500;
            let rate=(Math.random()*5+2).toFixed(1);
            let time=Math.floor(Math.random()*3)+1;
            let interest=Math.round(principal*parseFloat(rate)/100*time);
            questionArea.innerHTML=`Simple interest on \\( $${principal} \\) at \\( ${rate}\\% \\) for \\( ${time} \\) years?`;
            window.correctAnswer={
                correct: interest.toString(),
                alternate: interest.toString()
            };
            hint="Enter a whole number (nearest dollar)";
            break;
        }
        case "markup":{
            let cost=Math.floor(Math.random()*50)+10;
            let markup=Math.floor(Math.random()*40)+20;
            let price=cost+Math.round(cost*markup/100);
            questionArea.innerHTML=`A store buys an item for \\( $${cost} \\) and marks it up \\( ${markup}\\% \\). What is the selling price?`;
            window.correctAnswer={
                correct: price.toString(),
                alternate: price.toString()
            };
            hint="Enter a number (nearest dollar)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateRatioProportion(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["ratio", "proportion", "scale", "unit_rate"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 20);
    let hint="";
    switch (type){
        case "ratio":{
            let a=Math.floor(Math.random()*maxVal)+1;
            let b=Math.floor(Math.random()*maxVal)+1;
            questionArea.innerHTML=`Simplify the ratio \\( ${a}:${b} \\) to lowest terms.`;
            let g=gcd(a,b);
            window.correctAnswer={
                correct: `${a/g}:${b/g}`,
                alternate: `${a/g}/${b/g}`
            };
            hint="Enter as a:b or a/b";
            break;
        }
        case "proportion":{
            let a=Math.floor(Math.random()*5)+2;
            let b=Math.floor(Math.random()*5)+2;
            let c=Math.floor(Math.random()*10)+5;
            let x=Math.round(c*a/b);
            questionArea.innerHTML=`Solve for x: \\( \\frac{${a}}{${b}}=\\frac{${c}}{x} \\)`;
            window.correctAnswer={
                correct: x.toString(),
                alternate: x.toString()
            };
            hint="Enter a number";
            break;
        }
        case "scale":{
            let map=Math.floor(Math.random()*10)+1;
            let actual=Math.floor(Math.random()*50)+10;
            let scaled=Math.round(actual/map);
            questionArea.innerHTML=`On a map with scale 1:${map}, a distance measures ${scaled} cm. What is the actual distance in cm?`;
            window.correctAnswer={
                correct: actual.toString(),
                alternate: actual.toString()
            };
            hint="Enter a number";
            break;
        }
        case "unit_rate":{
            let quantity=Math.floor(Math.random()*100)+20;
            let units=Math.floor(Math.random()*10)+2;
            let rate=Math.round(quantity/units);
            questionArea.innerHTML=`If ${quantity} items cost $${units}, what is the unit price? (nearest cent)`;
            window.correctAnswer={
                correct: rate.toFixed(2),
                alternate: rate.toString()
            };
            hint="Enter a number (e.g., 2.50)";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateUnitConversion(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["length_us", "length_metric", "area", "volume", "multi_step"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 50);
    let hint="";
    let value=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "length_us":{
            let conversions=[
                {from:"ft", to:"in", factor:12},
                {from:"yd", to:"ft", factor:3},
                {from:"mi", to:"ft", factor:5280}
            ];
            let c=conversions[Math.floor(Math.random()*conversions.length)];
            let result=value*c.factor;
            questionArea.innerHTML=`Convert \\( ${value} \\text{ ${c.from}} \\) to \\( \\text{${c.to}} \\).`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "length_metric":{
            let conversions=[
                {from:"m", to:"cm", factor:100},
                {from:"km", to:"m", factor:1000},
                {from:"cm", to:"mm", factor:10}
            ];
            let c=conversions[Math.floor(Math.random()*conversions.length)];
            let result=value*c.factor;
            questionArea.innerHTML=`Convert \\( ${value} \\text{ ${c.from}} \\) to \\( \\text{${c.to}} \\).`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "area":{
            let value2=Math.floor(Math.random()*10)+1;
            let result=value2*9;
            questionArea.innerHTML=`Convert \\( ${value2} \\text{ yd}^2 \\) to \\( \\text{ft}^2 \\). (1 yd=3 ft)`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "volume":{
            let value2=Math.floor(Math.random()*5)+1;
            let result=value2*1000;
            questionArea.innerHTML=`Convert \\( ${value2} \\text{ L} \\) to \\( \\text{mL} \\).`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "multi_step":{
            let value2=Math.floor(Math.random()*10)+1;
            let result=value2*12*3;
            questionArea.innerHTML=`Convert \\( ${value2} \\text{ yd} \\) to \\( \\text{in} \\). (1 yd=3 ft, 1 ft=12 in)`;
            window.correctAnswer={
                correct: result.toString(),
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
export function generateExpressionEvaluation(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["linear", "quadratic", "with_substitution"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 10);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let x=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "linear":{
            questionArea.innerHTML=`Evaluate \\( ${a}x + ${b} \\) when \\( x=${x} \\).`;
            let result=a*x+b;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "quadratic":{
            questionArea.innerHTML=`Evaluate \\( ${a}x^2 + ${b}x + 1 \\) when \\( x=${x} \\).`;
            let result=a*x*x + b*x + 1;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "with_substitution":{
            let expr=`${a}x + ${b}y`;
            let y=Math.floor(Math.random()*maxVal)+1;
            questionArea.innerHTML=`Evaluate \\( ${expr} \\) when \\( x=${x} \\) and \\( y=${y} \\).`;
            let result=a*x + b*y;
            window.correctAnswer={
                correct: result.toString(),
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
export function generateNumberSets(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["identify", "classify", "compare"];
    let type=types[Math.floor(Math.random()*types.length)];
    let hint="";
    switch (type){
        case "identify":{
            let num=Math.random()*10;
            let desc="";
            if (Number.isInteger(num)&&num>0) desc="natural, whole, integer, rational, real";
            else if (Number.isInteger(num)&&num<0) desc="integer, rational, real";
            else if (num===Math.floor(num)) desc="rational, real";
            else desc="irrational, real";
            questionArea.innerHTML=`Identify all number sets for \\( ${num.toFixed(2)} \\) (natural, whole, integer, rational, irrational, real).`;
            window.correctAnswer={
                correct: desc,
                alternate: desc
            };
            hint="Enter sets separated by commas";
            break;
        }
        case "classify":{
            let num=Math.floor(Math.random()*10)-5;
            questionArea.innerHTML=`Classify \\( ${num} \\) as natural, whole, integer, rational, irrational, or real.`;
            let desc= num>0?"natural, whole, integer, rational, real" : "integer, rational, real";
            window.correctAnswer={
                correct: desc,
                alternate: desc
            };
            hint="Enter sets";
            break;
        }
        case "compare":{
            let a=Math.random()*10;
            let b=Math.random()*10;
            questionArea.innerHTML=`Compare: \\( ${a.toFixed(2)} \\) ___ \\( ${b.toFixed(2)} \\) (enter <, >, or =)`;
            let comp=a<b ? "<" : a>b ? ">" : "=";
            window.correctAnswer={
                correct: comp,
                alternate: comp
            };
            hint="Enter <, >, or =";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateProperties(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["commutative", "associative", "distributive", "identity", "inverse"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(_difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let c=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "commutative":{
            questionArea.innerHTML=`Which property is illustrated? \\( ${a} + ${b}=${b} + ${a} \\)`;
            window.correctAnswer={
                correct: "commutative property of addition",
                alternate: "commutative"
            };
            hint="Enter the property name";
            break;
        }
        case "associative":{
            questionArea.innerHTML=`Which property is illustrated? \\( (${a} + ${b}) + ${c}=${a} + (${b} + ${c}) \\)`;
            window.correctAnswer={
                correct: "associative property of addition",
                alternate: "associative"
            };
            hint="Enter the property name";
            break;
        }
        case "distributive":{
            questionArea.innerHTML=`Which property is illustrated? \\( ${a}(${b} + ${c})=${a}${b} + ${a}${c} \\)`;
            window.correctAnswer={
                correct: "distributive property",
                alternate: "distributive"
            };
            hint="Enter the property name";
            break;
        }
        case "identity":{
            questionArea.innerHTML=`Which property is illustrated? \\( ${a} + 0=${a} \\)`;
            window.correctAnswer={
                correct: "identity property of addition",
                alternate: "identity"
            };
            hint="Enter the property name";
            break;
        }
        case "inverse":{
            questionArea.innerHTML=`Which property is illustrated? \\( ${a} + (-${a})=0 \\)`;
            window.correctAnswer={
                correct: "inverse property of addition",
                alternate: "inverse"
            };
            hint="Enter the property name";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateOrderOfOperations(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["basic", "with_exponents", "with_parentheses"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 5);
    let hint="";
    let a=Math.floor(Math.random()*maxVal)+1;
    let b=Math.floor(Math.random()*maxVal)+1;
    let c=Math.floor(Math.random()*maxVal)+1;
    switch (type){
        case "basic":{
            let expr=`${a} + ${b} \\times ${c}`;
            let result=a + b*c;
            questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "with_exponents":{
            let expr=`${a} + ${b}^2`;
            let result=a + b*b;
            questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: result.toString(),
                alternate: result.toString()
            };
            hint="Enter a number";
            break;
        }
        case "with_parentheses":{
            let expr=`(${a} + ${b}) \\times ${c}`;
            let result=(a+b)*c;
            questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
            window.correctAnswer={
                correct: result.toString(),
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