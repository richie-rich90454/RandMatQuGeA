/**
 * Cartesian concepts: quadrant, distance, midpoint, plot.
 * @fileoverview Generates Cartesian coordinate questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateCartesianConcepts(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["quadrant","distance","midpoint","plot"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "quadrant":{
			const x=Math.floor(Math.random()*max*2)-max;
			const y=Math.floor(Math.random()*max*2)-max;
			let quadrant="";
			if (x>0&&y>0) quadrant="I";
			else if (x<0&&y>0) quadrant="II";
			else if (x<0&&y<0) quadrant="III";
			else if (x>0&&y<0) quadrant="IV";
			else quadrant="on an axis";
			correct=quadrant;
			alternate=quadrant;
			display=quadrant;
			questionArea.innerHTML=`In which quadrant is the point \\( (${x}, ${y}) \\)?`;
			let allQuadrants=["I","II","III","IV","on an axis"];
			choices=[correct];
			for (let q of allQuadrants){
				if (q!==correct) choices.push(q);
				if (choices.length>=4) break;
			}
			hint="Enter I, II, III, IV, or 'on an axis'";
			break;
		}
		case "distance":{
			const x1=Math.floor(Math.random()*max);
			const y1=Math.floor(Math.random()*max);
			const x2=Math.floor(Math.random()*max);
			const y2=Math.floor(Math.random()*max);
			const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2);
			correct=dist;
			alternate=dist;
			display=dist;
			questionArea.innerHTML=`Find the distance between \\( (${x1}, ${y1}) \\) and \\( (${x2}, ${y2}) \\).`;
			let distNum=parseFloat(dist);
			choices=[correct];
			choices.push((distNum+0.5).toFixed(2));
			choices.push((distNum-0.5).toFixed(2));
			choices.push((Math.abs(x2-x1)+Math.abs(y2-y1)).toFixed(2));
			choices.push(Math.sqrt((x2-x1)**2+(y2-y1)**2+1).toFixed(2));
			hint="Enter a decimal rounded to two places";
			break;
		}
		case "midpoint":{
			const x1=Math.floor(Math.random()*max);
			const y1=Math.floor(Math.random()*max);
			const x2=Math.floor(Math.random()*max);
			const y2=Math.floor(Math.random()*max);
			const mx=((x1+x2)/2).toFixed(2);
			const my=((y1+y2)/2).toFixed(2);
			const displayAns=`(${mx}, ${my})`;
			correct=displayAns;
			alternate=`(${mx},${my})`;
			display=displayAns;
			questionArea.innerHTML=`Find the midpoint of \\( (${x1}, ${y1}) \\) and \\( (${x2}, ${y2}) \\).`;
			let mxNum=parseFloat(mx);
			let myNum=parseFloat(my);
			choices=[correct];
			choices.push(`(${(mxNum+0.5).toFixed(2)}, ${myNum})`);
			choices.push(`(${mxNum}, ${(myNum+0.5).toFixed(2)})`);
			choices.push(`(${(mxNum-0.5).toFixed(2)}, ${myNum})`);
			choices.push(`(${mxNum}, ${(myNum-0.5).toFixed(2)})`);
			hint="Enter as (x, y)";
			break;
		}
		case "plot":{
			const x=Math.floor(Math.random()*max)+1;
			const y=Math.floor(Math.random()*max)+1;
			const displayAns=`(${x}, ${y})`;
			correct=displayAns;
			alternate=`(${x},${y})`;
			display=displayAns;
			questionArea.innerHTML=`What are the coordinates of the point that is ${x} units right and ${y} units up from the origin?`;
			choices=[correct];
			choices.push(`(${x+1}, ${y})`);
			choices.push(`(${x}, ${y+1})`);
			choices.push(`(${x-1}, ${y})`);
			choices.push(`(${x}, ${y-1})`);
			hint="Enter as (x, y)";
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