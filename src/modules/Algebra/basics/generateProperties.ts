import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about basic algebraic properties (commutative, associative, distributive, identity, inverse).
 * @param _difficulty - Optional difficulty level (unused, kept for consistency).
 * @returns void
 */
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