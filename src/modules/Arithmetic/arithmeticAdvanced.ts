import {questionArea} from "../../script.js";
import {getMaxForDifficulty, isPrime, gcd} from "./arithmeticUtils.js";

export function generateWholeNumberPlaceValue(difficulty?: string): void{
    if (!questionArea) return;
    let types=["place_value", "expanded_form", "rounding"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxNum=getMaxForDifficulty(difficulty, 9999);
    let num=Math.floor(Math.random()*maxNum)+100;
    let hint="";
    switch (type){
        case "place_value":{
            let digits=num.toString().split("");
            let placeIndex=Math.floor(Math.random()*digits.length);
            let placeValue=parseInt(digits[placeIndex]) * Math.pow(10, digits.length-1-placeIndex);
            questionArea.innerHTML=`What is the place value of the digit ${digits[placeIndex]} in ${num}? (e.g., 500 or "hundreds")`;
            window.correctAnswer={
                correct: placeValue.toString(),
                alternate: placeValue.toString()
            };
            hint="Enter a number (e.g., 500)";
            break;
        }
        case "expanded_form":{
            let expanded=num.toString().split("").map((d, i) => parseInt(d) * Math.pow(10, num.toString().length-1-i)).filter(v=>v!==0).join(" + ");
            questionArea.innerHTML=`Write ${num} in expanded form.`;
            window.correctAnswer={
                correct: expanded,
                alternate: expanded
            };
            hint="Enter as 200 + 30 + 4";
            break;
        }
        case "rounding":{
            let place=Math.pow(10, Math.floor(Math.random()*3)+1);
            let rounded=Math.round(num/place)*place;
            questionArea.innerHTML=`Round ${num} to the nearest ${place===10?"ten":place===100?"hundred":"thousand"}.`;
            window.correctAnswer={
                correct: rounded.toString(),
                alternate: rounded.toString()
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
export function generateNumberLineOrdering(difficulty?: string): void{
    if (!questionArea) return;
    let range=getMaxForDifficulty(difficulty, 20);
    let numbers: number[]=[];
    for (let i=0; i<4; i++){
        numbers.push(Math.floor(Math.random()*range*2)-range);
    }
    if (!numbers.some(n=>n<0)) numbers[0]=-numbers[0];
    if (!numbers.some(n=>n>0)) numbers[1]=Math.abs(numbers[1])+1;
    let sorted=[...numbers].sort((a,b)=>a-b);
    questionArea.innerHTML=`Order the numbers from least to greatest: ${numbers.join(", ")}.`;
    window.correctAnswer={
        correct: sorted.join(", "),
        alternate: sorted.join(", ")
    };
    window.expectedFormat="Enter numbers separated by commas, e.g., -3, 0, 5, 7";
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateDivisibility(difficulty?: string): void{
    if (!questionArea) return;
    let types=["rule", "identify_prime", "divisible_by"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxNum=getMaxForDifficulty(difficulty, 100);
    let num=Math.floor(Math.random()*maxNum)+2;
    let hint="";
    switch (type){
        case "rule":{
            let divisors=[2,3,5,9,10];
            let d=divisors[Math.floor(Math.random()*divisors.length)];
            let rule="";
            if (d===2) rule="A number is divisible by 2 if its last digit is even.";
            else if (d===3) rule="A number is divisible by 3 if the sum of its digits is divisible by 3.";
            else if (d===5) rule="A number is divisible by 5 if its last digit is 0 or 5.";
            else if (d===9) rule="A number is divisible by 9 if the sum of its digits is divisible by 9.";
            else if (d===10) rule="A number is divisible by 10 if its last digit is 0.";
            questionArea.innerHTML=`State the divisibility rule for ${d}.`;
            window.correctAnswer={
                correct: rule,
                alternate: rule
            };
            hint="Enter the rule in your own words";
            break;
        }
        case "identify_prime":{
            let isPrimeNum=isPrime(num);
            questionArea.innerHTML=`Is ${num} prime or composite?`;
            window.correctAnswer={
                correct: isPrimeNum?"prime":"composite",
                alternate: isPrimeNum?"prime":"composite"
            };
            hint="Enter 'prime' or 'composite'";
            break;
        }
        case "divisible_by":{
            let divisors=[2,3,4,5,6,8,9,10];
            let d=divisors[Math.floor(Math.random()*divisors.length)];
            if (Math.random()<0.5){
                num=Math.floor(num/d)*d;
                if (num===0) num=d;
            }
            let isDivisible=(num%d===0);
            questionArea.innerHTML=`Is ${num} divisible by ${d}? (yes/no)`;
            window.correctAnswer={
                correct: isDivisible?"yes":"no",
                alternate: isDivisible?"yes":"no"
            };
            hint="Enter 'yes' or 'no'";
            break;
        }
    }
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateGCFLCM(difficulty?: string): void{
    if (!questionArea) return;
    let types=["gcf", "lcm", "word"];
    let type=types[Math.floor(Math.random()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty, 30);
    let a=Math.floor(Math.random()*maxVal)+5;
    let b=Math.floor(Math.random()*maxVal)+5;
    let hint="";
    switch (type){
        case "gcf":{
            let g=gcd(a,b);
            questionArea.innerHTML=`Find the greatest common factor (GCF) of ${a} and ${b}.`;
            window.correctAnswer={
                correct: g.toString(),
                alternate: g.toString()
            };
            hint="Enter a number";
            break;
        }
        case "lcm":{
            let l=(a*b)/gcd(a,b);
            questionArea.innerHTML=`Find the least common multiple (LCM) of ${a} and ${b}.`;
            window.correctAnswer={
                correct: l.toString(),
                alternate: l.toString()
            };
            hint="Enter a number";
            break;
        }
        case "word":{
            let g=gcd(a,b);
            questionArea.innerHTML=`Two numbers are ${a} and ${b}. What is the largest number that divides both evenly?`;
            window.correctAnswer={
                correct: g.toString(),
                alternate: g.toString()
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