/**
 * Factorial questions: basic, division, equation, approximation, prime exponent.
 * @fileoverview Generates factorial questions. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-15
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
	switch (type){
		case "basic":
			questionArea.innerHTML=`Calculate \\( ${n}! \\)`;
			let ans=factorial(n).toString();
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a whole number";
			break;
		case "division":{
			let result=Array.from({length:n-k},(_,i)=>n-i).reduce((a,b)=>a*b,1);
			questionArea.innerHTML=`Simplify: \\( \\frac{${n}!}{${k}!} \\)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: (factorial(n)/factorial(k)).toString(),
				display: result.toString()
			};
			hint="Enter a whole number";
			break;
		}
		case "equation":{
			let factVal=factorial(n);
			questionArea.innerHTML=`Solve for \\( n \\): \\( n!=${factVal} \\)`;
			window.correctAnswer={
				correct: n.toString(),
				alternate: n.toString(),
				display: n.toString()
			};
			hint="Enter a whole number";
			break;
		}
		case "approximation":{
			questionArea.innerHTML=`Estimate \\( ${n}! \\) using Stirling"s approximation`;
			let stirling=Math.sqrt(2*Math.PI*n)*Math.pow(n/Math.E,n);
			window.correctAnswer={
				correct: stirling.toFixed(0),
				alternate: Math.round(stirling).toString(),
				display: stirling.toFixed(0)
			};
			hint="Enter a rounded whole number";
			break;
		}
		case "prime":{
			let primes=[2,3,5,7,11];
			let prime=primes[Math.floor(Math.random()*primes.length)];
			questionArea.innerHTML=`Find the exponent of \\( ${prime} \\) in \\( ${n}! \\) (prime factorization)`;
			let count=0;
			let temp=n;
			while (temp>0){
				temp=Math.floor(temp/prime);
				count+=temp;
			}
			window.correctAnswer={
				correct: count.toString(),
				alternate: count.toString(),
				display: count.toString()
			};
			hint="Enter a whole number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}