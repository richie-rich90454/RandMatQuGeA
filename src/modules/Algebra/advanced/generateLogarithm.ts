import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Logarithm questions: basic, change of base, equations, properties, exponential form.
 * @fileoverview Generates logarithm questions with MCQ distractors. Sets window.correctAnswer with correct value and display.
 * @date 2026-04-18
 */
export function generateLogarithm(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","change_base","equation","properties","exponential_form"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(Math.random()*maxBase)+2;
	let arg=Math.pow(base,Math.floor(Math.random()*4)+1);
	let newBase=Math.floor(Math.random()*3)+2;
	let expectedFormat="Enter a number or expression";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "basic":{
			let answer=(Math.log(arg)/Math.log(base)).toFixed(2);
			correct=answer;
			alternate=answer;
			display=answer;
			mathExpression=`\\( \\log_{${base}} ${arg} \\)`;
			let numAns=parseFloat(answer);
			choices=[answer];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push((Math.log(arg)/Math.log(base+1)).toFixed(2));
			choices.push((Math.log(arg+1)/Math.log(base)).toFixed(2));
			break;
		}
		case "change_base":{
			let numerator=Math.log(arg)/Math.log(newBase);
			let denominator=Math.log(base)/Math.log(newBase);
			let numericAnswer=(numerator/denominator).toFixed(2);
			let expr=`\\frac{\\log_{${newBase}} ${arg}}{\\log_{${newBase}} ${base}}`;
			correct=numericAnswer;
			alternate=expr;
			display=numericAnswer;
			mathExpression=`Express \\( \\log_{${base}} ${arg} \\) in base \\( ${newBase} \\)`;
			let numAns=parseFloat(numericAnswer);
			choices=[numericAnswer];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push(`\\frac{\\log_{${newBase}} ${arg+1}}{\\log_{${newBase}} ${base}}`);
			choices.push(`\\frac{\\log_{${newBase}} ${arg}}{\\log_{${newBase}} ${base+1}}`);
			break;
		}
		case "equation":{
			let exponent=Math.floor(Math.random()*3)+2;
			correct=exponent.toString();
			alternate=correct;
			display=correct;
			mathExpression=`\\( ${base}^{x}=${Math.pow(base,exponent)} \\)`;
			choices=[correct];
			choices.push((exponent+1).toString());
			choices.push((exponent-1).toString());
			choices.push((Math.log(Math.pow(base,exponent))/Math.log(base+1)).toFixed(2));
			choices.push("0");
			break;
		}
		case "properties":{
			let a=Math.floor(Math.random()*8)+2;
			let b=Math.floor(Math.random()*8)+2;
			let logSum=(Math.log(a*b)/Math.log(base)).toFixed(2);
			correct=logSum;
			alternate=`\\log_{${base}} ${a}+\\log_{${base}} ${b}=${(Math.log(a)/Math.log(base)).toFixed(2)}+${(Math.log(b)/Math.log(base)).toFixed(2)}=${logSum}`;
			display=logSum;
			mathExpression=`\\( \\log_{${base}} (${a} \\times ${b}) \\)`;
			let numAns=parseFloat(logSum);
			choices=[logSum];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push((Math.log(a)/Math.log(base)).toFixed(2));
			choices.push((Math.log(b)/Math.log(base)).toFixed(2));
			break;
		}
		case "exponential_form":{
			let exponent=Math.floor(Math.random()*3)+2;
			let result=Math.pow(base,exponent);
			correct=result.toString();
			alternate=`${base}^${exponent}`;
			display=correct;
			mathExpression=`If \\( \\log_{${base}} x=${exponent} \\), find \\( x \\)`;
			let numAns=parseInt(correct);
			choices=[correct];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((Math.pow(base,exponent+1)).toString());
			choices.push((Math.pow(base,exponent-1)).toString());
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