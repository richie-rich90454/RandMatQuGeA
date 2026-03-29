import {questionArea} from "../../script.js";
import {getMaxForDifficulty, isPrime, gcd} from "./arithmeticUtils.js";
/**
 * Generates and displays a random whole number and place value question (place value, expanded form, or rounding).
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the maximum
 *                     number value used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from `["place_value", "expanded_form", "rounding"]`.
 * 3. Generates a random number (at least 100) within a range determined by `difficulty`.
 * 4. Constructs the question text and computes the correct answer, along with plausible distractors.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, `display`, and `choices` properties.
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available.
 *
 * **Question types**:
 * - `place_value`   – asks for the place value of a specific digit in the number (e.g., 500 for the hundreds place).
 * - `expanded_form` – asks to write the number in expanded form (e.g., "200 + 30 + 4").
 * - `rounding`      – asks to round the number to the nearest ten, hundred, or thousand.
 *
 * @example
 * ```typescript
 * generateWholeNumberPlaceValue();
 * generateWholeNumberPlaceValue("hard");
 * ```
 */
export function generateWholeNumberPlaceValue(difficulty?: string): void{
	if (!questionArea) return;
	let types=["place_value","expanded_form","rounding"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxNum=getMaxForDifficulty(difficulty||"medium",9999);
	let num=Math.floor(Math.random()*maxNum)+100;
	let hint="";
	switch (type){
		case "place_value":{
			let digits=num.toString().split("");
			let placeIndex=Math.floor(Math.random()*digits.length);
			let digit=digits[placeIndex];
			let placeValue=parseInt(digit)*Math.pow(10,digits.length-1-placeIndex);
			let placeName="";
			let pos=digits.length-1-placeIndex;
			if (pos===0) placeName="ones";
			else if (pos===1) placeName="tens";
			else if (pos===2) placeName="hundreds";
			else if (pos===3) placeName="thousands";
			else if (pos===4) placeName="ten‑thousands";
			let correctNumber=placeValue.toString();
			let correctName=placeName;
			questionArea.innerHTML=`What is the place value of the digit ${digit} in ${num}? (e.g., 500 or "hundreds")`;
			let choices=[correctNumber, correctName];
			let otherDigitValue=parseInt(digits[(placeIndex+1)%digits.length])*Math.pow(10,digits.length-1-((placeIndex+1)%digits.length));
			choices.push(otherDigitValue.toString());
			choices.push(digit);
			if (pos>0) choices.push(Math.pow(10,pos-1).toString());
			if (pos<digits.length-1) choices.push(Math.pow(10,pos+1).toString());
			choices.push(placeName.replace(/s$/,''));
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: correctNumber,
				alternate: correctName,
				display: correctNumber,
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter a number (e.g., 500)";
			break;
		}
		case "expanded_form":{
			let expanded=num.toString().split("").map((d,i)=>parseInt(d)*Math.pow(10,num.toString().length-1-i)).filter(v=>v!==0).join(" + ");
			questionArea.innerHTML=`Write ${num} in expanded form.`;
			let choices=[expanded];
			let parts=expanded.split(" + ");
			if (parts.length>1){
				let missingOne=[...parts];
				missingOne.pop();
				choices.push(missingOne.join(" + "));
				let wrongCoeff=[...parts];
				let last=wrongCoeff.pop();
				if (last){
					let wrong=parseInt(last)/10;
					wrongCoeff.push(wrong.toString());
					choices.push(wrongCoeff.join(" + "));
				}
			}
			choices.push(parts.reverse().join(" + "));
			choices.push(num.toString());
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: expanded,
				alternate: expanded,
				display: expanded,
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter as 200 + 30 + 4";
			break;
		}
		case "rounding":{
			let place=Math.pow(10,Math.floor(Math.random()*3)+1);
			let rounded=Math.round(num/place)*place;
			let placeName=place===10?"ten":place===100?"hundred":"thousand";
			questionArea.innerHTML=`Round ${num} to the nearest ${placeName}.`;
			let choices=[rounded.toString()];
			choices.push((Math.round(num/(place/10))*(place/10)).toString());
			choices.push((Math.floor(num/place)*place).toString());
			choices.push((Math.ceil(num/place)*place).toString());
			choices.push(num.toString());
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: rounded.toString(),
				alternate: rounded.toString(),
				display: rounded.toString(),
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter a number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
/**
 * Generates and displays a random number line ordering question (ordering integers including negatives).
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the range
 *                     of numbers used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Generates four random integers within a range determined by `difficulty` (may include negatives).
 *    It ensures at least one negative and one positive number are present.
 * 3. Constructs the question text asking to order the numbers from least to greatest.
 * 4. Computes the correct sorted order and creates plausible incorrect orders.
 * 5. Sets global variables for answer validation.
 *
 * @example
 * ```typescript
 * generateNumberLineOrdering();
 * generateNumberLineOrdering("hard");
 * ```
 */
export function generateNumberLineOrdering(difficulty?: string): void{
	if (!questionArea) return;
	let range=getMaxForDifficulty(difficulty||"medium",20);
	let numbers: number[]=[];
	for (let i=0; i<4; i++){
		numbers.push(Math.floor(Math.random()*range*2)-range);
	}
	if (!numbers.some(n=>n<0)) numbers[0]=-numbers[0];
	if (!numbers.some(n=>n>0)) numbers[1]=Math.abs(numbers[1])+1;
	let sorted=[...numbers].sort((a,b)=>a-b);
	let correctOrder=sorted.join(", ");
	questionArea.innerHTML=`Order the numbers from least to greatest: ${numbers.join(", ")}.`;
	let choices=[correctOrder];
	choices.push([...sorted].reverse().join(", "));
	let perm=[...numbers];
	for (let i=perm.length-1;i>0;i--){
		const j=Math.floor(Math.random()*(i+1));
		[perm[i],perm[j]]=[perm[j],perm[i]];
	}
	choices.push(perm.join(", "));
	choices.push(numbers.join(", "));
	let uniqueChoices=[...new Set(choices)];
	window.correctAnswer={
		correct: correctOrder,
		alternate: correctOrder,
		display: correctOrder,
		choices: uniqueChoices.slice(0,4)
	};
	window.expectedFormat="Enter numbers separated by commas, e.g., -3, 0, 5, 7";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
/**
 * Generates and displays a random divisibility question (rules, prime/composite identification, or checking divisibility).
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the maximum
 *                     number value used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from `["rule", "identify_prime", "divisible_by"]`.
 * 3. Generates a random number (≥ 2) within a range determined by `difficulty`.
 * 4. Constructs the question text and computes the correct answer along with plausible distractors.
 * 5. Sets global variables for answer validation.
 *
 * @example
 * ```typescript
 * generateDivisibility();
 * generateDivisibility("hard");
 * ```
 */
export function generateDivisibility(difficulty?: string): void{
	if (!questionArea) return;
	let types=["rule","identify_prime","divisible_by"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxNum=getMaxForDifficulty(difficulty||"medium",100);
	let num=Math.floor(Math.random()*maxNum)+2;
	let hint="";
	switch (type){
		case "rule":{
			let divisors=[2,3,5,9,10];
			let d=divisors[Math.floor(Math.random()*divisors.length)];
			let correctRule="";
			if (d===2) correctRule="A number is divisible by 2 if its last digit is even.";
			else if (d===3) correctRule="A number is divisible by 3 if the sum of its digits is divisible by 3.";
			else if (d===5) correctRule="A number is divisible by 5 if its last digit is 0 or 5.";
			else if (d===9) correctRule="A number is divisible by 9 if the sum of its digits is divisible by 9.";
			else if (d===10) correctRule="A number is divisible by 10 if its last digit is 0.";
			questionArea.innerHTML=`State the divisibility rule for ${d}.`;
			let choices=[correctRule];
			if (d===2) choices.push("A number is divisible by 2 if its last digit is odd.");
			if (d===3) choices.push("A number is divisible by 3 if its last digit is 3.");
			if (d===5) choices.push("A number is divisible by 5 if its last digit is 5.");
			if (d===9) choices.push("A number is divisible by 9 if its last digit is 9.");
			if (d===10) choices.push("A number is divisible by 10 if its last digit is 5.");
			choices.push("A number is divisible by " + d + " if it is even.");
			choices.push("A number is divisible by " + d + " if the sum of its digits is divisible by " + d + ".");
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: correctRule,
				alternate: correctRule,
				display: correctRule,
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter the rule in your own words";
			break;
		}
		case "identify_prime":{
			let isPrimeNum=isPrime(num);
			let correctAnswer=isPrimeNum?"prime":"composite";
			questionArea.innerHTML=`Is ${num} prime or composite?`;
			let choices=[correctAnswer];
			choices.push(isPrimeNum?"composite":"prime");
			choices.push("neither");
			choices.push("both");
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: correctAnswer,
				alternate: correctAnswer,
				display: correctAnswer,
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter 'prime' or 'composite'";
			break;
		}
		case "divisible_by":{
			let divisors=[2,3,4,5,6,8,9,10];
			let d=divisors[Math.floor(Math.random()*divisors.length)];
			if (Math.random()<0.5){
				num=Math.floor(num/d)*d;
				if (num===0) num=d;
			}
			let isDivisible=(num%d===0);
			let correctAnswer=isDivisible?"yes":"no";
			questionArea.innerHTML=`Is ${num} divisible by ${d}? (yes/no)`;
			let choices=[correctAnswer];
			choices.push(isDivisible?"no":"yes");
			choices.push("maybe");
			choices.push("always");
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: correctAnswer,
				alternate: correctAnswer,
				display: correctAnswer,
				choices: uniqueChoices.slice(0,4)
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
/**
 * Generates and displays a random GCF/LCM question (find GCF, find LCM, or a word problem about the largest common divisor).
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the maximum
 *                     number value used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from `["gcf", "lcm", "word"]`.
 * 3. Generates two random numbers (≥ 5) within a range determined by `difficulty`.
 * 4. Constructs the question text and computes the correct answer using the `gcd` utility, along with plausible distractors.
 * 5. Sets global variables for answer validation.
 *
 * @example
 * ```typescript
 * generateGCFLCM();
 * generateGCFLCM("hard");
 * ```
 */
export function generateGCFLCM(difficulty?: string): void{
	if (!questionArea) return;
	let types=["gcf","lcm","word"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty||"medium",30);
	let a=Math.floor(Math.random()*maxVal)+5;
	let b=Math.floor(Math.random()*maxVal)+5;
	let g=gcd(a,b);
	let l=(a*b)/g;
	let hint="";
	switch (type){
		case "gcf":{
			questionArea.innerHTML=`Find the greatest common factor (GCF) of ${a} and ${b}.`;
			let choices=[g.toString()];
			choices.push((a).toString());
			choices.push((b).toString());
			choices.push((a+b).toString());
			choices.push(l.toString());
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: g.toString(),
				alternate: g.toString(),
				display: g.toString(),
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter a number";
			break;
		}
		case "lcm":{
			questionArea.innerHTML=`Find the least common multiple (LCM) of ${a} and ${b}.`;
			let choices=[l.toString()];
			choices.push((a).toString());
			choices.push((b).toString());
			choices.push((a*b).toString());
			choices.push(g.toString());
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: l.toString(),
				alternate: l.toString(),
				display: l.toString(),
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter a number";
			break;
		}
		case "word":{
			questionArea.innerHTML=`Two numbers are ${a} and ${b}. What is the largest number that divides both evenly?`;
			let choices=[g.toString()];
			choices.push((a).toString());
			choices.push((b).toString());
			choices.push((a+b).toString());
			choices.push(l.toString());
			let uniqueChoices=[...new Set(choices)];
			window.correctAnswer={
				correct: g.toString(),
				alternate: g.toString(),
				display: g.toString(),
				choices: uniqueChoices.slice(0,4)
			};
			hint="Enter a number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}