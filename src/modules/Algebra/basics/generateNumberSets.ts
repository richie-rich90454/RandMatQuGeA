/**
 * Generates a question about number sets (identify, classify, or compare numbers).
 * @fileoverview Number sets identification. Sets window.correctAnswer with plain text description.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";

export function generateNumberSets(_difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["identify","classify","compare"];
	let type=types[Math.floor(Math.random()*types.length)];
	let hint="";
	switch (type){
		case "identify":{
			let num=Math.random()*10;
			let desc="";
			if (Number.isInteger(num)&&num>0) desc="natural, whole, integer, rational, real";
			else if (Number.isInteger(num)&&num<0) desc="integer, rational, real";
			else if (num===Math.floor(num)) desc="rational, real";
			else desc="irrational, real";
			questionArea.innerHTML=`Identify all number sets for \\( ${num.toFixed(2)} \\) (natural, whole, integer, rational, irrational, real).`;
			window.correctAnswer={
				correct: desc,
				alternate: desc,
				display: desc
			};
			hint="Enter sets separated by commas";
			break;
		}
		case "classify":{
			let num=Math.floor(Math.random()*10)-5;
			questionArea.innerHTML=`Classify \\( ${num} \\) as natural, whole, integer, rational, irrational, or real.`;
			let desc= num>0?"natural, whole, integer, rational, real" : "integer, rational, real";
			window.correctAnswer={
				correct: desc,
				alternate: desc,
				display: desc
			};
			hint="Enter sets";
			break;
		}
		case "compare":{
			let a=Math.random()*10;
			let b=Math.random()*10;
			questionArea.innerHTML=`Compare: \\( ${a.toFixed(2)} \\) ___ \\( ${b.toFixed(2)} \\) (enter <, >, or =)`;
			let comp=a<b ? "<" : a>b ? ">" : "=";
			window.correctAnswer={
				correct: comp,
				alternate: comp,
				display: comp
			};
			hint="Enter <, >, or =";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}