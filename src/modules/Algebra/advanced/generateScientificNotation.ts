/**
 * Scientific notation: convert to standard, to scientific, multiply, divide.
 * @fileoverview Generates scientific notation questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
function formatScientific(value: number, precision: number): { mantissa: number; exponent: number }{
	let exponent=Math.floor(Math.log10(Math.abs(value)));
	let mantissa=value/Math.pow(10,exponent);
	mantissa=Number(mantissa.toFixed(precision));
	if (Math.abs(mantissa)>=10){
		mantissa/=10;
		exponent++;
	}
	else if (Math.abs(mantissa)<1 && mantissa!==0){
		mantissa*=10;
		exponent--;
	}
	return { mantissa, exponent };
}
export function generateScientificNotation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["to_standard","to_scientific","multiply","divide"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,1000);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*3)+1;
	switch (type){
		case "to_standard":{
			let sci=`${a} \\times 10^{${b}}`;
			let std=a*Math.pow(10,b);
			correct=std.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Convert to standard notation: \\( ${sci} \\)`;
			let numStd=parseInt(correct);
			choices=[correct];
			choices.push((numStd+1).toString());
			choices.push((numStd-1).toString());
			choices.push((numStd*10).toString());
			choices.push((numStd/10).toString());
			break;
		}
		case "to_scientific":{
			let std=a*100;
			let sciFormatted=formatScientific(std,1);
			let displaySci=`${sciFormatted.mantissa} \\times 10^{${sciFormatted.exponent}}`;
			let correctSci=std.toExponential(1);
			correct=correctSci;
			alternate=correctSci;
			display=displaySci;
			questionArea.innerHTML=`Write in scientific notation: \\( ${std} \\)`;
			let mant=parseFloat(correctSci.split('e')[0]);
			let exp=parseInt(correctSci.split('e')[1]);
			choices=[correctSci];
			choices.push(`${(mant+0.1).toFixed(1)}e${exp}`);
			choices.push(`${(mant-0.1).toFixed(1)}e${exp}`);
			choices.push(`${mant}e${exp+1}`);
			choices.push(`${mant}e${exp-1}`);
			break;
		}
		case "multiply":{
			let sci1=`(${a} \\times 10^{${b}})`;
			let sci2=`(${a} \\times 10^{${b+1}})`;
			let product=a*a*Math.pow(10,2*b+1);
			let sciFormatted=formatScientific(product,2);
			let displaySci=`${sciFormatted.mantissa} \\times 10^{${sciFormatted.exponent}}`;
			let correctSci=product.toExponential(2);
			correct=correctSci;
			alternate=product.toString();
			display=displaySci;
			questionArea.innerHTML=`Multiply: \\( ${sci1} \\times ${sci2} \\)`;
			let mant=parseFloat(correctSci.split('e')[0]);
			let exp=parseInt(correctSci.split('e')[1]);
			choices=[correctSci];
			choices.push(`${(mant+0.1).toFixed(2)}e${exp}`);
			choices.push(`${(mant-0.1).toFixed(2)}e${exp}`);
			choices.push(`${mant}e${exp+1}`);
			choices.push(`${mant}e${exp-1}`);
			break;
		}
		case "divide":{
			let sci1=`(${a} \\times 10^{${b+1}})`;
			let sci2=`(${a} \\times 10^{${b}})`;
			let quotient=10;
			correct=quotient.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Divide: \\( \\frac{${sci1}}{${sci2}} \\)`;
			choices=[correct];
			choices.push("1");
			choices.push("0");
			choices.push("100");
			choices.push("0.1");
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