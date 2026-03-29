/**
 * Complex zeros: Fundamental Theorem, conjugate pairs, factoring.
 * @fileoverview Generates complex zero questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateComplexZeros(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["fundamental","conjugate","factor"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,3);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	switch (type){
		case "fundamental":{
			const deg=Math.floor(Math.random()*2)+3;
			questionArea.innerHTML=`According to the Fundamental Theorem of Algebra, how many zeros does a polynomial of degree ${deg} have (counting multiplicity)?`;
			correct=deg.toString();
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push((deg+1).toString());
			choices.push((deg-1).toString());
			choices.push((deg*2).toString());
			choices.push((Math.floor(deg/2)).toString());
			hint="Enter a number";
			break;
		}
		case "conjugate":{
			questionArea.innerHTML=`If a polynomial with real coefficients has a zero at \\( ${a} + ${b}i \\), what other zero must it have?`;
			const conj=`${a} - ${b}i`;
			correct=conj;
			alternate=conj;
			display=conj;
			choices=[correct];
			choices.push(`${a} + ${b}i`);
			choices.push(`${-a} - ${b}i`);
			choices.push(`${-a} + ${b}i`);
			choices.push(`${a} + ${b+1}i`);
			hint="Enter as a+bi";
			break;
		}
		case "factor":{
			const root1=a;
			const root2=b;
			const poly=`x^2 - ${root1+root2}x + ${root1*root2}`;
			questionArea.innerHTML=`Factor \\( ${poly} \\) over the complex numbers.`;
			const factored=`(x - ${root1})(x - ${root2})`;
			correct=factored;
			alternate=factored;
			display=factored;
			choices=[correct];
			choices.push(`(x + ${root1})(x + ${root2})`);
			choices.push(`(x - ${root1})(x + ${root2})`);
			choices.push(`(x + ${root1})(x - ${root2})`);
			choices.push(`(x - ${root1+1})(x - ${root2})`);
			hint="Enter as (x - a)(x - b)";
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
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}