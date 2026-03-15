//generateRealNumberOperations
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about real number operations: absolute value, distance on number line,
 * ordering with inequalities, or interval notation.
 * @param difficulty - Optional difficulty level to adjust the range of numbers.
 * @returns void
 */
export function generateRealNumberOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["absolute","distance","order","interval"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	switch (type){
		case "absolute":{
			const a=Math.floor(Math.random()*max*2)-max;
			const expr=`|${a}|`;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			const ans=Math.abs(a).toString();
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter a number";
			break;
		}
		case "distance":{
			const a=Math.floor(Math.random()*max);
			const b=Math.floor(Math.random()*max);
			questionArea.innerHTML=`Find the distance between \\( ${a} \\) and \\( ${b} \\) on the number line.`;
			const dist=Math.abs(a-b).toString();
			window.correctAnswer={
				correct:dist,
				alternate:dist,
				display:dist
			};
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
			questionArea.innerHTML=`Is the statement \\( ${a} ${op} ${b} \\) true or false?`;
			window.correctAnswer={
				correct:correctBool,
				alternate:correctBool,
				display:correctBool
			};
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
			window.correctAnswer={
				correct:desc,
				alternate:desc,
				display:desc
			};
			hint="Enter a description like 'x > 3' or interval";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}