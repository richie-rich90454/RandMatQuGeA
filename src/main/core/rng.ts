import type { RngFn } from "../../types/global";
/**
 * Mulberry32 seeded PRNG. Returns a function that produces deterministic
 * floats in [0, 1) given a 32-bit seed. Same seed always yields the same
 * sequence, enabling reproducible worksheets.
 * @param seed 32-bit unsigned integer seed
 * @returns () => number in [0, 1)
 */
export function seededRng(seed: number): RngFn{
	let a = seed >>> 0;
	return (): number=>{
		a |= 0;
		a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
/**
 * Helper: pick a random integer in [min, max] inclusive using the given RNG.
 */
export function randInt(rng: RngFn, min: number, max: number): number{
	if (max < min){
		let tmp = min;
		min = max;
		max = tmp;
	}
	return Math.floor(rng() * (max - min + 1)) + min;
}
/**
 * Helper: pick a random element from an array using the given RNG.
 */
export function pick<T>(rng: RngFn, arr: T[]): T{
	if (arr.length === 0) throw new Error("pick: empty array");
	return arr[Math.floor(rng() * arr.length)];
}
/**
 * Helper: shuffle an array in-place using Fisher-Yates with the given RNG.
 */
export function shuffle<T>(rng: RngFn, arr: T[]): T[]{
	for (let i = arr.length - 1; i > 0; i--){
		let j = Math.floor(rng() * (i + 1));
		let tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
}
