/**
 * Circle equations: standard form, center/radius, complete the square.
 * @fileoverview Generates circle equation questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateCircleEquations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["standard","center_radius","complete_square"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";
	switch (type){
		case "standard":{
			const h=Math.floor(Math.random()*max*2)-max;
			const k=Math.floor(Math.random()*max*2)-max;
			const r=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`Write the equation of a circle with center \\( (${h}, ${k}) \\) and radius \\( ${r} \\).`;
			const eq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			const displayEq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			window.correctAnswer={
				correct:eq,
				alternate:eq,
				display:displayEq
			};
			hint="Enter as (x-h)^2 + (y-k)^2 = r^2";
			break;
		}
		case "center_radius":{
			const h=Math.floor(Math.random()*max*2)-max;
			const k=Math.floor(Math.random()*max*2)-max;
			const r=Math.floor(Math.random()*max)+1;
			const eq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			questionArea.innerHTML=`Find the center and radius of the circle: \\( ${eq} \\).`;
			const ans=`center (${h}, ${k}), radius ${r}`;
			window.correctAnswer={
				correct:ans,
				alternate:`(${h},${k}), ${r}`,
				display:ans
			};
			hint="Enter as 'center (h,k), radius r'";
			break;
		}
		case "complete_square":{
			const h=Math.floor(Math.random()*max)+1;
			const k=Math.floor(Math.random()*max)+1;
			const r=Math.floor(Math.random()*max)+1;
			const xCoeff=-2*h;
			const yCoeff=-2*k;
			const constTerm=h*h+k*k-r*r;
			const eq=`x^2 + y^2 ${xCoeff>=0?'+':'-'} ${Math.abs(xCoeff)}x ${yCoeff>=0?'+':'-'} ${Math.abs(yCoeff)}y ${constTerm>=0?'+':'-'} ${Math.abs(constTerm)} = 0`;
			questionArea.innerHTML=`Complete the square to find the center and radius: \\( ${eq} \\).`;
			const ans=`center (${h}, ${k}), radius ${r}`;
			window.correctAnswer={
				correct:ans,
				alternate:`(${h},${k}), ${r}`,
				display:ans
			};
			hint="Enter as 'center (h,k), radius r'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}