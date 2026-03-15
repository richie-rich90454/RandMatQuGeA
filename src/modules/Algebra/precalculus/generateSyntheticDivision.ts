//generateSyntheticDivision
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about synthetic division: dividing polynomials, finding remainder, or checking factors.
 * @param difficulty - Optional difficulty level to adjust coefficients.
 * @returns void
 */
export function generateSyntheticDivision(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["divide","remainder","factor"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	const d=Math.floor(Math.random()*max)+1;

	switch (type){
		case "divide":{
			const dividend=`${a}x^3 + ${b}x^2 + ${c}x + ${d}`;
			const divisor=`x - ${a}`;
			questionArea.innerHTML=`Use synthetic division to divide \\( ${dividend} \\) by \\( ${divisor} \\). (Enter quotient)`;
			const coeffs=[a,b,c,d];
			const root=a;
			const result: number[]=[];
			let carry=0;
			for (let i=0; i<coeffs.length; i++){
				carry=coeffs[i]+carry*root;
				result.push(carry);
			}
			const quotient=`${result[0]}x^2 + ${result[1]}x + ${result[2]}`;
			window.correctAnswer={
				correct:quotient,
				alternate:quotient,
				display:quotient
			};
			hint="Enter polynomial";
			break;
		}
		case "remainder":{
			const dividend=`${a}x^2 + ${b}x + ${c}`;
			const divisor=`x - ${d}`;
			const remainder=a*d*d+b*d+c;
			const ans=remainder.toString();
			questionArea.innerHTML=`Use the Remainder Theorem to find the remainder when \\( ${dividend} \\) is divided by \\( ${divisor} \\).`;
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter a number";
			break;
		}
		case "factor":{
			const root=a;
			const poly=`x^3 - ${a}x^2 + ${b}x - ${a*b}`;
			questionArea.innerHTML=`Is \\( x - ${root} \\) a factor of \\( ${poly} \\)? (yes/no)`;
			window.correctAnswer={
				correct:"yes",
				alternate:"yes",
				display:"yes"
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