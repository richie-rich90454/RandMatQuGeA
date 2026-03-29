/**
 * Generates a fraction arithmetic question (add, subtract, multiply, divide, simplify, or convert decimal to fraction) with MCQ distractors.
 * @fileoverview Fraction operations. Sets window.correctAnswer with plain fraction string and LaTeX display, plus plausible wrong answers.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {gcd, getMaxForDifficulty} from "../algebraUtils.js";
export function generateFraction(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["add","subtract","multiply","divide","simplify","convert"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,12);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
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
			let g=gcd(sumNum,commonDen);
			let simplifiedNum=sumNum/g;
			let simplifiedDen=commonDen/g;
			let plain=`${simplifiedNum}/${simplifiedDen}`;
			let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
			correct=plain;
			alternate=`${sumNum}/${commonDen}`;
			display=latex;
			questionArea.innerHTML=`Add: \\( \\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}} \\)`;
			choices=[correct];
			choices.push(`${(simplifiedNum+1)}/${simplifiedDen}`);
			choices.push(`${simplifiedNum}/${(simplifiedDen+1)}`);
			choices.push(`${(sumNum+1)}/${commonDen}`);
			choices.push(`${(sumNum)}/${(commonDen+1)}`);
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
			questionArea.innerHTML=`Subtract: \\( \\frac{${num1}}{${den1}} - \\frac{${num2}}{${den2}} \\)`;
			choices=[correct];
			choices.push(`${(simplifiedNum+1)}/${simplifiedDen}`);
			choices.push(`${simplifiedNum}/${(simplifiedDen+1)}`);
			choices.push(`${(diffNum+1)}/${commonDen}`);
			choices.push(`${(diffNum)}/${(commonDen+1)}`);
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
			questionArea.innerHTML=`Multiply: \\( \\frac{${num1}}{${den1}} \\times \\frac{${num2}}{${den2}} \\)`;
			choices=[correct];
			choices.push(`${(simplifiedNum+1)}/${simplifiedDen}`);
			choices.push(`${simplifiedNum}/${(simplifiedDen+1)}`);
			choices.push(`${(prodNum+1)}/${prodDen}`);
			choices.push(`${(prodNum)}/${(prodDen+1)}`);
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
			questionArea.innerHTML=`Divide: \\( \\frac{${num1}}{${den1}} \\div \\frac{${num2}}{${den2}} \\)`;
			choices=[correct];
			choices.push(`${(simplifiedNum+1)}/${simplifiedDen}`);
			choices.push(`${simplifiedNum}/${(simplifiedDen+1)}`);
			choices.push(`${(quotNum+1)}/${quotDen}`);
			choices.push(`${(quotNum)}/${(quotDen+1)}`);
			break;
		}
		case "simplify":{
			let num=Math.floor(Math.random()*30)+2;
			let den=Math.floor(Math.random()*30)+2;
			let g=gcd(num,den);
			let simplifiedNum=num/g;
			let simplifiedDen=den/g;
			let plain=`${simplifiedNum}/${simplifiedDen}`;
			let latex=`\\frac{${simplifiedNum}}{${simplifiedDen}}`;
			correct=plain;
			alternate=plain;
			display=latex;
			questionArea.innerHTML=`Simplify: \\( \\frac{${num}}{${den}} \\)`;
			choices=[correct];
			choices.push(`${(simplifiedNum+1)}/${simplifiedDen}`);
			choices.push(`${simplifiedNum}/${(simplifiedDen+1)}`);
			choices.push(`${num}/${den}`);
			choices.push(`${(num+1)}/${den}`);
			break;
		}
		case "convert":{
			let decimal=(Math.random()*10).toFixed(2);
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
			questionArea.innerHTML=`Convert \\( ${decimal} \\) to a fraction in simplest form.`;
			choices=[correct];
			choices.push(`${(simplifiedNum+1)}/${simplifiedDen}`);
			choices.push(`${simplifiedNum}/${(simplifiedDen+1)}`);
			choices.push(`${num}/${den}`);
			choices.push(`${(num+1)}/${den}`);
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correct)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
}