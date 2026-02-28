import {questionArea} from "../../script.js";
import {getRangeForDifficulty} from "./arithmeticUtils.js";

export function generateAddition(difficulty?: string): void{
    if (!questionArea) return;
    let range=getRangeForDifficulty(difficulty);
    let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(3));
    let num2: number=parseFloat((Math.random()*range.max).toFixed(3));
    questionArea.innerHTML=`\$${num1}+${num2}=\$`;
    window.correctAnswer={
        correct: (num1+num2).toFixed(3),
        alternate: (num1+num2).toFixed(3)
    };
    window.expectedFormat="Enter a number (up to 3 decimals)";
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateSubtraction(difficulty?: string): void{
    if (!questionArea) return;
    let range=getRangeForDifficulty(difficulty);
    let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(3));
    let num2: number=parseFloat((Math.random()*range.max).toFixed(3));
    questionArea.innerHTML=`\$${num1}-${num2}=\$`;
    window.correctAnswer={
        correct: (num1-num2).toFixed(3),
        alternate: (num1-num2).toFixed(3)
    };
    window.expectedFormat="Enter a number (up to 3 decimals)";
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateMultiplication(difficulty?: string): void{
    if (!questionArea) return;
    let range=getRangeForDifficulty(difficulty);
    let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(2));
    let num2: number=parseFloat((Math.random()*range.max).toFixed(2));
    questionArea.innerHTML=`\$${num1} \\times ${num2}=\$<br>Round your answer to two decimal places`;
    let actualAnswer: number=num1*num2;
    window.correctAnswer={
        correct: (Math.round(actualAnswer*100)/100).toFixed(2),
        alternate: actualAnswer.toFixed(5)
    };
    window.expectedFormat="Enter a number rounded to 2 decimal places";
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateDivision(difficulty?: string): void{
    if (!questionArea) return;
    let range=getRangeForDifficulty(difficulty);
    let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(2));
    let num2: number=parseFloat((Math.random()*range.max).toFixed(2));
    questionArea.innerHTML=`\$${num1} \\div ${num2}=\$<br>Round your answer to two decimal places`;
    let actualAnswer: number=num1/num2;
    window.correctAnswer={
        correct: (Math.round(actualAnswer*100)/100).toFixed(2),
        alternate: actualAnswer.toFixed(5)
    };
    window.expectedFormat="Enter a number rounded to 2 decimal places";
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}