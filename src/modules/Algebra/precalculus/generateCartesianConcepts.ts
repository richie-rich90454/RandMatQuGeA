/**
 * Cartesian concepts: quadrant, distance, midpoint, plot.
 * @fileoverview Generates Cartesian coordinate questions.
 * @date 2026-03-15
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
			questionArea.innerHTML=`In which quadrant is the point \\( (${x}, ${y}) \\)?`;
			window.correctAnswer={
				correct:quadrant,
				alternate:quadrant,
				display:quadrant
			};
			hint="Enter I, II, III, IV, or 'on an axis'";
			break;
		}
		case "distance":{
			const x1=Math.floor(Math.random()*max);
			const y1=Math.floor(Math.random()*max);
			const x2=Math.floor(Math.random()*max);
			const y2=Math.floor(Math.random()*max);
			const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2);
			questionArea.innerHTML=`Find the distance between \\( (${x1}, ${y1}) \\) and \\( (${x2}, ${y2}) \\).`;
			window.correctAnswer={
				correct:dist,
				alternate:dist,
				display:dist
			};
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
			questionArea.innerHTML=`Find the midpoint of \\( (${x1}, ${y1}) \\) and \\( (${x2}, ${y2}) \\).`;
			const displayAns=`(${mx}, ${my})`;
			window.correctAnswer={
				correct:displayAns,
				alternate:`(${mx},${my})`,
				display:displayAns
			};
			hint="Enter as (x, y)";
			break;
		}
		case "plot":{
			const x=Math.floor(Math.random()*max)+1;
			const y=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`What are the coordinates of the point that is ${x} units right and ${y} units up from the origin?`;
			const displayAns=`(${x}, ${y})`;
			window.correctAnswer={
				correct:displayAns,
				alternate:`(${x},${y})`,
				display:displayAns
			};
			hint="Enter as (x, y)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}