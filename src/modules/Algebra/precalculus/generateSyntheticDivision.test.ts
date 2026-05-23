/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateSyntheticDivision} from "./generateSyntheticDivision";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));
describe("generateSyntheticDivision", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={typesetPromise: vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", ()=>{
		(questionArea as any)=null;
		generateSyntheticDivision();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates divide question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "divide"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6) // b -> floor(0.6*5)+1=3+1=4
			.mockReturnValueOnce(0.1) // c -> floor(0.1*5)+1=0+1=1
			.mockReturnValueOnce(0.5); // d -> floor(0.5*5)+1=2+1=3
		generateSyntheticDivision();
		expect(mockDiv.innerHTML).toContain("synthetic division");
		expect((window as any).expectedFormat).toBe("Enter polynomial");
	});
	it("generates remainder theorem question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "remainder"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6) // b
			.mockReturnValueOnce(0.1) // c
			.mockReturnValueOnce(0.5); // d
		generateSyntheticDivision();
		expect(mockDiv.innerHTML).toContain("Remainder Theorem");
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("generates factor question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "factor"
			.mockReturnValueOnce(0.3) // a -> 2
			.mockReturnValueOnce(0.6) // b -> 4
			.mockReturnValueOnce(0.1) // c (unused)
			.mockReturnValueOnce(0.5); // d (unused)
		generateSyntheticDivision();
		expect(mockDiv.innerHTML).toContain("factor");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "yes",
			display: "yes"
		});
	});
});
