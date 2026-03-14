import {questionArea} from "../../../script.js";
/**
 * Generates a finance question: compound interest, continuous compounding, APY, or annuity.
 * @returns void
 */
export function generateFinance(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["compound","continuous","apy","annuity"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";

	const principal=Math.floor(Math.random()*5000)+1000;
	const rate=(Math.random()*0.05+0.02).toFixed(3);
	const years=Math.floor(Math.random()*10)+1;
	const n=Math.floor(Math.random()*4)+1;

	switch (type){
		case "compound":{
			questionArea.innerHTML=`Find the amount after ${years} years if $${principal} is invested at ${(parseFloat(rate)*100).toFixed(1)}% compounded ${n} times per year.`;
			const amount=principal*Math.pow(1+parseFloat(rate)/n,n*years);
			window.correctAnswer={
				correct:amount.toFixed(2),
				alternate:amount.toFixed(2)
			};
			hint="Enter decimal (two decimals)";
			break;
		}
		case "continuous":{
			questionArea.innerHTML=`Find the amount after ${years} years if $${principal} is invested at ${(parseFloat(rate)*100).toFixed(1)}% compounded continuously.`;
			const amount=principal*Math.exp(parseFloat(rate)*years);
			window.correctAnswer={
				correct:amount.toFixed(2),
				alternate:amount.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "apy":{
			questionArea.innerHTML=`Find the APY for a nominal rate of ${(parseFloat(rate)*100).toFixed(1)}% compounded ${n} times per year. (as a percentage)`;
			const apy=(Math.pow(1+parseFloat(rate)/n,n)-1)*100;
			window.correctAnswer={
				correct:apy.toFixed(2),
				alternate:apy.toFixed(2)
			};
			hint="Enter percentage (e.g., 5.25)";
			break;
		}
		case "annuity":{
			const payment=Math.floor(Math.random()*500)+100;
			questionArea.innerHTML=`You deposit $${payment} at the end of each year into an account earning ${(parseFloat(rate)*100).toFixed(1)}% compounded annually. Find the future value after ${years} years.`;
			const fv=payment*((Math.pow(1+parseFloat(rate),years)-1)/parseFloat(rate));
			window.correctAnswer={
				correct:fv.toFixed(2),
				alternate:fv.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}