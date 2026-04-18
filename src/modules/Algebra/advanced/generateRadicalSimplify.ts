import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
function isSquareFree(n: number): boolean{
	if(n<2) return true;
	for(let i=2;i*i<=n;i++){
		if(n%(i*i)===0) return false;
	}
	return true;
}
function simplifyRadical(radicand: number): string{
	if(radicand<0) return `\\sqrt{${radicand}}`;
	let s=1;
	let r=radicand;
	for(let i=Math.floor(Math.sqrt(radicand));i>=2;i--){
		if(radicand%(i*i)===0){
			s=i;
			r=radicand/(i*i);
			break;
		}
	}
	if(s===1){
		if(r===1) return "1";
		return `\\sqrt{${r}}`;
	}
	if(r===1) return `${s}`;
	return `${s}\\sqrt{${r}}`;
}
/**
 * Radical simplification: simplify, add, subtract, multiply, divide, rationalize.
 * @fileoverview Generates radical simplification questions with MCQ distractors. Sets window.correctAnswer with LaTeX expression and display.
 * @date 2026-04-18
 */
export function generateRadicalSimplify(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["simplify","add","subtract","multiply","divide","rationalize"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let expectedFormat="Enter a simplified radical expression";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "simplify":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			while(!isSquareFree(b)) b=Math.floor(Math.random()*maxVal)+1;
			let radicand=a*a*b;
			correct=`${a}\\sqrt{${b}}`;
			alternate=`${a}√${b}`;
			display=correct;
			mathExpression=`\\( \\sqrt{${radicand}} \\)`;
			choices=[correct];
			choices.push(`${a+1}\\sqrt{${b}}`);
			choices.push(`${a-1}\\sqrt{${b}}`);
			choices.push(`\\sqrt{${a*b}}`);
			choices.push(`${a}\\sqrt{${b+1}}`);
			break;
		}
		case "add":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let c=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			while(!isSquareFree(b)) b=Math.floor(Math.random()*maxVal)+1;
			let coeff=a+c;
			correct=`${coeff}\\sqrt{${b}}`;
			alternate=`${coeff}√${b}`;
			display=correct;
			mathExpression=`\\( ${a}\\sqrt{${b}} + ${c}\\sqrt{${b}} \\)`;
			choices=[correct];
			choices.push(`${coeff+1}\\sqrt{${b}}`);
			choices.push(`${coeff-1}\\sqrt{${b}}`);
			choices.push(`${a}\\sqrt{${b}}`);
			choices.push(`${c}\\sqrt{${b}}`);
			break;
		}
		case "subtract":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let c=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			while(!isSquareFree(b)) b=Math.floor(Math.random()*maxVal)+1;
			let coeff=a-c;
			correct=`${coeff}\\sqrt{${b}}`;
			alternate=`${coeff}√${b}`;
			display=correct;
			mathExpression=`\\( ${a}\\sqrt{${b}} - ${c}\\sqrt{${b}} \\)`;
			choices=[correct];
			choices.push(`${coeff+1}\\sqrt{${b}}`);
			choices.push(`${coeff-1}\\sqrt{${b}}`);
			choices.push(`${a}\\sqrt{${b}}`);
			choices.push(`-${c}\\sqrt{${b}}`);
			break;
		}
		case "multiply":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			let product=a*b;
			let ans=simplifyRadical(product);
			correct=ans;
			alternate=ans;
			display=ans;
			mathExpression=`\\( \\sqrt{${a}} \\times \\sqrt{${b}} \\)`;
			choices=[correct];
			let wrongAns=simplifyRadical(product+1);
			choices.push(wrongAns);
			wrongAns=simplifyRadical(product-1);
			choices.push(wrongAns);
			choices.push(`\\sqrt{${a*b}}`);
			choices.push(`${Math.sqrt(a*b).toFixed(2)}`);
			break;
		}
		case "divide":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			let num=Math.sqrt(a);
			let den=Math.sqrt(b);
			let ans: string;
			if(Number.isInteger(num)&&Number.isInteger(den)){
				ans=`\\frac{${num}}{${den}}`;
			}
			else{
				ans=`\\frac{\\sqrt{${a*b}}}{${b}}`;
			}
			correct=ans;
			alternate=ans;
			display=ans;
			mathExpression=`\\( \\frac{\\sqrt{${a}}}{\\sqrt{${b}}} \\)`;
			choices=[correct];
			let wrongAns1=`\\frac{\\sqrt{${a}}}{${b}}`;
			let wrongAns2=`\\frac{\\sqrt{${a*b}}}{${a}}`;
			choices.push(wrongAns1);
			choices.push(wrongAns2);
			choices.push(`\\frac{${Math.sqrt(a).toFixed(2)}}{${Math.sqrt(b).toFixed(2)}}`);
			choices.push(`\\sqrt{${a/b}}`);
			break;
		}
		case "rationalize":{
			let a=Math.floor(Math.random()*maxVal)+1;
			correct=`\\frac{\\sqrt{${a}}}{${a}}`;
			alternate=`√${a}/${a}`;
			display=correct;
			mathExpression=`\\( \\frac{1}{\\sqrt{${a}}} \\)`;
			choices=[correct];
			choices.push(`\\frac{${a}}{\\sqrt{${a}}}`);
			choices.push(`\\frac{1}{${a}}`);
			choices.push(`\\sqrt{${a}}`);
			choices.push(`\\frac{1}{\\sqrt{${a+1}}}`);
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