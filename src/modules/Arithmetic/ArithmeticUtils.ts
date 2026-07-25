/**
 * Returns a numeric range {min, max} based on the given difficulty level.
 * Used by arithmetic question generators to control the range of numbers.
 *
 * @param difficulty - Optional difficulty level: `"easy"`, `"medium"` (default), or `"hard"`.
 * @returns An object with `min` and `max` properties defining the allowed range.
 * @date 2026-03-29
 *
 * @remarks
 * - `"easy"`:   {min: 1, max: 50}
 * - `"medium"`: {min: -1000, max: 1500} (default)
 * - `"hard"`:   {min: -1000, max: 3000}
 *
 * @example
 * const range = getRangeForDifficulty("easy"); // {min: 1, max: 50}
 */
export function getRangeForDifficulty(difficulty?: string): {min: number, max: number}{
	if (difficulty==="easy") return {min: 1, max: 50};
	if (difficulty==="hard") return {min: -1000, max: 3000};
	return {min: -1000, max: 1500};
}
/**
 * Returns a maximum value scaled from a base maximum according to difficulty.
 *
 * @param difficulty - Optional difficulty level: `"easy"`, `"medium"` (default), or `"hard"`.
 * @param baseMax - The base maximum value to scale (default 10).
 * @returns The scaled maximum value (floor of factor times baseMax).
 * @date 2026-03-29
 *
 * @remarks
 * Scaling factors:
 * - `"easy"`:   0.5 × baseMax
 * - `"medium"`: 1.0 × baseMax (default)
 * - `"hard"`:   2.0 × baseMax
 *
 * @example
 * const max = getMaxForDifficulty("hard", 100); // returns 200
 */
export function getMaxForDifficulty(difficulty?: string, baseMax: number=10): number{
	if (difficulty==="easy") return Math.floor(baseMax*0.5);
	if (difficulty==="hard") return Math.floor(baseMax*2);
	return baseMax;
}
/**
 * Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 *
 * @param a - First integer.
 * @param b - Second integer.
 * @returns The greatest common divisor (non‑negative).
 * @date 2026-03-29
 *
 * @remarks
 * The function is recursive and handles negative inputs by returning the absolute value.
 * It uses the standard Euclidean algorithm: gcd(a, b) = gcd(b, a % b) until b is 0.
 *
 * @example
 * gcd(12, 18); // returns 6
 * gcd(-12, 18); // returns 6
 */
export function gcd(a: number, b: number): number{
	return b===0 ? Math.abs(a) : gcd(b, a % b);
}
/**
 * Determines whether a given number is prime.
 *
 * @param n - The integer to test (should be a whole number).
 * @returns `true` if the number is prime, `false` otherwise.
 * @date 2026-03-29
 *
 * @remarks
 * - Returns `false` for numbers less than 2.
 * - Handles 2 as a special case (the only even prime).
 * - For odd numbers, checks divisibility up to √n.
 *
 * @example
 * isPrime(7);  // returns true
 * isPrime(10); // returns false
 * isPrime(1);  // returns false
 */
export function isPrime(n: number): boolean{
	if (n<2) return false;
	if (n===2) return true;
	if (n%2===0) return false;
	for (let i=3; i*i<=n; i+=2){
		if (n%i===0) return false;
	}
	return true;
}