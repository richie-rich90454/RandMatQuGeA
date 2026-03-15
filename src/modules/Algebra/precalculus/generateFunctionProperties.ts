//generateFunctionProperties
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about function properties: continuity, extrema, symmetry, asymptotes, or end behavior.
 * @param difficulty - Optional difficulty level to adjust numbers.
 * @returns void
 */
export function generateFunctionProperties(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["continuity","extrema","symmetry","asymptotes","endbehavior"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	switch (type){
		case "continuity":{
			const a=Math.floor(Math.random()*max)+1;
			const functions=[
				`f(x)=\\frac{1}{x-${a}}`,
				`f(x)=\\sqrt{x-${a}}`,
				`f(x)=x^2+${a}`
			];
			const chosen=functions[Math.floor(Math.random()*functions.length)];
			questionArea.innerHTML=`Where is \\( ${chosen} \\) discontinuous? (Enter x-value or 'none' or interval)`;
			let answer="";
			if (chosen.includes("frac")) answer=`x = ${a}`;
			else if (chosen.includes("sqrt")) answer=`x < ${a}`;
			else answer="none";
			window.correctAnswer={
				correct:answer,
				alternate:answer,
				display:answer
			};
			hint="Enter x value, interval, or 'none'";
			break;
		}
		case "extrema":{
			const a=Math.floor(Math.random()*max)+1;
			const b=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`Does \\( f(x)=x^2 - ${a}x + ${b} \\) have a local minimum or maximum? (Enter 'min' or 'max')`;
			window.correctAnswer={
				correct:"min",
				alternate:"minimum",
				display:"min"
			};
			hint="Enter 'min' or 'max'";
			break;
		}
		case "symmetry":{
			const functions=[
				{expr:"f(x)=x^2",type:"even"},
				{expr:"f(x)=x^3",type:"odd"},
				{expr:"f(x)=x^2+x",type:"neither"}
			];
			const chosen=functions[Math.floor(Math.random()*functions.length)];
			questionArea.innerHTML=`Is \\( ${chosen.expr} \\) even, odd, or neither?`;
			window.correctAnswer={
				correct:chosen.type,
				alternate:chosen.type,
				display:chosen.type
			};
			hint="Enter 'even', 'odd', or 'neither'";
			break;
		}
		case "asymptotes":{
			const a=Math.floor(Math.random()*max)+1;
			const b=Math.floor(Math.random()*max)+1;
			const expr=`\\frac{${a}x+${b}}{x-${a}}`;
			questionArea.innerHTML=`Find the vertical asymptote of \\( ${expr} \\). (Enter x=value)`;
			const ans=`x=${a}`;
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter x = number";
			break;
		}
		case "endbehavior":{
			const a=Math.floor(Math.random()*2)+1;
			const deg=Math.floor(Math.random()*2)+3;
			const sign=a===1?"positive":"negative";
			const evenOdd=deg%2===0?"even":"odd";
			let desc="";
			if (evenOdd==="even"){
				desc=sign==="positive"?"both ends up":"both ends down";
			}else{
				desc=sign==="positive"?"left down, right up":"left up, right down";
			}
			questionArea.innerHTML=`Describe the end behavior of a polynomial with leading coefficient ${sign} and degree ${deg}.`;
			window.correctAnswer={
				correct:desc,
				alternate:desc,
				display:desc
			};
			hint="Enter description like 'both ends up'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}