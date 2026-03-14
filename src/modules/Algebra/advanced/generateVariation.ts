import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateVariation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["direct", "inverse", "joint"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 10);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	let y=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "direct":{
			questionArea.innerHTML=`If y varies directly with x, and y=${a} when x=${b}, find y when x=${x}.`;
			let k=a/b;
			let result=k*x;
			window.correctAnswer={
				correct: result.toFixed(2),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "inverse":{
			questionArea.innerHTML=`If y varies inversely with x, and y=${a} when x=${b}, find y when x=${x}.`;
			let k=a*b;
			let result=k/x;
			window.correctAnswer={
				correct: result.toFixed(2),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "joint":{
			let c=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`If z varies jointly with x and y, and z=${a} when x=${b}, y=${c}, find z when x=${x}, y=${y}.`;
			let k=a/(b*c);
			let result=k*x*y;
			window.correctAnswer={
				correct: result.toFixed(2),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}