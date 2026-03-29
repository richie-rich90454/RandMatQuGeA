/**
 * Polynomial operations: addition, subtraction, multiplication, division, factoring.
 * Function concepts: domain, range, notation, evaluation.
 * Graphing: linear (slope, intercepts, equation from points, parallel/perpendicular), nonlinear (parabola vertex, absolute value, sqrt, transformations).
 * @fileoverview Generates algebra questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "./algebraUtils.js";

export function generatePolynomial(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["add","subtract","multiply"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxCoeff=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxCoeff)+1;
	let b=Math.floor(Math.random()*maxCoeff)+1;
	let c=Math.floor(Math.random()*maxCoeff)+1;
	let d=Math.floor(Math.random()*maxCoeff)+1;
	switch (type){
		case "add":{
			let p1=`${a}x^2 + ${b}x + ${c}`;
			let p2=`${d}x^2 + ${a}x + ${b}`;
			let sumA=a+d;
			let sumB=b+a;
			let sumC=c+b;
			let result=`${sumA}x^2 + ${sumB}x + ${sumC}`;
			correct=result;
			alternate=result.replace(/\s+/g,"");
			display=result;
			questionArea.innerHTML=`Add: \\( (${p1}) + (${p2}) \\)`;
			choices=[correct];
			choices.push(`${sumA}x^2 + ${sumB+1}x + ${sumC}`);
			choices.push(`${sumA}x^2 + ${sumB}x + ${sumC+1}`);
			choices.push(`${sumA+1}x^2 + ${sumB}x + ${sumC}`);
			choices.push(`${sumA}x^2 + ${sumB-1}x + ${sumC}`);
			break;
		}
		case "subtract":{
			let p1=`${a}x^2 + ${b}x + ${c}`;
			let p2=`${d}x^2 + ${a}x + ${b}`;
			let diffA=a-d;
			let diffB=b-a;
			let diffC=c-b;
			let result=`${diffA}x^2 + ${diffB}x + ${diffC}`;
			correct=result;
			alternate=result.replace(/\s+/g,"");
			display=result;
			questionArea.innerHTML=`Subtract: \\( (${p1}) - (${p2}) \\)`;
			choices=[correct];
			choices.push(`${diffA}x^2 + ${diffB+1}x + ${diffC}`);
			choices.push(`${diffA}x^2 + ${diffB}x + ${diffC+1}`);
			choices.push(`${diffA+1}x^2 + ${diffB}x + ${diffC}`);
			choices.push(`${diffA}x^2 + ${diffB-1}x + ${diffC}`);
			break;
		}
		case "multiply":{
			let p1=`${a}x + ${b}`;
			let p2=`${c}x + ${d}`;
			let term1=a*c;
			let term2=a*d + b*c;
			let term3=b*d;
			let result=`${term1}x^2 + ${term2}x + ${term3}`;
			correct=result;
			alternate=result.replace(/\s+/g,"");
			display=result;
			questionArea.innerHTML=`Multiply: \\( (${p1})(${p2}) \\)`;
			choices=[correct];
			choices.push(`${term1}x^2 + ${term2+1}x + ${term3}`);
			choices.push(`${term1}x^2 + ${term2}x + ${term3+1}`);
			choices.push(`${term1+1}x^2 + ${term2}x + ${term3}`);
			choices.push(`${term1}x^2 + ${term2-1}x + ${term3}`);
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

export function generatePolynomialDivision(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["simple","with_remainder"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "simple":{
			let dividend=`${a}x^2 + ${b}x`;
			let divisor=`x`;
			let quotient=`${a}x + ${b}`;
			correct=quotient;
			alternate=quotient.replace(/\s+/g,"");
			display=quotient;
			questionArea.innerHTML=`Divide: \\( \\frac{${dividend}}{${divisor}} \\)`;
			choices=[correct];
			choices.push(`${a}x + ${b+1}`);
			choices.push(`${a}x + ${b-1}`);
			choices.push(`${a+1}x + ${b}`);
			choices.push(`${a-1}x + ${b}`);
			break;
		}
		case "with_remainder":{
			let dividend=`${a}x^2 + ${b}x + ${a}`;
			let divisor=`x + 1`;
			let quotientCoef=a;
			let quotientConst=b - a;
			let remainder=2*a - b;
			let quotientStr=`${quotientCoef}x + ${quotientConst}`;
			let answer;
			if (remainder===0){
				answer=quotientStr;
			}else{
				answer=`${quotientStr} + \\frac{${remainder}}{${divisor}}`;
			}
			correct=answer;
			alternate=answer.replace(/\s+/g,"").replace(/\\\\frac/g,"frac");
			display=answer;
			questionArea.innerHTML=`Divide: \\( \\frac{${dividend}}{${divisor}} \\)`;
			choices=[correct];
			choices.push(`${quotientCoef}x + ${quotientConst+1} + \\frac{${remainder}}{${divisor}}`);
			choices.push(`${quotientCoef}x + ${quotientConst-1} + \\frac{${remainder}}{${divisor}}`);
			choices.push(`${quotientCoef+1}x + ${quotientConst} + \\frac{${remainder}}{${divisor}}`);
			choices.push(`${quotientCoef}x + ${quotientConst} + \\frac{${remainder+1}}{${divisor}}`);
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

export function generateFactoring(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["gcf","trinomial","difference_squares","sum_cubes","difference_cubes"];
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
	switch (type){
		case "gcf":{
			let expr=`${a*b}x + ${a*c}`;
			let ans=`${a}(${b}x + ${c})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
			choices=[correct];
			choices.push(`${a+1}(${b}x + ${c})`);
			choices.push(`${a-1}(${b}x + ${c})`);
			choices.push(`${a}(${b+1}x + ${c})`);
			choices.push(`${a}(${b}x + ${c+1})`);
			break;
		}
		case "trinomial":{
			let p=a*c;
			let q=a+c;
			let ans=`(x + ${a})(x + ${c})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Factor: \\( x^2 + ${q}x + ${p} \\)`;
			choices=[correct];
			choices.push(`(x + ${a+1})(x + ${c})`);
			choices.push(`(x + ${a})(x + ${c+1})`);
			choices.push(`(x + ${a-1})(x + ${c})`);
			choices.push(`(x + ${a})(x + ${c-1})`);
			break;
		}
		case "difference_squares":{
			let expr=`${a*a}x^2 - ${b*b}`;
			let ans=`(${a}x - ${b})(${a}x + ${b})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
			choices=[correct];
			choices.push(`(${a+1}x - ${b})(${a+1}x + ${b})`);
			choices.push(`(${a}x - ${b+1})(${a}x + ${b+1})`);
			choices.push(`(${a-1}x - ${b})(${a-1}x + ${b})`);
			choices.push(`(${a}x - ${b-1})(${a}x + ${b-1})`);
			break;
		}
		case "sum_cubes":{
			let expr=`x^3 + ${a*a*a}`;
			let ans=`(x + ${a})(x^2 - ${a}x + ${a*a})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
			choices=[correct];
			choices.push(`(x + ${a+1})(x^2 - ${a+1}x + ${(a+1)*(a+1)})`);
			choices.push(`(x + ${a-1})(x^2 - ${a-1}x + ${(a-1)*(a-1)})`);
			choices.push(`(x - ${a})(x^2 + ${a}x + ${a*a})`);
			choices.push(`(x + ${a})(x^2 + ${a}x + ${a*a})`);
			break;
		}
		case "difference_cubes":{
			let expr=`x^3 - ${a*a*a}`;
			let ans=`(x - ${a})(x^2 + ${a}x + ${a*a})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Factor: \\( ${expr} \\)`;
			choices=[correct];
			choices.push(`(x - ${a+1})(x^2 + ${a+1}x + ${(a+1)*(a+1)})`);
			choices.push(`(x - ${a-1})(x^2 + ${a-1}x + ${(a-1)*(a-1)})`);
			choices.push(`(x + ${a})(x^2 - ${a}x + ${a*a})`);
			choices.push(`(x - ${a})(x^2 - ${a}x + ${a*a})`);
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

export function generateFunctionConcepts(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["domain","range","notation","evaluate"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "domain":{
			questionArea.innerHTML=`Find the domain of \\( f(x)=\\sqrt{x-${a}} \\). (Enter interval)`;
			correct=`[${a}, ∞)`;
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push(`(${a}, ∞)`);
			choices.push(`(-∞, ${a}]`);
			choices.push(`(-∞, ${a})`);
			choices.push(`[${a+1}, ∞)`);
			break;
		}
		case "range":{
			questionArea.innerHTML=`Find the range of \\( f(x)=x^2 + ${a} \\). (Enter interval)`;
			correct=`[${a}, ∞)`;
			alternate=correct;
			display=correct;
			choices=[correct];
			choices.push(`(${a}, ∞)`);
			choices.push(`(-∞, ${a}]`);
			choices.push(`(-∞, ${a})`);
			choices.push(`[${a+1}, ∞)`);
			break;
		}
		case "notation":{
			questionArea.innerHTML=`If \\( f(x)=${a}x + 3 \\), find \\( f(${x}) \\).`;
			let ans=(a*x+3).toString();
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseInt(correct);
			choices=[correct];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((a*x).toString());
			choices.push((a*x+4).toString());
			break;
		}
		case "evaluate":{
			questionArea.innerHTML=`Given \\( f(x)=x^2 - ${a} \\), evaluate \\( f(${x}) \\).`;
			let ans=(x*x - a).toString();
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseInt(correct);
			choices=[correct];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((x*x).toString());
			choices.push((x*x - a + 1).toString());
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

export function generateLinearGraphing(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["slope","intercepts","equation_from_points","parallel_perpendicular"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x1=Math.floor(Math.random()*maxVal)+1;
	let y1=Math.floor(Math.random()*maxVal)+1;
	let x2=Math.floor(Math.random()*maxVal)+1;
	let y2=Math.floor(Math.random()*maxVal)+1;
	while (x1===x2) x2=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "slope":{
			let slope=(y2-y1)/(x2-x1);
			let ans=slope.toFixed(2);
			correct=ans;
			alternate=slope.toString();
			display=ans;
			questionArea.innerHTML=`Find the slope between (${x1},${y1}) and (${x2},${y2}).`;
			let slopeNum=parseFloat(ans);
			choices=[correct];
			choices.push((slopeNum+0.1).toFixed(2));
			choices.push((slopeNum-0.1).toFixed(2));
			choices.push(((y2-y1)).toString());
			choices.push(((x2-x1)).toString());
			break;
		}
		case "intercepts":{
			let eq=`${a}x + ${b}y=${a*b}`;
			let xInt=b;
			let yInt=a;
			let ans=`(${xInt},0) and (0,${yInt})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Find the x- and y-intercepts of \\( ${eq} \\).`;
			choices=[correct];
			choices.push(`(${xInt+1},0) and (0,${yInt})`);
			choices.push(`(${xInt},0) and (0,${yInt+1})`);
			choices.push(`(${xInt-1},0) and (0,${yInt})`);
			choices.push(`(${xInt},0) and (0,${yInt-1})`);
			break;
		}
		case "equation_from_points":{
			let slope=(y2-y1)/(x2-x1);
			let intercept=y1-slope*x1;
			let ans=`y=${slope.toFixed(2)}x + ${intercept.toFixed(2)}`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Find the equation of the line through (${x1},${y1}) and (${x2},${y2}).`;
			choices=[correct];
			let slopeNum=parseFloat(slope.toFixed(2));
			let intNum=parseFloat(intercept.toFixed(2));
			choices.push(`y=${(slopeNum+0.1).toFixed(2)}x + ${intNum}`);
			choices.push(`y=${slopeNum}x + ${(intNum+0.1).toFixed(2)}`);
			choices.push(`y=${(slopeNum-0.1).toFixed(2)}x + ${intNum}`);
			choices.push(`y=${slopeNum}x + ${(intNum-0.1).toFixed(2)}`);
			break;
		}
		case "parallel_perpendicular":{
			let slope=a;
			let perp=-1/slope;
			let ans=`parallel: ${slope}, perpendicular: ${perp.toFixed(2)}`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			questionArea.innerHTML=`Line L has slope ${slope}. What is the slope of a line parallel to L? Perpendicular?`;
			choices=[correct];
			choices.push(`parallel: ${slope+1}, perpendicular: ${perp.toFixed(2)}`);
			choices.push(`parallel: ${slope}, perpendicular: ${(perp+0.1).toFixed(2)}`);
			choices.push(`parallel: ${slope-1}, perpendicular: ${perp.toFixed(2)}`);
			choices.push(`parallel: ${slope}, perpendicular: ${(perp-0.1).toFixed(2)}`);
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

export function generateNonLinearGraphing(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["parabola_vertex","abs_value","sqrt","transform"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let h=Math.floor(Math.random()*maxVal)-2;
	let k=Math.floor(Math.random()*maxVal)-2;
	switch (type){
		case "parabola_vertex":{
			questionArea.innerHTML=`Find the vertex of \\( y=${a}(x - ${h})^2 + ${k} \\).`;
			let ans=`(${h}, ${k})`;
			correct=ans;
			alternate=ans.replace(/\s+/g,"");
			display=ans;
			choices=[correct];
			choices.push(`(${h+1}, ${k})`);
			choices.push(`(${h}, ${k+1})`);
			choices.push(`(${h-1}, ${k})`);
			choices.push(`(${h}, ${k-1})`);
			break;
		}
		case "abs_value":{
			let rightShift=h>0?`right ${h}`:`left ${-h}`;
			let upShift=k>0?`up ${k}`:`down ${-k}`;
			let ans=`${rightShift}, ${upShift}`;
			correct=ans;
			alternate=ans;
			display=ans;
			questionArea.innerHTML=`Describe the transformation of \\( y=|x| \\) to \\( y=|x - ${h}| + ${k} \\).`;
			let wrongShift1=h>0?`left ${h}`:`right ${-h}`;
			let wrongShift2=k>0?`down ${k}`:`up ${-k}`;
			choices=[correct];
			choices.push(`${wrongShift1}, ${upShift}`);
			choices.push(`${rightShift}, ${wrongShift2}`);
			choices.push(`${wrongShift1}, ${wrongShift2}`);
			choices.push(`no shift`);
			break;
		}
		case "sqrt":{
			questionArea.innerHTML=`Find the domain of \\( y=\\sqrt{x - ${a}} \\).`;
			let ans=`x ≥ ${a}`;
			correct=ans;
			alternate=`[${a},∞)`;
			display=ans;
			choices=[correct];
			choices.push(`x ≥ ${a+1}`);
			choices.push(`x ≤ ${a}`);
			choices.push(`x > ${a}`);
			choices.push(`x < ${a}`);
			break;
		}
		case "transform":{
			questionArea.innerHTML=`If the graph of \\( y=x^2 \\) is shifted left ${h} and down ${k}, what is the new equation?`;
			let newEq=`y=(x + ${h})^2 - ${k}`;
			correct=newEq;
			alternate=newEq.replace(/\s+/g,"");
			display=newEq;
			choices=[correct];
			choices.push(`y=(x - ${h})^2 - ${k}`);
			choices.push(`y=(x + ${h})^2 + ${k}`);
			choices.push(`y=(x - ${h})^2 + ${k}`);
			choices.push(`y=(x + ${h+1})^2 - ${k}`);
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