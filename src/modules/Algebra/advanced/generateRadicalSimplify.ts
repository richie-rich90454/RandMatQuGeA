/**
 * Radical simplification: simplify, add, subtract, multiply, divide, rationalize.
 * @fileoverview Generates radical simplification questions. Sets window.correctAnswer with LaTeX expression and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
function isSquareFree(n: number): boolean{
	if (n<2) return true;
	for (let i=2;i*i<=n;i++){
		if (n%(i*i)===0) return false;
	}
	return true;
}
function simplifyRadical(radicand: number): string{
	if (radicand<0) return `\\sqrt{${radicand}}`;
	let s=1;
	let r=radicand;
	for (let i=Math.floor(Math.sqrt(radicand));i>=2;i--){
		if (radicand%(i*i)===0){
			s=i;
			r=radicand/(i*i);
			break;
		}
	}
	if (s===1){
		if (r===1) return "1";
		return `\\sqrt{${r}}`;
	}
	if (r===1) return `${s}`;
	return `${s}\\sqrt{${r}}`;
}
export function generateRadicalSimplify(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["simplify","add","subtract","multiply","divide","rationalize"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let hint="";
	switch (type){
		case "simplify":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			while (!isSquareFree(b)) b=Math.floor(Math.random()*maxVal)+1;
			let radicand=a*a*b;
			questionArea.innerHTML=`Simplify: \\( \\sqrt{${radicand}} \\)`;
			let ans=`${a}\\sqrt{${b}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `${a}√${b}`,
				display: ans
			};
			hint="Enter as a√b";
			break;
		}
		case "add":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let c=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			while (!isSquareFree(b)) b=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} + ${c}\\sqrt{${b}} \\)`;
			let coeff=a+c;
			let ans=`${coeff}\\sqrt{${b}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `${coeff}√${b}`,
				display: ans
			};
			hint="Enter as a√b";
			break;
		}
		case "subtract":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let c=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			while (!isSquareFree(b)) b=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} - ${c}\\sqrt{${b}} \\)`;
			let coeff=a-c;
			let ans=`${coeff}\\sqrt{${b}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `${coeff}√${b}`,
				display: ans
			};
			hint="Enter as a√b";
			break;
		}
		case "multiply":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			let product=a*b;
			questionArea.innerHTML=`Multiply: \\( \\sqrt{${a}} \\times \\sqrt{${b}} \\)`;
			let ans=simplifyRadical(product);
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter simplified radical (e.g., 2√3)";
			break;
		}
		case "divide":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Divide: \\( \\frac{\\sqrt{${a}}}{\\sqrt{${b}}} \\)`;
			let num=Math.sqrt(a);
			let den=Math.sqrt(b);
			let ans: string;
			if (Number.isInteger(num)&&Number.isInteger(den)){
				ans=`\\frac{${num}}{${den}}`;
			}
			else{
				let rationalized=`\\frac{\\sqrt{${a*b}}}{${b}}`;
				ans=rationalized;
			}
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter simplified radical (e.g., √6/2)";
			break;
		}
		case "rationalize":{
			let a=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Rationalize: \\( \\frac{1}{\\sqrt{${a}}} \\)`;
			let ans=`\\frac{\\sqrt{${a}}}{${a}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `√${a}/${a}`,
				display: ans
			};
			hint="Enter as √a/a";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}