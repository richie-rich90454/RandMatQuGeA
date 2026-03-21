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
			let real=a+c;
			let imag=b+d;
			let displayStr=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
			let alternateStr=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
			questionArea.innerHTML=`Add: \\( (${a} + ${b}i) + (${c} + ${d}i) \\)`;
			window.correctAnswer={
				correct: displayStr,
				alternate: alternateStr,
				display: displayStr
			};
			hint="Enter as a+bi (e.g., 3+2i)";
			break;
		}
		case "subtract":{
			let real=a-c;
			let imag=b-d;
			let displayStr=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
			let alternateStr=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
			questionArea.innerHTML=`Subtract: \\( (${a} + ${b}i) - (${c} + ${d}i) \\)`;
			window.correctAnswer={
				correct: displayStr,
				alternate: alternateStr,
				display: displayStr
			};
			hint="Enter as a+bi (e.g., 3+2i)";
			break;
		}
		case "multiply":{
			let real=a*c-b*d;
			let imag=a*d+b*c;
			let displayStr=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
			let alternateStr=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
			questionArea.innerHTML=`Multiply: \\( (${a} + ${b}i)(${c} + ${d}i) \\)`;
			window.correctAnswer={
				correct: displayStr,
				alternate: alternateStr,
				display: displayStr
			};
			hint="Enter as a+bi (e.g., 3+2i)";
			break;
		}
		case "divide":{
			let denom=c*c+d*d;
			let real=(a*c+b*d)/denom;
			let imag=(b*c-a*d)/denom;
			let realFixed=real.toFixed(2);
			let imagFixed=imag.toFixed(2);
			let displayStr=imag>=0?`${realFixed} + ${imagFixed}i`:`${realFixed} - ${-imag}i`.replace(/-([0-9.]+)/, "$1"); // careful
			// Simplify sign handling
			let absImag=Math.abs(imag).toFixed(2);
			if (imag>=0){
				displayStr=`${realFixed} + ${absImag}i`;
			}
			else{
				displayStr=`${realFixed} - ${absImag}i`;
			}
			let alternateStr=imag>=0?`${realFixed}+${absImag}i`:`${realFixed}-${absImag}i`;
			questionArea.innerHTML=`Divide: \\( \\frac{${a} + ${b}i}{${c} + ${d}i} \\)`;
			window.correctAnswer={
				correct: displayStr,
				alternate: alternateStr,
				display: displayStr
			};
			hint="Enter as a+bi decimals (e.g., 0.33+0.25i)";
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