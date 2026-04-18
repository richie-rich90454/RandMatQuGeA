import {questionArea} from "../../../script.js";
/**
 * Generates a question about number sets (identify, classify, or compare numbers) with MCQ distractors.
 * @fileoverview Number sets identification. Sets window.correctAnswer with plain text description and plausible wrong answers.
 * @date 2026-04-18
 */
export function generateNumberSets(_difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["identify","classify","compare"];
	let type=types[Math.floor(Math.random()*types.length)];
	let expectedFormat="Enter the set names separated by commas";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "identify":{
			let num=Math.random()*10;
			let desc="";
			if(Number.isInteger(num)&&num>0) desc="natural, whole, integer, rational, real";
			else if(Number.isInteger(num)&&num<0) desc="integer, rational, real";
			else if(num===Math.floor(num)) desc="rational, real";
			else desc="irrational, real";
			correct=desc;
			alternate=desc;
			display=desc;
			mathExpression=`Identify all number sets for \\( ${num.toFixed(2)} \\) (natural, whole, integer, rational, irrational, real).`;
			if(desc.includes("natural")){
				choices=[desc,"natural, whole, integer, real","integer, rational, real","rational, real","irrational, real"];
			}
			else if(desc.includes("integer")){
				choices=[desc,"natural, whole, integer, rational, real","rational, real","irrational, real","whole, integer, rational, real"];
			}
			else if(desc.includes("rational")){
				choices=[desc,"natural, whole, integer, rational, real","integer, rational, real","irrational, real","real"];
			}
			else{
				choices=[desc,"natural, whole, integer, rational, real","integer, rational, real","rational, real","real"];
			}
			break;
		}
		case "classify":{
			let num=Math.floor(Math.random()*10)-5;
			let desc= num>0?"natural, whole, integer, rational, real" : "integer, rational, real";
			correct=desc;
			alternate=desc;
			display=desc;
			mathExpression=`Classify \\( ${num} \\) as natural, whole, integer, rational, irrational, or real.`;
			if(num>0){
				choices=[desc,"natural, whole, integer, real","integer, rational, real","whole, integer, rational, real","natural, integer, rational, real"];
			}
			else{
				choices=[desc,"integer, rational, real","natural, whole, integer, rational, real","whole, integer, rational, real","real"];
			}
			break;
		}
		case "compare":{
			let a=Math.random()*10;
			let b=Math.random()*10;
			let comp=a<b?"<":a>b?">":"=";
			correct=comp;
			alternate=comp;
			display=comp;
			mathExpression=`Compare: \\( ${a.toFixed(2)} \\) ___ \\( ${b.toFixed(2)} \\) (enter <, >, or =)`;
			choices=["<",">","="];
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=expectedFormat;
}