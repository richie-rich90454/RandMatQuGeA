import {questionArea} from "../../script.js";
import {getRangeForDifficulty} from "./arithmeticUtils.js";
/**
 * Generates and displays a random addition question.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 3 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 + num2 = ?` using LaTeX math delimiters ($$ ... $$).
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, `display`, and `choices` properties.
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available to render the math.
 *
 * @example
 * generateAddition();
 * generateAddition("hard");
 */
export function generateAddition(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty||"medium");
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(3));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(3));
	questionArea.innerHTML=`\$${num1}+${num2}=\$`;
	let result=(num1+num2).toFixed(3);
	let correctNumber=parseFloat(result);
	let choices=[result];
	choices.push((correctNumber+1).toFixed(3));
	choices.push((correctNumber-1).toFixed(3));
	choices.push((correctNumber+0.1).toFixed(3));
	choices.push((correctNumber*2).toFixed(3));
	let uniqueChoices=[...new Set(choices)];
	window.correctAnswer={
		correct: result,
		alternate: result,
		display: result,
		choices: uniqueChoices.slice(0,4)
	};
	window.expectedFormat="Enter a number (up to 3 decimals)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
/**
 * Generates and displays a random subtraction question.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 3 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 - num2 = ?` using LaTeX math delimiters ($$ ... $$).
 * 5. Sets global variables for answer validation.
 *
 * @example
 * generateSubtraction();
 * generateSubtraction("hard");
 */
export function generateSubtraction(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty||"medium");
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(3));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(3));
	questionArea.innerHTML=`\$${num1}-${num2}=\$`;
	let result=(num1-num2).toFixed(3);
	let correctNumber=parseFloat(result);
	let choices=[result];
	choices.push((correctNumber+1).toFixed(3));
	choices.push((correctNumber-1).toFixed(3));
	choices.push((correctNumber+0.1).toFixed(3));
	choices.push((correctNumber*2).toFixed(3));
	let uniqueChoices=[...new Set(choices)];
	window.correctAnswer={
		correct: result,
		alternate: result,
		display: result,
		choices: uniqueChoices.slice(0,4)
	};
	window.expectedFormat="Enter a number (up to 3 decimals)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
/**
 * Generates and displays a random multiplication question, rounding the answer to two decimal places.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 2 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 × num2 = ?` using LaTeX math delimiters ($$ ... $$),
 *    and includes an instruction to round the answer to two decimal places.
 * 5. Sets global variables for answer validation.
 *
 * @example
 * generateMultiplication();
 * generateMultiplication("hard");
 */
export function generateMultiplication(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty||"medium");
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(2));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(2));
	questionArea.innerHTML=`\$${num1} \\times ${num2}=\$<br>Round your answer to two decimal places`;
	let actualAnswer: number=num1*num2;
	let rounded=(Math.round(actualAnswer*100)/100).toFixed(2);
	let correctNumber=parseFloat(rounded);
	let choices=[rounded];
	choices.push((correctNumber+1).toFixed(2));
	choices.push((correctNumber-1).toFixed(2));
	choices.push((correctNumber+0.1).toFixed(2));
	choices.push((correctNumber*1.5).toFixed(2));
	let uniqueChoices=[...new Set(choices)];
	window.correctAnswer={
		correct: rounded,
		alternate: actualAnswer.toFixed(5),
		display: rounded,
		choices: uniqueChoices.slice(0,4)
	};
	window.expectedFormat="Enter a number rounded to 2 decimal places";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
/**
 * Generates and displays a random division question, rounding the answer to two decimal places.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 2 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 ÷ num2 = ?` using LaTeX math delimiters ($$ ... $$),
 *    and includes an instruction to round the answer to two decimal places.
 * 5. Sets global variables for answer validation.
 *
 * @example
 * generateDivision();
 * generateDivision("hard");
 */
export function generateDivision(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty||"medium");
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(2));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(2));
	if (num2===0) num2=1;
	questionArea.innerHTML=`\$${num1} \\div ${num2}=\$<br>Round your answer to two decimal places`;
	let actualAnswer: number=num1/num2;
	let rounded=(Math.round(actualAnswer*100)/100).toFixed(2);
	let correctNumber=parseFloat(rounded);
	let choices=[rounded];
	choices.push((correctNumber+1).toFixed(2));
	choices.push((correctNumber-1).toFixed(2));
	choices.push((correctNumber+0.1).toFixed(2));
	choices.push((correctNumber*1.5).toFixed(2));
	let uniqueChoices=[...new Set(choices)];
	window.correctAnswer={
		correct: rounded,
		alternate: actualAnswer.toFixed(5),
		display: rounded,
		choices: uniqueChoices.slice(0,4)
	};
	window.expectedFormat="Enter a number rounded to 2 decimal places";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}