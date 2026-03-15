//generateInverseFunctions
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about inverse functions: finding an inverse, verifying inverses,
 * or determining one‑to‑one.
 * @param difficulty - Optional difficulty level to adjust coefficients.
 * @returns void
 */
export function generateInverseFunctions(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["find","verify","onetoone"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;

	switch (type){
		case "find":{
			const fExpr=`${a}x + ${b}`;
			questionArea.innerHTML=`Find the inverse of \\( f(x)=${fExpr} \\).`;
			const inv=`f^{-1}(x) = \\frac{x - ${b}}{${a}}`;
			const plain=`(x-${b})/${a}`;
			window.correctAnswer={
				correct:inv,
				alternate:plain,
				display:inv
			};
			hint="Enter as (x-b)/a";
			break;
		}
		case "verify":{
			const fExpr=`${a}x + ${b}`;
			const invExpr=`\\frac{x - ${b}}{${a}}`;
			questionArea.innerHTML=`Verify that \\( f(x)=${fExpr} \\) and \\( g(x)=${invExpr} \\) are inverses. (Enter true/false)`;
			window.correctAnswer={
				correct:"true",
				alternate:"true",
				display:"true"
			};
			hint="Enter 'true' or 'false'";
			break;
		}
		case "onetoone":{
			questionArea.innerHTML=`Is \\( f(x)=x^2 \\) one-to-one on its natural domain? (yes/no)`;
			window.correctAnswer={
				correct:"no",
				alternate:"no",
				display:"no"
			};
			hint="Enter 'yes' or 'no'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}