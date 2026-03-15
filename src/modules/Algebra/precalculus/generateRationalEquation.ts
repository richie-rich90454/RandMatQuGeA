//generateRationalEquation
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a rational equation question (simple rational equation or one with extraneous solutions).
 * @param difficulty - Optional difficulty level to adjust numbers.
 * @returns void
 */
export function generateRationalEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,5);
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	const type=Math.random()<0.5?"simple":"extraneous";
	let hint="";

	if (type==="simple"){
		const d=Math.floor(Math.random()*max)+1;
		const e=Math.floor(Math.random()*max)+1;
		const numA=Math.floor(Math.random()*max)+1;
		const numB=Math.floor(Math.random()*max)+1;
		const denC=Math.floor(Math.random()*max)+1;
		const denD=d;
		const x=(e*denD-numB)/(numA-e*denC);
		const ans=x.toFixed(2);
		questionArea.innerHTML=`Solve: \\( \\frac{${numA}x + ${numB}}{${denC}x + ${denD}} = ${e} \\)`;
		window.correctAnswer={
			correct:ans,
			alternate:x.toString(),
			display:ans
		};
		hint="Enter decimal answer";
	}else{
		const extraneousVal=a;
		const eq=`\\frac{1}{x - ${extraneousVal}} = \\frac{${b}}{x - ${extraneousVal}} + ${c}`;
		questionArea.innerHTML=`Solve and check for extraneous solutions: \\( ${eq} \\)`;
		window.correctAnswer={
			correct:"no solution",
			alternate:"no solution",
			display:"no solution"
		};
		hint="Enter 'no solution' or the solution";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}