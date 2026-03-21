/**
 * Function transformations: translation, reflection, stretch.
 * @fileoverview Generates function transformation questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateTransformations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["translation","reflection","stretch"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";
	const h=Math.floor(Math.random()*max)+1;
	const k=Math.floor(Math.random()*max)+1;
	const a=Math.floor(Math.random()*2)+1;
	switch (type){
		case "translation":{
			questionArea.innerHTML=`If the graph of \\( y=x^2 \\) is shifted right by ${h} and up by ${k}, what is the new equation?`;
			const eq=`y = (x - ${h})^2 + ${k}`;
			window.correctAnswer={
				correct:eq,
				alternate:eq,
				display:eq
			};
			hint="Enter as y = (x-h)^2 + k";
			break;
		}
		case "reflection":{
			const axis=Math.random()<0.5?"x-axis":"y-axis";
			questionArea.innerHTML=`If the graph of \\( y=\\sqrt{x} \\) is reflected across the ${axis}, what is the new equation?`;
			let eq=axis==="x-axis"?"y = -√x":"y = √(-x)";
			window.correctAnswer={
				correct:eq,
				alternate:eq,
				display:eq
			};
			hint="Enter equation";
			break;
		}
		case "stretch":{
			questionArea.innerHTML=`If the graph of \\( y=|x| \\) is stretched vertically by a factor of ${a}, what is the new equation?`;
			const eq=`y = ${a}|x|`;
			window.correctAnswer={
				correct:eq,
				alternate:eq,
				display:eq
			};
			hint="Enter equation";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}