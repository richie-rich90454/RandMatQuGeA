/**
 * Factorial questions: basic, division, equation, approximation, prime exponent.
 * @fileoverview Generates factorial questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {factorial, getMaxForDifficulty} from "../algebraUtils.js";
export function generateFactorial(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","division","equation","approximation","prime"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxN=getMaxForDifficulty(difficulty,7);
	let n=Math.floor(Math.random()*maxN)+5;
	let k=Math.floor(Math.random()*(n-2))+2;
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "basic":{
			let ans=factorial(n).toString();
			correct=ans;
			alternate=ans;
			display=ans;
			questionArea.innerHTML=`Calculate \\( ${n}! \\)`;
			let numVal=parseInt(ans);
			choices=[ans];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push((numVal*2).toString());
			choices.push((numVal/2).toString());
			break;
		}
		case "division":{
			let result=Array.from({length:n-k},(_,i)=>n-i).reduce((a,b)=>a*b,1);
			correct=result.toString();
			alternate=(factorial(n)/factorial(k)).toString();
			display=correct;
			questionArea.innerHTML=`Simplify: \\( \\frac{${n}!}{${k}!} \\)`;
			let numVal=parseInt(correct);
			choices=[correct];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push(factorial(n).toString());
			choices.push(factorial(k).toString());
			break;
		}
		case "equation":{
			let factVal=factorial(n);
			correct=n.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Solve for \\( n \\): \\( n!=${factVal} \\)`;
			choices=[correct];
			choices.push((n+1).toString());
			choices.push((n-1).toString());
			choices.push((Math.floor(Math.pow(factVal,1/3))).toString());
			choices.push((Math.floor(Math.sqrt(factVal))).toString());
			break;
		}
		case "approximation":{
			let stirling=Math.sqrt(2*Math.PI*n)*Math.pow(n/Math.E,n);
			correct=stirling.toFixed(0);
			alternate=Math.round(stirling).toString();
			display=correct;
			questionArea.innerHTML=`Estimate \\( ${n}! \\) using Stirling's approximation`;
			let numVal=parseInt(correct);
			choices=[correct];
			choices.push((numVal+100).toString());
			choices.push((numVal-100).toString());
			choices.push((numVal*2).toString());
			choices.push((numVal/2).toString());
			break;
		}
		case "prime":{
			let primes=[2,3,5,7,11];
			let prime=primes[Math.floor(Math.random()*primes.length)];
			let count=0;
			let temp=n;
			while (temp>0){
				temp=Math.floor(temp/prime);
				count+=temp;
			}
			correct=count.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Find the exponent of \\( ${prime} \\) in \\( ${n}! \\) (prime factorization)`;
			let numVal=parseInt(correct);
			choices=[correct];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push((Math.floor(n/prime)).toString());
			choices.push((Math.floor(n/(prime*prime))).toString());
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