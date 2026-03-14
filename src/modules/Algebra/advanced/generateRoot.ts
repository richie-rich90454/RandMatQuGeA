import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRoot(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let maxRoot=getMaxForDifficulty(difficulty, 4);
	let maxBase=getMaxForDifficulty(difficulty, 10);
	let root=Math.floor((Math.random()*maxRoot))+2;
	let base=Math.floor((Math.random()*maxBase))+1;
	let radicand=Math.pow(base, root);
	let rootExpression="";
	if (root===2){
		rootExpression=`\\[ \\sqrt{${radicand}}=? \\]`;
	}
	else{
		rootExpression=`\\[ \\sqrt[${root}]{${radicand}}=? \\]`;
	}
	let correctRoot=base.toString();
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=rootExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: correctRoot,
		alternate: correctRoot
	};
	window.expectedFormat="Enter a whole number";
}