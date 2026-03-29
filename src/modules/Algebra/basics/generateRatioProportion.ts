/**
 * Generates a ratio/proportion question (simplify ratio, solve proportion, map scale, or unit rate) with MCQ distractors.
 * @fileoverview Ratios, proportions, scales, unit rates. Sets window.correctAnswer with numeric or plain ratio and plausible wrong answers.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {gcd, getMaxForDifficulty} from "../algebraUtils.js";
export function generateRatioProportion(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["ratio","proportion","scale","unit_rate"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "ratio":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			let g=gcd(a,b);
			let plain=`${a/g}:${b/g}`;
			correct=plain;
			alternate=`${a/g}/${b/g}`;
			display=plain;
			questionArea.innerHTML=`Simplify the ratio \\( ${a}:${b} \\) to lowest terms.`;
			choices=[correct];
			choices.push(`${a/g+1}:${b/g}`);
			choices.push(`${a/g}:${b/g+1}`);
			choices.push(`${a}:${b}`);
			choices.push(`${a/g-1}:${b/g}`);
			break;
		}
		case "proportion":{
			let a=Math.floor(Math.random()*5)+2;
			let b=Math.floor(Math.random()*5)+2;
			let c=Math.floor(Math.random()*10)+5;
			let x=Math.round(c*a/b);
			correct=x.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Solve for x: \\( \\frac{${a}}{${b}}=\\frac{${c}}{x} \\)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((c*a).toString());
			choices.push((c*b).toString());
			break;
		}
		case "scale":{
			let map=Math.floor(Math.random()*10)+1;
			let actual=Math.floor(Math.random()*50)+10;
			let scaled=Math.round(actual/map);
			correct=actual.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`On a map with scale 1:${map}, a distance measures ${scaled} cm. What is the actual distance in cm?`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((scaled*map+1).toString());
			choices.push((scaled).toString());
			break;
		}
		case "unit_rate":{
			let quantity=Math.floor(Math.random()*100)+20;
			let units=Math.floor(Math.random()*10)+2;
			let rate=quantity/units;
			let ans=rate.toFixed(2);
			correct=ans;
			alternate=rate.toString();
			display=ans;
			questionArea.innerHTML=`If ${quantity} items cost $${units}, what is the unit price? (nearest cent)`;
			let numRes=parseFloat(correct);
			choices=[correct];
			choices.push((numRes+0.1).toFixed(2));
			choices.push((numRes-0.1).toFixed(2));
			choices.push((quantity/units+0.01).toFixed(2));
			choices.push((units/quantity).toFixed(2));
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