/**
 * Real number operations: absolute, distance, order, interval.
 * @fileoverview Generates real number operation questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRealNumberOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["absolute","distance","order","interval"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "absolute":{
			const a=Math.floor(Math.random()*max*2)-max;
			const expr=`|${a}|`;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			const ans=Math.abs(a).toString();
			correct=ans;
			alternate=ans;
			display=ans;
			choices=[ans];
			choices.push((Math.abs(a)+1).toString());
			choices.push((Math.abs(a)-1).toString());
			choices.push(a.toString());
			choices.push((a+1).toString());
			hint="Enter a number";
			break;
		}
		case "distance":{
			const a=Math.floor(Math.random()*max);
			const b=Math.floor(Math.random()*max);
			questionArea.innerHTML=`Find the distance between \\( ${a} \\) and \\( ${b} \\) on the number line.`;
			const dist=Math.abs(a-b).toString();
			correct=dist;
			alternate=dist;
			display=dist;
			const numDist=parseInt(dist);
			choices=[dist];
			choices.push((numDist+1).toString());
			choices.push((numDist-1).toString());
			choices.push((Math.abs(a)+Math.abs(b)).toString());
			choices.push((a+b).toString());
			hint="Enter a number";
			break;
		}
		case "order":{
			const a=Math.floor(Math.random()*max);
			const b=Math.floor(Math.random()*max);
			const ops=["<",">","≤","≥"];
			const op=ops[Math.floor(Math.random()*ops.length)];
			const trueForA=(op==="<"&&a<b)||(op===">"&&a>b)||(op==="≤"&&a<=b)||(op==="≥"&&a>=b);
			const correctBool=trueForA?"true":"false";
			correct=correctBool;
			alternate=correctBool;
			display=correctBool;
			questionArea.innerHTML=`Is the statement \\( ${a} ${op} ${b} \\) true or false?`;
			choices=[correctBool];
			choices.push(correctBool==="true"?"false":"true");
			choices.push("maybe");
			choices.push("cannot determine");
			hint="Enter 'true' or 'false'";
			break;
		}
		case "interval":{
			const a=Math.floor(Math.random()*max)+1;
			const b=a+Math.floor(Math.random()*max)+2;
			const types=["open","closed","half-open","unbounded"];
			const intervalType=types[Math.floor(Math.random()*types.length)];
			let interval="";
			let desc="";
			switch (intervalType){
				case "open":
					interval=`(${a}, ${b})`;
					desc=`all x such that ${a} < x < ${b}`;
					break;
				case "closed":
					interval=`[${a}, ${b}]`;
					desc=`all x such that ${a} ≤ x ≤ ${b}`;
					break;
				case "half-open":
					if (Math.random()<0.5){
						interval=`[${a}, ${b})`;
						desc=`all x such that ${a} ≤ x < ${b}`;
					}else{
						interval=`(${a}, ${b}]`;
						desc=`all x such that ${a} < x ≤ ${b}`;
					}
					break;
				case "unbounded":
					if (Math.random()<0.5){
						interval=`(${a}, ∞)`;
						desc=`all x such that x > ${a}`;
					}else{
						interval=`(-∞, ${b})`;
						desc=`all x such that x < ${b}`;
					}
					break;
			}
			questionArea.innerHTML=`Write the interval \\( ${interval} \\) in set-builder notation.`;
			correct=desc;
			alternate=desc;
			display=desc;
			choices=[desc];
			let wrongDesc1="";
			let wrongDesc2="";
			if (interval.includes("∞")){
				wrongDesc1=interval.includes("(")?`x ≥ ${a}`:`x ≤ ${b}`;
				wrongDesc2=interval.includes("(")?`x > ${a+1}`:`x < ${b-1}`;
			}
			else{
				wrongDesc1=`all x such that ${a-1} < x < ${b+1}`;
				wrongDesc2=`all x such that ${a+1} < x < ${b-1}`;
			}
			choices.push(wrongDesc1);
			choices.push(wrongDesc2);
			choices.push(interval);
			hint="Enter a description like 'x > 3' or interval";
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
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}