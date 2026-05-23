/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateRationalGraphAnalysis} from "./generateRationalGraphAnalysis";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));
describe("generateRationalGraphAnalysis", ()=>{
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
		generateRationalGraphAnalysis();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates domain question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "domain"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6) // b -> floor(0.6*5)+1=3+1=4
			.mockReturnValueOnce(0.1); // c (unused in domain)
		generateRationalGraphAnalysis();
		expect(mockDiv.innerHTML).toContain("domain");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "(-∞, 4) ∪ (4, ∞)",
			display: "(-∞, 4) ∪ (4, ∞)"
		});
	});
	it("generates asymptotes question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "asymptotes"
			.mockReturnValueOnce(0.3) // a -> 2
			.mockReturnValueOnce(0.6) // b -> 4
			.mockReturnValueOnce(0.1); // c -> 1
		generateRationalGraphAnalysis();
		expect(mockDiv.innerHTML).toContain("asymptotes");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "VA: x=1, HA: y=2",
			display: "VA: x=1, HA: y=2"
		});
	});
	it("generates holes question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "holes"
			.mockReturnValueOnce(0.3) // a -> 2
			.mockReturnValueOnce(0.6) // b -> 4
			.mockReturnValueOnce(0.1); // c (unused)
		generateRationalGraphAnalysis();
		expect(mockDiv.innerHTML).toContain("hole");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "x = 2",
			display: "x = 2"
		});
	});
});
