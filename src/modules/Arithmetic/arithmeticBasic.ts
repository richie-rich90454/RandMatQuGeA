import {questionArea} from "../../script.js";
import {getRangeForDifficulty} from "./arithmeticUtils.js";

/**
 * Generates and displays a random addition question.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 3 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 + num2 = ?` using LaTeX math delimiters ($$ ... $$).
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties
 *      (all set to the sum rounded to 3 decimals).
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available to render the math.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getRangeForDifficulty` (imported from `./arithmeticUtils.js`) – provides the number range.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate an addition question with default difficulty
 * generateAddition();
 *
 * // Generate a hard addition question
 * generateAddition("hard");
 * ```
 */
export function generateAddition(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty);
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(3));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(3));
	questionArea.innerHTML=`\$${num1}+${num2}=\$`;
	let result=(num1+num2).toFixed(3);
	window.correctAnswer={
		correct: result,
		alternate: result,
		display: result
	};
	window.expectedFormat="Enter a number (up to 3 decimals)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

/**
 * Generates and displays a random subtraction question.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 3 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 - num2 = ?` using LaTeX math delimiters ($$ ... $$).
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties
 *      (all set to the difference rounded to 3 decimals).
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available to render the math.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getRangeForDifficulty` (imported from `./arithmeticUtils.js`) – provides the number range.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a subtraction question with default difficulty
 * generateSubtraction();
 *
 * // Generate a hard subtraction question
 * generateSubtraction("hard");
 * ```
 */
export function generateSubtraction(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty);
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(3));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(3));
	questionArea.innerHTML=`\$${num1}-${num2}=\$`;
	let result=(num1-num2).toFixed(3);
	window.correctAnswer={
		correct: result,
		alternate: result,
		display: result
	};
	window.expectedFormat="Enter a number (up to 3 decimals)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

/**
 * Generates and displays a random multiplication question, rounding the answer to two decimal places.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 2 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 × num2 = ?` using LaTeX math delimiters ($$ ... $$),
 *    and includes an instruction to round the answer to two decimal places.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct` (rounded to 2 decimals),
 *      `alternate` (full precision), and `display` (same as `correct`) properties.
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available to render the math.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getRangeForDifficulty` (imported from `./arithmeticUtils.js`) – provides the number range.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a multiplication question with default difficulty
 * generateMultiplication();
 *
 * // Generate a hard multiplication question
 * generateMultiplication("hard");
 * ```
 */
export function generateMultiplication(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty);
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(2));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(2));
	questionArea.innerHTML=`\$${num1} \\times ${num2}=\$<br>Round your answer to two decimal places`;
	let actualAnswer: number=num1*num2;
	let rounded=(Math.round(actualAnswer*100)/100).toFixed(2);
	window.correctAnswer={
		correct: rounded,
		alternate: actualAnswer.toFixed(5),
		display: rounded
	};
	window.expectedFormat="Enter a number rounded to 2 decimal places";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

/**
 * Generates and displays a random division question, rounding the answer to two decimal places.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the range of numbers used (via `getRangeForDifficulty`). If omitted,
 *                     a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Obtains a numeric range (min, max) based on `difficulty` from `getRangeForDifficulty`.
 * 3. Generates two random numbers with up to 2 decimal places: the first within the full range,
 *    the second within [0, range.max].
 * 4. Displays the question as `num1 ÷ num2 = ?` using LaTeX math delimiters ($$ ... $$),
 *    and includes an instruction to round the answer to two decimal places.
 * 5. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct` (rounded to 2 decimals),
 *      `alternate` (full precision), and `display` (same as `correct`) properties.
 *    - `window.expectedFormat` – a string describing the expected input format.
 * 6. Calls `window.MathJax.typeset()` if MathJax is available to render the math.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getRangeForDifficulty` (imported from `./arithmeticUtils.js`) – provides the number range.
 * - `window.MathJax` – optional; if present, `MathJax.typeset()` is called.
 *
 * @example
 * ```typescript
 * // Generate a division question with default difficulty
 * generateDivision();
 *
 * // Generate a hard division question
 * generateDivision("hard");
 * ```
 */
export function generateDivision(difficulty?: string): void{
	if (!questionArea) return;
	let range=getRangeForDifficulty(difficulty);
	let num1: number=parseFloat(((Math.random()*(range.max-range.min))+range.min).toFixed(2));
	let num2: number=parseFloat((Math.random()*range.max).toFixed(2));
	questionArea.innerHTML=`\$${num1} \\div ${num2}=\$<br>Round your answer to two decimal places`;
	let actualAnswer: number=num1/num2;
	let rounded=(Math.round(actualAnswer*100)/100).toFixed(2);
	window.correctAnswer={
		correct: rounded,
		alternate: actualAnswer.toFixed(5),
		display: rounded
	};
	window.expectedFormat="Enter a number rounded to 2 decimal places";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}