/**
 * Discrete mathematics utility functions for combinatorics, statistics, and number helpers.
 * @fileoverview Provides factorial, permutation/combination (nPr/nCr), difficulty scaling, data range, statistical measures (mean, median, mode, range, standard deviation), and the ordinal suffix.
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
 * Computes the greatest common divisor of two integers.
 * @param a - first integer
 * @param b - second integer
 * @returns gcd of a and b
 */
export function gcd(a: number, b: number): number{
    return b===0 ? Math.abs(a) : gcd(b, a % b);
}
/**
 * Computes the least common multiple of two integers.
 * @param a - first integer
 * @param b - second integer
 * @returns lcm of a and b
 */
export function lcm(a: number, b: number): number{
    if (a===0 || b===0) return 0;
    return Math.abs(a*b)/gcd(a,b);
}
/**
 * Computes the number of permutations (nPr): n!/(n-r)!.
 *
 * The product is accumulated rather than divided, because the closed form divides
 * and a quotient of two exactly representable integers is not always exactly
 * representable: P(13,5) divided the hard way prints as 154828800.00000003.
 *
 * @param n - total items
 * @param r - selected items
 * @returns nPr or 0 if r>n
 */
export function nPr(n: number, r: number): number{
    if (r>n) return 0;
    let result=1;
    for(let i=0; i<r; i++) result*=n-i;
    return result;
}
/**
 * Computes the number of combinations (nCr): n!/(r!(n-r)!).
 *
 * Built from the exact recurrence C(n-r+i, i) = C(n-r+i-1, i-1) * (n-r+i) / i, which
 * divides at every step by a number that makes the running value a whole number.
 * The closed form divides once by a product of two factorials, and that quotient is
 * not always exactly representable: C(16,7) comes out as 11440.000000000002.
 *
 * @param n - total items
 * @param r - selected items
 * @returns nCr or 0 if r>n
 */
export function nCr(n: number, r: number): number{
    if (r>n||r<0) return 0;
    let k=Math.min(r, n-r);
    let result=1;
    for(let i=1; i<=k; i++) result=result*(n-k+i)/i;
    return Math.round(result);
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
