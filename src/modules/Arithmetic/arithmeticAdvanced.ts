import {questionArea} from "../../script.js";
import {getMaxForDifficulty, isPrime, gcd} from "./arithmeticUtils.js";

/**
 * Generates and displays a random whole number and place value question (place value, expanded form, or rounding).
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the maximum
 *                     number value used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from `["place_value", "expanded_form", "rounding"]`.
 * 3. Generates a random number (at least 100) within a range determined by `difficulty`.
 * 4. Constructs the question text and computes the correct answer.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties (all equal to the answer).
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available (for potential LaTeX rendering, though these questions are plain text).
 *
 * **Question types**:
 * - `place_value`   – asks for the place value of a specific digit in the number (e.g., 500 for the hundreds place).
 * - `expanded_form` – asks to write the number in expanded form (e.g., "200 + 30 + 4").
 * - `rounding`      – asks to round the number to the nearest ten, hundred, or thousand.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxForDifficulty` (imported from `./arithmeticUtils.js`) – provides the maximum number range.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a place value question with default difficulty
 * generateWholeNumberPlaceValue();
 *
 * // Generate a hard rounding question
 * generateWholeNumberPlaceValue("hard");
 * ```
 */
export function generateWholeNumberPlaceValue(difficulty?: string): void{
	if (!questionArea) return;
	let types=["place_value","expanded_form","rounding"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxNum=getMaxForDifficulty(difficulty,9999);
	let num=Math.floor(Math.random()*maxNum)+100;
	let hint="";
	switch (type){
		case "place_value":{
			let digits=num.toString().split("");
			let placeIndex=Math.floor(Math.random()*digits.length);
			let placeValue=parseInt(digits[placeIndex])*Math.pow(10,digits.length-1-placeIndex);
			questionArea.innerHTML=`What is the place value of the digit ${digits[placeIndex]} in ${num}? (e.g., 500 or "hundreds")`;
			window.correctAnswer={
				correct: placeValue.toString(),
				alternate: placeValue.toString(),
				display: placeValue.toString()
			};
			hint="Enter a number (e.g., 500)";
			break;
		}
		case "expanded_form":{
			let expanded=num.toString().split("").map((d,i)=>parseInt(d)*Math.pow(10,num.toString().length-1-i)).filter(v=>v!==0).join(" + ");
			questionArea.innerHTML=`Write ${num} in expanded form.`;
			window.correctAnswer={
				correct: expanded,
				alternate: expanded,
				display: expanded
			};
			hint="Enter as 200 + 30 + 4";
			break;
		}
		case "rounding":{
			let place=Math.pow(10,Math.floor(Math.random()*3)+1);
			let rounded=Math.round(num/place)*place;
			questionArea.innerHTML=`Round ${num} to the nearest ${place===10?"ten":place===100?"hundred":"thousand"}.`;
			window.correctAnswer={
				correct: rounded.toString(),
				alternate: rounded.toString(),
				display: rounded.toString()
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
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the range
 *                     of numbers used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Generates four random integers within a range determined by `difficulty` (may include negatives).
 *    It ensures at least one negative and one positive number are present.
 * 3. Constructs the question text asking to order the numbers from least to greatest.
 * 4. Computes the correct sorted order.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties (all equal to the sorted list).
 *    - `window.expectedFormat` – a string describing the expected input format (e.g., "-3, 0, 5, 7").
 * 6. Calls `window.MathJax.typeset()` if MathJax is available (though no LaTeX is used).
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxForDifficulty` (imported from `./arithmeticUtils.js`) – provides the number range.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a number line ordering question with default difficulty
 * generateNumberLineOrdering();
 *
 * // Generate a hard question (larger range)
 * generateNumberLineOrdering("hard");
 * ```
 */
export function generateNumberLineOrdering(difficulty?: string): void{
	if (!questionArea) return;
	let range=getMaxForDifficulty(difficulty,20);
	let numbers: number[]=[];
	for (let i=0; i<4; i++){
		numbers.push(Math.floor(Math.random()*range*2)-range);
	}
	if (!numbers.some(n=>n<0)) numbers[0]=-numbers[0];
	if (!numbers.some(n=>n>0)) numbers[1]=Math.abs(numbers[1])+1;
	let sorted=[...numbers].sort((a,b)=>a-b);
	questionArea.innerHTML=`Order the numbers from least to greatest: ${numbers.join(", ")}.`;
	window.correctAnswer={
		correct: sorted.join(", "),
		alternate: sorted.join(", "),
		display: sorted.join(", ")
	};
	window.expectedFormat="Enter numbers separated by commas, e.g., -3, 0, 5, 7";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

/**
 * Generates and displays a random divisibility question (rules, prime/composite identification, or checking divisibility).
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the maximum
 *                     number value used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from `["rule", "identify_prime", "divisible_by"]`.
 * 3. Generates a random number (≥ 2) within a range determined by `difficulty`.
 * 4. Constructs the question text and computes the correct answer.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties (all equal to the answer).
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available (though no LaTeX is used).
 *
 * **Question types**:
 * - `rule`            – asks to state the divisibility rule for a given divisor (2, 3, 5, 9, or 10).
 * - `identify_prime`  – asks whether a given number is prime or composite.
 * - `divisible_by`    – asks whether a given number is divisible by a randomly chosen divisor (2,3,4,5,6,8,9,10).
 *                      The number may be adjusted to ensure divisibility half the time.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxForDifficulty`, `isPrime` (imported from `./arithmeticUtils.js`) – provide range and primality test.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a divisibility rule question with default difficulty
 * generateDivisibility();
 *
 * // Generate a hard prime identification question
 * generateDivisibility("hard");
 * ```
 */
export function generateDivisibility(difficulty?: string): void{
	if (!questionArea) return;
	let types=["rule","identify_prime","divisible_by"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxNum=getMaxForDifficulty(difficulty,100);
	let num=Math.floor(Math.random()*maxNum)+2;
	let hint="";
	switch (type){
		case "rule":{
			let divisors=[2,3,5,9,10];
			let d=divisors[Math.floor(Math.random()*divisors.length)];
			let rule="";
			if (d===2) rule="A number is divisible by 2 if its last digit is even.";
			else if (d===3) rule="A number is divisible by 3 if the sum of its digits is divisible by 3.";
			else if (d===5) rule="A number is divisible by 5 if its last digit is 0 or 5.";
			else if (d===9) rule="A number is divisible by 9 if the sum of its digits is divisible by 9.";
			else if (d===10) rule="A number is divisible by 10 if its last digit is 0.";
			questionArea.innerHTML=`State the divisibility rule for ${d}.`;
			window.correctAnswer={
				correct: rule,
				alternate: rule,
				display: rule
			};
			hint="Enter the rule in your own words";
			break;
		}
		case "identify_prime":{
			let isPrimeNum=isPrime(num);
			questionArea.innerHTML=`Is ${num} prime or composite?`;
			window.correctAnswer={
				correct: isPrimeNum?"prime":"composite",
				alternate: isPrimeNum?"prime":"composite",
				display: isPrimeNum?"prime":"composite"
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
			questionArea.innerHTML=`Is ${num} divisible by ${d}? (yes/no)`;
			window.correctAnswer={
				correct: isDivisible?"yes":"no",
				alternate: isDivisible?"yes":"no",
				display: isDivisible?"yes":"no"
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
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences the maximum
 *                     number value used (via `getMaxForDifficulty`). If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from `["gcf", "lcm", "word"]`.
 * 3. Generates two random numbers (≥ 5) within a range determined by `difficulty`.
 * 4. Constructs the question text and computes the correct answer using the `gcd` utility.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties (all equal to the answer).
 *    - `window.expectedFormat` – a string describing the expected input format (usually "Enter a number").
 * 6. Calls `window.MathJax.typeset()` if MathJax is available (though no LaTeX is used).
 *
 * **Question types**:
 * - `gcf`  – find the greatest common factor of the two numbers.
 * - `lcm`  – find the least common multiple of the two numbers.
 * - `word` – a word problem asking for the largest number that divides both evenly (same as GCF).
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxForDifficulty`, `gcd` (imported from `./arithmeticUtils.js`) – provide range and GCF calculation.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a GCF question with default difficulty
 * generateGCFLCM();
 *
 * // Generate a hard LCM question
 * generateGCFLCM("hard");
 * ```
 */
export function generateGCFLCM(difficulty?: string): void{
	if (!questionArea) return;
	let types=["gcf","lcm","word"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,30);
	let a=Math.floor(Math.random()*maxVal)+5;
	let b=Math.floor(Math.random()*maxVal)+5;
	let hint="";
	switch (type){
		case "gcf":{
			let g=gcd(a,b);
			questionArea.innerHTML=`Find the greatest common factor (GCF) of ${a} and ${b}.`;
			window.correctAnswer={
				correct: g.toString(),
				alternate: g.toString(),
				display: g.toString()
			};
			hint="Enter a number";
			break;
		}
		case "lcm":{
			let l=(a*b)/gcd(a,b);
			questionArea.innerHTML=`Find the least common multiple (LCM) of ${a} and ${b}.`;
			window.correctAnswer={
				correct: l.toString(),
				alternate: l.toString(),
				display: l.toString()
			};
			hint="Enter a number";
			break;
		}
		case "word":{
			let g=gcd(a,b);
			questionArea.innerHTML=`Two numbers are ${a} and ${b}. What is the largest number that divides both evenly?`;
			window.correctAnswer={
				correct: g.toString(),
				alternate: g.toString(),
				display: g.toString()
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