import { describe, it, expect } from "vitest";
import { seededRng, randInt, pick, shuffle } from "./rng";
describe("seededRng", ()=>{
	it("returns values in [0, 1)", ()=>{
		let rng = seededRng(12345);
		for (let i = 0; i < 100; i++){
			let v = rng();
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
	it("produces identical sequences for the same seed", ()=>{
		let rng1 = seededRng(42);
		let rng2 = seededRng(42);
		let seq1: number[] = [];
		let seq2: number[] = [];
		for (let i = 0; i < 100; i++){
			seq1.push(rng1());
			seq2.push(rng2());
		}
		expect(seq1).toEqual(seq2);
	});
	it("produces different sequences for different seeds", ()=>{
		let rng1 = seededRng(1);
		let rng2 = seededRng(2);
		let diff = false;
		for (let i = 0; i < 10; i++){
			if (rng1() !== rng2()){
				diff = true;
				break;
			}
		}
		expect(diff).toBe(true);
	});
	it("handles seed of 0", ()=>{
		let rng = seededRng(0);
		let v = rng();
		expect(v).toBeGreaterThanOrEqual(0);
		expect(v).toBeLessThan(1);
	});
	it("handles large seeds", ()=>{
		let rng = seededRng(4294967295);
		let v = rng();
		expect(v).toBeGreaterThanOrEqual(0);
		expect(v).toBeLessThan(1);
	});
});
describe("randInt", ()=>{
	it("returns integers in [min, max]", ()=>{
		let rng = seededRng(100);
		for (let i = 0; i < 100; i++){
			let v = randInt(rng, 1, 10);
			expect(Number.isInteger(v)).toBe(true);
			expect(v).toBeGreaterThanOrEqual(1);
			expect(v).toBeLessThanOrEqual(10);
		}
	});
	it("returns min when min === max", ()=>{
		let rng = seededRng(100);
		expect(randInt(rng, 5, 5)).toBe(5);
	});
	it("swaps min/max when inverted", ()=>{
		let rng = seededRng(100);
		let v = randInt(rng, 10, 1);
		expect(v).toBeGreaterThanOrEqual(1);
		expect(v).toBeLessThanOrEqual(10);
	});
});
describe("pick", ()=>{
	it("returns an element from the array", ()=>{
		let rng = seededRng(7);
		let arr = [1, 2, 3, 4, 5];
		let v = pick(rng, arr);
		expect(arr).toContain(v);
	});
	it("throws on empty array", ()=>{
		let rng = seededRng(7);
		expect(()=>pick(rng, [])).toThrow();
	});
});
describe("shuffle", ()=>{
	it("preserves the multiset of elements", ()=>{
		let rng = seededRng(99);
		let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		let original = [...arr];
		shuffle(rng, arr);
		expect(arr.sort()).toEqual(original.sort());
	});
	it("produces identical output for the same seed", ()=>{
		let rng1 = seededRng(50);
		let rng2 = seededRng(50);
		let arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		let arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		shuffle(rng1, arr1);
		shuffle(rng2, arr2);
		expect(arr1).toEqual(arr2);
	});
	it("handles single-element arrays", ()=>{
		let rng = seededRng(50);
		let arr = [42];
		shuffle(rng, arr);
		expect(arr).toEqual([42]);
	});
});
