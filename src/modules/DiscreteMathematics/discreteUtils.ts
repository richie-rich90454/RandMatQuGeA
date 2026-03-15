/**
 * Discrete mathematics utility functions for combinatorics, statistics, and number helpers.
 * @fileoverview Provides factorial, permutation/combination (nPr/nCr), difficulty scaling, data range, statistical measures (mean, median, mode, range, standard deviation), and ordinal suffix.
 * @date 2026-03-15
 */
/**
 * Computes the factorial of a non-negative integer.
 * @param n - integer >= 0
 * @returns n! or NaN if n<0
 */
export function factorial(n: number): number{
	if (n<0) return NaN;
	let res=1;
	for (let i=2; i<=n; i++) res*=i;
	return res;
}
/**
 * Computes the number of permutations (nPr): n!/(n-r)!.
 * @param n - total items
 * @param r - selected items
 * @returns nPr or 0 if r>n
 */
export function nPr(n: number, r: number): number{
	return r>n?0:factorial(n)/factorial(n-r);
}
/**
 * Computes the number of combinations (nCr): n!/(r!(n-r)!).
 * @param n - total items
 * @param r - selected items
 * @returns nCr or 0 if r>n
 */
export function nCr(n: number, r: number): number{
	return r>n?0:factorial(n)/(factorial(r)*factorial(n-r));
}
/**
 * Returns the maximum allowed value for n in combinatorial generators based on difficulty.
 * @param difficulty - 'easy', 'hard', or undefined (medium)
 * @returns max N
 */
export function getMaxN(difficulty?: string): number{
	if (difficulty==="easy") return 6;
	if (difficulty==="hard") return 12;
	return 8;
}
/**
 * Returns range configuration for statistical data generation based on difficulty.
 * @param difficulty - 'easy', 'hard', or undefined (medium)
 * @returns object with min, max, and count of data points
 */
export function getDataRange(difficulty?: string): {min: number, max: number, count: number}{
	if (difficulty==="easy") return {min: 1, max: 20, count: 5};
	if (difficulty==="hard") return {min: -50, max: 100, count: 15};
	return {min: 0, max: 50, count: 10};
}
/**
 * Computes the arithmetic mean of an array.
 * @param arr - array of numbers
 * @returns mean value
 */
export function mean(arr: number[]): number{
	return arr.reduce((a,b)=>a+b,0)/arr.length;
}
/**
 * Computes the median of an array.
 * @param arr - array of numbers
 * @returns median value
 */
export function median(arr: number[]): number{
	let sorted=[...arr].sort((a,b)=>a-b);
	let mid=Math.floor(sorted.length/2);
	if (sorted.length%2===0) return (sorted[mid-1]+sorted[mid])/2;
	return sorted[mid];
}
/**
 * Finds the mode(s) of an array (most frequent values).
 * @param arr - array of numbers
 * @returns array of modes (may be multiple)
 */
export function mode(arr: number[]): number[]{
	let freq: Record<number,number>={};
	arr.forEach(v=>freq[v]=(freq[v]||0)+1);
	let maxFreq=Math.max(...Object.values(freq));
	return Object.keys(freq).filter(k=>freq[parseInt(k)]===maxFreq).map(Number);
}
/**
 * Computes the range (max - min) of an array.
 * @param arr - array of numbers
 * @returns range
 */
export function range(arr: number[]): number{
	return Math.max(...arr)-Math.min(...arr);
}
/**
 * Computes the population standard deviation of an array.
 * @param arr - array of numbers
 * @returns standard deviation
 */
export function stdDev(arr: number[]): number{
	let m=mean(arr);
	let sqDiff=arr.map(v=>Math.pow(v-m,2));
	return Math.sqrt(mean(sqDiff));
}
/**
 * Returns the ordinal suffix for a given integer (e.g., 1 -> "st", 2 -> "nd").
 * @param n - integer
 * @returns suffix string (e.g., "th", "st", "nd", "rd")
 */
export function getOrdinal(n: number): string{
	let s=["th", "st", "nd", "rd"];
	let v=n%100;
	return s[(v-20)%10]||s[v]||s[0];
}