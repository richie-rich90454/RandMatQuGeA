import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Complex number operations: addition, subtraction, multiplication, division, powers of i.
 * @fileoverview Generates complex number arithmetic questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateComplex(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["add","subtract","multiply","divide","powers_i"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let a=Math.floor(rng()*maxVal)+1;
	let b=Math.floor(rng()*maxVal)+1;
	let c=Math.floor(rng()*maxVal)+1;
	let d=Math.floor(rng()*maxVal)+1;
	let expectedFormat="Enter as a+bi (e.g., 3+2i)";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices: string[]=[];
	switch(type){
		case "add":{
			let real=a+c;
			let imag=b+d;
			correct=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
			alternate=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
			display=correct;
			mathExpression=`Add: \\( (${a} + ${b}i) + (${c} + ${d}i) \\)`;
			choices=[correct];
			let wrongReal1=real+1;
			let wrongImag1=imag+1;
			choices.push(wrongImag1>=0?`${wrongReal1} + ${wrongImag1}i`:`${wrongReal1} - ${-wrongImag1}i`);
			let wrongReal2=real-1;
			let wrongImag2=imag-1;
			choices.push(wrongImag2>=0?`${wrongReal2} + ${wrongImag2}i`:`${wrongReal2} - ${-wrongImag2}i`);
			choices.push(`${real} + ${imag+1}i`);
			choices.push(`${real+1} + ${imag}i`);
			break;
		}
		case "subtract":{
			let real=a-c;
			let imag=b-d;
			correct=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
			alternate=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
			display=correct;
			mathExpression=`Subtract: \\( (${a} + ${b}i) - (${c} + ${d}i) \\)`;
			choices=[correct];
			let wrongReal1=real+1;
			let wrongImag1=imag+1;
			choices.push(wrongImag1>=0?`${wrongReal1} + ${wrongImag1}i`:`${wrongReal1} - ${-wrongImag1}i`);
			let wrongReal2=real-1;
			let wrongImag2=imag-1;
			choices.push(wrongImag2>=0?`${wrongReal2} + ${wrongImag2}i`:`${wrongReal2} - ${-wrongImag2}i`);
			choices.push(`${real} + ${imag-1}i`);
			choices.push(`${real-1} + ${imag}i`);
			break;
		}
		case "multiply":{
			let real=a*c-b*d;
			let imag=a*d+b*c;
			correct=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
			alternate=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
			display=correct;
			mathExpression=`Multiply: \\( (${a} + ${b}i)(${c} + ${d}i) \\)`;
			choices=[correct];
			let wrongReal1=real+1;
			let wrongImag1=imag+1;
			choices.push(wrongImag1>=0?`${wrongReal1} + ${wrongImag1}i`:`${wrongReal1} - ${-wrongImag1}i`);
			let wrongReal2=real-1;
			let wrongImag2=imag-1;
			choices.push(wrongImag2>=0?`${wrongReal2} + ${wrongImag2}i`:`${wrongReal2} - ${-wrongImag2}i`);
			choices.push(`${a*c} + ${b*d}i`);
			choices.push(`${a*d} + ${b*c}i`);
			break;
		}
		case "divide":{
			let denom=c*c+d*d;
			let real=(a*c+b*d)/denom;
			let imag=(b*c-a*d)/denom;
			let realFixed=real.toFixed(2);
			let absImag=Math.abs(imag).toFixed(2);
			if(imag>=0){
				correct=`${realFixed} + ${absImag}i`;
			}
			else{
				correct=`${realFixed} - ${absImag}i`;
			}
			alternate=imag>=0?`${realFixed}+${absImag}i`:`${realFixed}-${absImag}i`;
			display=correct;
			expectedFormat="Enter as a+bi decimals (e.g., 0.33+0.25i)";
			mathExpression=`Divide: \\( \\frac{${a} + ${b}i}{${c} + ${d}i} \\)`;
			choices=[correct];
			let wrongRealNum=(a*c+b*d)/(denom+1);
			let wrongImagNum=(b*c-a*d)/(denom+1);
			let wrongRealFixed=wrongRealNum.toFixed(2);
			let wrongAbsImag=Math.abs(wrongImagNum).toFixed(2);
			let wrongStr=wrongImagNum>=0?`${wrongRealFixed} + ${wrongAbsImag}i`:`${wrongRealFixed} - ${wrongAbsImag}i`;
			choices.push(wrongStr);
			wrongRealNum=(a*c+b*d)/(denom-1);
			wrongImagNum=(b*c-a*d)/(denom-1);
			wrongRealFixed=wrongRealNum.toFixed(2);
			wrongAbsImag=Math.abs(wrongImagNum).toFixed(2);
			wrongStr=wrongImagNum>=0?`${wrongRealFixed} + ${wrongAbsImag}i`:`${wrongRealFixed} - ${wrongAbsImag}i`;
			choices.push(wrongStr);
			choices.push(`${(a*c+b*d).toFixed(2)} + ${(b*c-a*d).toFixed(2)}i`);
			choices.push(`${(a*c).toFixed(2)} + ${(b*d).toFixed(2)}i`);
			break;
		}
		case "powers_i":{
			let n=Math.floor(rng()*4)+1;
			let ans=["i","-1","-i","1"][(n-1)%4];
			correct=ans;
			alternate=ans;
			display=ans;
			expectedFormat="Enter i, -1, -i, or 1";
			mathExpression=`Simplify: \\( i^{${n}} \\)`;
			let all=["i","-1","-i","1"];
			choices=[correct];
			for(let opt of all){
				if(opt!==correct) choices.push(opt);
			}
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let latex=mathExpression;
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat
	};
}
