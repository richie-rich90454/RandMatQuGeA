/**
 * Complex number operations: addition, subtraction, multiplication, division, powers of i.
 * @fileoverview Generates complex number arithmetic questions. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateComplex(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["add","subtract","multiply","divide","powers_i"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	let d=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "add":{
			questionArea.innerHTML=`Add: \\( (${a} + ${b}i) + (${c} + ${d}i) \\)`;
			let real=a+c;
			let imag=b+d;
			let answer=`${real} + ${imag}i`;
			window.correctAnswer={
				correct: answer,
				alternate: `${real}+${imag}i`,
				display: answer
			};
			hint="Enter as a+bi";
			break;
		}
		case "subtract":{
			questionArea.innerHTML=`Subtract: \\( (${a} + ${b}i) - (${c} + ${d}i) \\)`;
			let real=a-c;
			let imag=b-d;
			let answer=`${real} + ${imag}i`;
			window.correctAnswer={
				correct: answer,
				alternate: `${real}+${imag}i`,
				display: answer
			};
			hint="Enter as a+bi";
			break;
		}
		case "multiply":{
			questionArea.innerHTML=`Multiply: \\( (${a} + ${b}i)(${c} + ${d}i) \\)`;
			let real=a*c-b*d;
			let imag=a*d+b*c;
			let answer=`${real} + ${imag}i`;
			window.correctAnswer={
				correct: answer,
				alternate: `${real}+${imag}i`,
				display: answer
			};
			hint="Enter as a+bi";
			break;
		}
		case "divide":{
			questionArea.innerHTML=`Divide: \\( \\frac{${a} + ${b}i}{${c} + ${d}i} \\)`;
			let denom=c*c+d*d;
			let real=(a*c+b*d)/denom;
			let imag=(b*c-a*d)/denom;
			let answer=`${real.toFixed(2)} + ${imag.toFixed(2)}i`;
			window.correctAnswer={
				correct: answer,
				alternate: `${real.toFixed(2)}+${imag.toFixed(2)}i`,
				display: answer
			};
			hint="Enter as a+bi decimals";
			break;
		}
		case "powers_i":{
			let n=Math.floor(Math.random()*4)+1;
			let ans=["i","-1","-i","1"][(n-1)%4];
			questionArea.innerHTML=`Simplify: \\( i^{${n}} \\)`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter i, -1, -i, or 1";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}