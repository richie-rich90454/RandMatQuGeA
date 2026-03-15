/**
 * Generates a question about basic algebraic properties (commutative, associative, distributive, identity, inverse).
 * @fileoverview Algebraic properties identification. Sets window.correctAnswer with plain text property name.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateProperties(_difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["commutative","associative","distributive","identity","inverse"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(_difficulty,5);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "commutative":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a} + ${b}=${b} + ${a} \\)`;
			window.correctAnswer={
				correct: "commutative property of addition",
				alternate: "commutative",
				display: "commutative property of addition"
			};
			hint="Enter the property name";
			break;
		}
		case "associative":{
			questionArea.innerHTML=`Which property is illustrated? \\( (${a} + ${b}) + ${c}=${a} + (${b} + ${c}) \\)`;
			window.correctAnswer={
				correct: "associative property of addition",
				alternate: "associative",
				display: "associative property of addition"
			};
			hint="Enter the property name";
			break;
		}
		case "distributive":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a}(${b} + ${c})=${a}${b} + ${a}${c} \\)`;
			window.correctAnswer={
				correct: "distributive property",
				alternate: "distributive",
				display: "distributive property"
			};
			hint="Enter the property name";
			break;
		}
		case "identity":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a} + 0=${a} \\)`;
			window.correctAnswer={
				correct: "identity property of addition",
				alternate: "identity",
				display: "identity property of addition"
			};
			hint="Enter the property name";
			break;
		}
		case "inverse":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a} + (-${a})=0 \\)`;
			window.correctAnswer={
				correct: "inverse property of addition",
				alternate: "inverse",
				display: "inverse property of addition"
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