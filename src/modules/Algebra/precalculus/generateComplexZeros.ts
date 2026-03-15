//generateComplexZeros
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about complex zeros: Fundamental Theorem of Algebra,
 * conjugate pairs, or factoring over complex numbers.
 * @param difficulty - Optional difficulty level to adjust numbers.
 * @returns void
 */
export function generateComplexZeros(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["fundamental","conjugate","factor"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,3);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;

	switch (type){
		case "fundamental":{
			const deg=Math.floor(Math.random()*2)+3;
			questionArea.innerHTML=`According to the Fundamental Theorem of Algebra, how many zeros does a polynomial of degree ${deg} have (counting multiplicity)?`;
			const ans=deg.toString();
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter a number";
			break;
		}
		case "conjugate":{
			questionArea.innerHTML=`If a polynomial with real coefficients has a zero at \\( ${a} + ${b}i \\), what other zero must it have?`;
			const conj=`${a} - ${b}i`;
			window.correctAnswer={
				correct:conj,
				alternate:conj,
				display:conj
			};
			hint="Enter as a+bi";
			break;
		}
		case "factor":{
			const root1=a;
			const root2=b;
			const poly=`x^2 - ${root1+root2}x + ${root1*root2}`;
			questionArea.innerHTML=`Factor \\( ${poly} \\) over the complex numbers.`;
			const factored=`(x - ${root1})(x - ${root2})`;
			window.correctAnswer={
				correct:factored,
				alternate:factored,
				display:factored
			};
			hint="Enter as (x - a)(x - b)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}