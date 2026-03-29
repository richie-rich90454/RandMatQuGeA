/**
 * Exponential expressions: evaluate, solve, apply laws, growth factor, compare.
 * @fileoverview Generates exponent questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
export function generateExponent(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","solve","laws","growth","compare"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(Math.random()*maxBase)+2;
	let exponent=Math.floor(Math.random()*5)+2;
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "basic":{
			let val=Math.pow(base,exponent).toString();
			correct=val;
			alternate=val;
			display=val;
			questionArea.innerHTML=`Evaluate: \\( ${base}^{${exponent}} \\)`;
			let numVal=parseInt(val);
			choices=[val];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push((numVal*2).toString());
			choices.push((numVal/2).toString());
			break;
		}
		case "solve":{
			let power=Math.pow(base,exponent);
			correct=exponent.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Solve for \\( x \\): \\( ${base}^{x}=${power} \\)`;
			choices=[correct];
			choices.push((exponent+1).toString());
			choices.push((exponent-1).toString());
			choices.push((Math.log(power)/Math.log(base)).toFixed(2));
			choices.push("0");
			break;
		}
		case "laws":{
			let a=Math.floor(Math.random()*3)+2;
			let b=Math.floor(Math.random()*3)+2;
			let ansVal=Math.pow(base,a+b);
			let ansStr=ansVal.toString();
			let altExpr=`${base}^${a+b}`;
			correct=ansStr;
			alternate=altExpr;
			display=ansStr;
			questionArea.innerHTML=`Simplify: \\( (${base}^{${a}}) \\times (${base}^{${b}}) \\)`;
			let numVal=parseInt(ansStr);
			choices=[ansStr];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push(Math.pow(base,a).toString());
			choices.push(Math.pow(base,b).toString());
			break;
		}
		case "growth":{
			let rate=(Math.random()*20+5).toFixed(1);
			let factor=(1+parseFloat(rate)/100).toFixed(3);
			correct=factor;
			alternate=factor;
			display=factor;
			questionArea.innerHTML=`A population grows at \\( ${rate}\\% \\) annually. What is the growth factor?`;
			let factorNum=parseFloat(factor);
			choices=[factor];
			choices.push((factorNum+0.01).toFixed(3));
			choices.push((factorNum-0.01).toFixed(3));
			choices.push((1+parseFloat(rate)/100).toFixed(2));
			choices.push((parseFloat(rate)/100).toFixed(3));
			break;
		}
		case "compare":{
			let b1=Math.floor(Math.random()*3)+2;
			let b2=Math.floor(Math.random()*3)+2;
			let e1=Math.floor(Math.random()*4)+2;
			let e2=Math.floor(Math.random()*4)+2;
			let val1=Math.pow(b1,e1);
			let val2=Math.pow(b2,e2);
			let largerVal=Math.max(val1,val2);
			let largerExpr=val1>val2?`${b1}^${e1}`:`${b2}^${e2}`;
			correct=largerVal.toString();
			alternate=largerExpr;
			display=correct;
			questionArea.innerHTML=`Which is larger: \\( ${b1}^{${e1}} \\) or \\( ${b2}^{${e2}} \\)?`;
			let smaller=Math.min(val1,val2);
			choices=[correct];
			choices.push(smaller.toString());
			choices.push((largerVal+1).toString());
			choices.push((largerVal-1).toString());
			choices.push((smaller+1).toString());
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correct)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
}