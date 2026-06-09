/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generatePolynomialInequality} from "./generatePolynomialInequality";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>3)
}));
describe("generatePolynomialInequality", ()=>{
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
		generatePolynomialInequality();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates inequality with valid content", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3) // root1 -> floor(0.3*6)-3=1-3=-2
			.mockReturnValueOnce(0.6) // root2 -> floor(0.6*6)-3=3-3=0
			.mockReturnValueOnce(0.9); // root3 -> floor(0.9*6)-3=5-3=2
		generatePolynomialInequality();
		expect(mockDiv.innerHTML).toContain("Solve the inequality");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBe("Enter intervals like (-∞,1) ∪ (3,∞)");
	});
	it("sets correctAnswer with expected properties", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.9);
		generatePolynomialInequality();
		expect((window as any).correctAnswer).toMatchObject({
			alternate: expect.any(String),
			display: expect.any(String)
		});
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.9);
		generatePolynomialInequality();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.9);
		generatePolynomialInequality();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.9);
		generatePolynomialInequality("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.9);
		generatePolynomialInequality("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.9);
		generatePolynomialInequality("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
