/**
 * Linear equations: one-step, two-step, both sides, parentheses, literal.
 * Quadratic equations: factoring, completing square, quadratic formula, discriminant.
 * Inequalities: linear, quadratic, rational, compound, absolute.
 * Systems: 2x2 and 3x3.
 * @fileoverview Generates equation and inequality questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "./algebraUtils.js";

export function generateLinearEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["one_step","two_step","both_sides","parentheses","literal"];
	let type=types[Math.floor(Math.random()*types.length)];
	let range=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*range)+1;
	let b=Math.floor(Math.random()*range)+1;
	let c=Math.floor(Math.random()*range)+1;
	let x=Math.floor(Math.random()*range)+1;
	switch (type){
		case "one_step":{
			let op=Math.random()<0.5?"+":"-";
			if (op==="+"){
				let rhs=a+x;
				questionArea.innerHTML=`Solve: \\( x + ${a}=${rhs} \\)`;
				correct=x.toString();
				alternate=correct;
				display=correct;
				choices=[correct];
				choices.push((x+1).toString());
				choices.push((x-1).toString());
				choices.push(rhs.toString());
				choices.push((rhs-a).toString());
			}else{
				let rhs=a-x;
				questionArea.innerHTML=`Solve: \\( ${a} - x = ${rhs} \\)`;
				correct=x.toString();
				alternate=correct;
				display=correct;
				choices=[correct];
				choices.push((x+1).toString());
				choices.push((x-1).toString());
				choices.push(rhs.toString());
				choices.push((a-rhs).toString());
			}
			hint="Enter a number";
			break;
		}
		case "two_step":{
			let coeff=Math.max(1,a);
			let constant=b;
			let rhs=coeff*x+constant;
			questionArea.innerHTML=`Solve: \\( ${coeff}x + ${constant}=${rhs} \\)`;
			correct=x.toString();
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push((x+1).toString());
			choices.push((x-1).toString());
			choices.push(((rhs-constant)/coeff).toString());
			choices.push((rhs-constant).toString());
			break;
		}
		case "both_sides":{
			let coeff1=Math.max(1,a);
			let coeff2=Math.max(1,b);
			let constant=c;
			let rhsConst=coeff1*x+constant-coeff2*x;
			questionArea.innerHTML=`Solve: \\( ${coeff1}x + ${constant}=${coeff2}x + ${rhsConst} \\)`;
			correct=x.toString();
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push((x+1).toString());
			choices.push((x-1).toString());
			choices.push(((constant-rhsConst)/(coeff2-coeff1)).toString());
			choices.push((constant).toString());
			break;
		}
		case "parentheses":{
			let coeff=Math.max(1,a);
			let inner=Math.max(1,b);
			let rhs=coeff*(x+inner);
			questionArea.innerHTML=`Solve: \\( ${coeff}(x + ${inner})=${rhs} \\)`;
			correct=x.toString();
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push((x+1).toString());
			choices.push((x-1).toString());
			choices.push((rhs/coeff-inner).toString());
			choices.push((rhs-coeff*inner).toString());
			break;
		}
		case "literal":{
			let eq=`${a}x + ${b}y = ${c}`;
			questionArea.innerHTML=`Solve for x: \\( ${eq} \\)`;
			let ans=`\\frac{${c} - ${b}y}{${a}}`;
			correct=ans;
			alternate=`(${c} - ${b}y)/${a}`;
			display=ans;
			choices=[correct];
			choices.push(`\\frac{${c} - ${a}y}{${b}}`);
			choices.push(`\\frac{${c} + ${b}y}{${a}}`);
			choices.push(`\\frac{${c}}{${a}} - ${b}y`);
			choices.push(`${c} - ${b}y`);
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

export function generateQuadraticEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["factor","complete_square","quadratic_formula","discriminant"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "factor":{
			let p=Math.floor(Math.random()*maxVal)+1;
			let q=Math.floor(Math.random()*maxVal)+1;
			let b=-(p+q);
			let c=p*q;
			let signB=b>=0?`+ ${b}`:`- ${-b}`;
			questionArea.innerHTML=`Solve by factoring: \\( x^2 ${signB}x + ${c}=0 \\)`;
			let root1=-p;
			let root2=-q;
			correct=`${root1}, ${root2}`;
			alternate=`x=${root1}, x=${root2}`;
			display=correct;
			choices=[correct];
			choices.push(`${p}, ${q}`);
			choices.push(`${root1+1}, ${root2}`);
			choices.push(`${root1}, ${root2+1}`);
			choices.push(`${root1}, ${root2}`);
			break;
		}
		case "complete_square":{
			let d=Math.floor(Math.random()*3)+1;
			let e=Math.floor(Math.random()*5)+1;
			let rhs=e*e;
			questionArea.innerHTML=`Solve by completing the square: \\( (x + ${d})^2 = ${rhs} \\)`;
			let sol1=-d+e;
			let sol2=-d-e;
			correct=`${sol1}, ${sol2}`;
			alternate=`x=${sol1}, x=${sol2}`;
			display=correct;
			choices=[correct];
			choices.push(`${sol1+1}, ${sol2}`);
			choices.push(`${sol1}, ${sol2+1}`);
			choices.push(`${-d}, ${-d}`);
			choices.push(`${sol1}, ${sol2}`);
			break;
		}
		case "quadratic_formula":{
			let a=1;
			let b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let disc=b*b-4*a*c;
			while (disc<0){
				b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
				c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
				disc=b*b-4*a*c;
			}
			let sol1=(-b+Math.sqrt(disc))/(2*a);
			let sol2=(-b-Math.sqrt(disc))/(2*a);
			correct=`${sol1.toFixed(2)}, ${sol2.toFixed(2)}`;
			alternate=`x=${sol1.toFixed(2)}, x=${sol2.toFixed(2)}`;
			display=correct;
			choices=[correct];
			choices.push(`${(sol1+0.1).toFixed(2)}, ${sol2.toFixed(2)}`);
			choices.push(`${sol1.toFixed(2)}, ${(sol2+0.1).toFixed(2)}`);
			choices.push(`${(-b/(2*a)).toFixed(2)}`);
			choices.push(`no real roots`);
			break;
		}
		case "discriminant":{
			let a=1;
			let b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let disc=b*b-4*a*c;
			let nature=disc>0?"two real":disc===0?"one real":"two complex";
			correct=`${disc}, ${nature}`;
			alternate=`${disc}`;
			display=correct;
			choices=[correct];
			choices.push(`${disc+1}, ${nature}`);
			choices.push(`${disc-1}, ${nature}`);
			choices.push(`${disc}, ${nature==="two real"?"one real":"two real"}`);
			choices.push(`${disc}, ${nature==="two real"?"two complex":"two real"}`);
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

export function generateLinearInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["solve","graph","compound","absolute"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "solve":{
			let rhs=a*x+b;
			questionArea.innerHTML=`Solve: \\( ${a}x + ${b} > ${rhs} \\)`;
			correct=`x > ${x}`;
			alternate=`x>${x}`;
			display=correct;
			choices=[correct];
			choices.push(`x < ${x}`);
			choices.push(`x > ${x+1}`);
			choices.push(`x > ${x-1}`);
			choices.push(`x = ${x}`);
			break;
		}
		case "graph":{
			questionArea.innerHTML=`Graph the inequality \\( x < ${x} \\) on a number line. (Enter the solution set)`;
			correct=`(-∞, ${x})`;
			alternate=`(-∞,${x})`;
			display=correct;
			choices=[correct];
			choices.push(`(-∞, ${x}]`);
			choices.push(`(${x}, ∞)`);
			choices.push(`[${x}, ∞)`);
			choices.push(`(-∞, ${x-1})`);
			break;
		}
		case "compound":{
			let lower=Math.floor(Math.random()*3)+1;
			let upper=lower+Math.floor(Math.random()*5)+2;
			questionArea.innerHTML=`Solve: \\( ${lower} < x < ${upper} \\) (Enter the interval)`;
			correct=`(${lower}, ${upper})`;
			alternate=`(${lower},${upper})`;
			display=correct;
			choices=[correct];
			choices.push(`[${lower}, ${upper}]`);
			choices.push(`(${lower}, ${upper}]`);
			choices.push(`[${lower}, ${upper})`);
			choices.push(`(${lower-1}, ${upper})`);
			break;
		}
		case "absolute":{
			let k=Math.floor(Math.random()*5)+2;
			questionArea.innerHTML=`Solve: \\( |x| < ${k} \\) (Enter interval)`;
			correct=`(-${k}, ${k})`;
			alternate=`(-${k},${k})`;
			display=correct;
			choices=[correct];
			choices.push(`(-∞, ${k})`);
			choices.push(`(-${k}, ∞)`);
			choices.push(`[-${k}, ${k}]`);
			choices.push(`(-${k-1}, ${k-1})`);
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

export function generateQuadraticInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["solve","graph"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "solve":{
			let a=1;
			let b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let disc=b*b-4*a*c;
			if (disc<0){
				questionArea.innerHTML=`Solve: \\( x^2 + ${b}x + ${c} < 0 \\) (Enter interval)`;
				correct="no solution";
				alternate="no solution";
				display="no solution";
				choices=[correct];
				choices.push(`(-∞, ∞)`);
				choices.push(`(0, ∞)`);
				choices.push(`(-∞, 0)`);
				choices.push(`(${b/2}, ∞)`);
				break;
			}
			let root1=(-b-Math.sqrt(disc))/(2*a);
			let root2=(-b+Math.sqrt(disc))/(2*a);
			if (root1>root2) [root1,root2]=[root2,root1];
			correct=`(${root1.toFixed(2)}, ${root2.toFixed(2)})`;
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push(`(-∞, ${root1.toFixed(2)}) ∪ (${root2.toFixed(2)}, ∞)`);
			choices.push(`[${root1.toFixed(2)}, ${root2.toFixed(2)}]`);
			choices.push(`(${root1.toFixed(2)}, ${root2.toFixed(2)}]`);
			choices.push(`(${(parseFloat(root1.toFixed(2))-1).toFixed(2)}, ${root2.toFixed(2)})`);
			break;
		}
		case "graph":{
			questionArea.innerHTML=`Graph the inequality \\( y > x^2 - 4 \\). (Enter the solution description)`;
			correct="above the parabola";
			alternate="above";
			display=correct;
			choices=[correct];
			choices.push("below the parabola");
			choices.push("inside the parabola");
			choices.push("outside the parabola");
			choices.push("on the parabola");
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

export function generateRationalInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let maxVal=getMaxForDifficulty(difficulty,5);
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	questionArea.innerHTML=`Solve: \\( \\frac{x-${a}}{x-${b}} > 0 \\) (Enter intervals)`;
	let intervals:string;
	if (a<b){
		intervals=`(-∞,${a}) ∪ (${b},∞)`;
	}else{
		intervals=`(-∞,${b}) ∪ (${a},∞)`;
	}
	let correct=intervals;
	let alternate=intervals.replace(/∞/g,"infinity");
	let display=correct;
	let choices=[correct];
	choices.push(`(-∞,${a}) ∪ (${b},∞)`);
	choices.push(`(-∞,${b}) ∪ (${a},∞)`);
	choices.push(`(-∞,${Math.min(a,b)}) ∪ (${Math.max(a,b)},∞)`);
	choices.push(`(${a},${b})`);
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
	window.expectedFormat="Enter intervals e.g., (-∞,2) ∪ (5,∞)";
	if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
}

export function generateSystem2x2(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["graphing","substitution","elimination","word"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	let d=Math.floor(Math.random()*maxVal)+1;
	let e=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	let y=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "graphing":{
			let eq1=`${a}x + ${b}y = ${a*x+b*y}`;
			let eq2=`${c}x + ${d}y = ${c*x+d*y}`;
			questionArea.innerHTML=`Solve by graphing:<br> \\( ${eq1} \\)<br> \\( ${eq2} \\)`;
			correct=`(${x}, ${y})`;
			alternate=`(${x},${y})`;
			display=correct;
			choices=[correct];
			choices.push(`(${x+1}, ${y})`);
			choices.push(`(${x}, ${y+1})`);
			choices.push(`(${x-1}, ${y})`);
			choices.push(`(${x}, ${y-1})`);
			break;
		}
		case "substitution":{
			let eq1=`y=${a}x + ${b}`;
			let eq2=`${c}x + ${d}y = ${e}`;
			questionArea.innerHTML=`Solve by substitution:<br> \\( ${eq1} \\)<br> \\( ${eq2} \\)`;
			let denominator=c+d*a;
			if (denominator===0) denominator=1;
			let xSol=(e-d*b)/denominator;
			let ySol=a*xSol+b;
			let xStr=xSol.toFixed(2);
			let yStr=ySol.toFixed(2);
			correct=`(${xStr}, ${yStr})`;
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push(`(${(xSol+0.1).toFixed(2)}, ${yStr})`);
			choices.push(`(${xStr}, ${(ySol+0.1).toFixed(2)})`);
			choices.push(`(${(xSol-0.1).toFixed(2)}, ${yStr})`);
			choices.push(`(${xStr}, ${(ySol-0.1).toFixed(2)})`);
			break;
		}
		case "elimination":{
			let eq1=`${a}x + ${b}y = ${a*x+b*y}`;
			let eq2=`${c}x + ${d}y = ${c*x+d*y}`;
			questionArea.innerHTML=`Solve by elimination:<br> \\( ${eq1} \\)<br> \\( ${eq2} \\)`;
			correct=`(${x}, ${y})`;
			alternate=`(${x},${y})`;
			display=correct;
			choices=[correct];
			choices.push(`(${x+1}, ${y})`);
			choices.push(`(${x}, ${y+1})`);
			choices.push(`(${x-1}, ${y})`);
			choices.push(`(${x}, ${y-1})`);
			break;
		}
		case "word":{
			let sum=x+y;
			let diff=Math.abs(x-y);
			questionArea.innerHTML=`The sum of two numbers is ${sum} and their difference is ${diff}. Find the numbers.`;
			let larger=(sum+diff)/2;
			let smaller=(sum-diff)/2;
			correct=`${larger}, ${smaller}`;
			alternate=`${larger},${smaller}`;
			display=correct;
			choices=[correct];
			choices.push(`${larger+1}, ${smaller}`);
			choices.push(`${larger}, ${smaller+1}`);
			choices.push(`${larger-1}, ${smaller}`);
			choices.push(`${larger}, ${smaller-1}`);
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

export function generateSystem3x3(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let maxVal=getMaxForDifficulty(difficulty,5);
	let x=Math.floor(Math.random()*maxVal)+1;
	let y=Math.floor(Math.random()*maxVal)+1;
	let z=Math.floor(Math.random()*maxVal)+1;
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	let d=Math.floor(Math.random()*maxVal)+1;
	let e=Math.floor(Math.random()*maxVal)+1;
	let f=Math.floor(Math.random()*maxVal)+1;
	let g=Math.floor(Math.random()*maxVal)+1;
	let h=Math.floor(Math.random()*maxVal)+1;
	let i=Math.floor(Math.random()*maxVal)+1;
	questionArea.innerHTML=`Solve the system:<br>
		\\( ${a}x + ${b}y + ${c}z = ${a*x+b*y+c*z} \\)<br>
		\\( ${d}x + ${e}y + ${f}z = ${d*x+e*y+f*z} \\)<br>
		\\( ${g}x + ${h}y + ${i}z = ${g*x+h*y+i*z} \\)`;
	let correct=`(${x}, ${y}, ${z})`;
	let alternate=`(${x},${y},${z})`;
	let display=correct;
	let choices=[correct];
	choices.push(`(${x+1}, ${y}, ${z})`);
	choices.push(`(${x}, ${y+1}, ${z})`);
	choices.push(`(${x}, ${y}, ${z+1})`);
	choices.push(`(${x-1}, ${y}, ${z})`);
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
	window.expectedFormat="Enter as (x, y, z)";
	if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
}