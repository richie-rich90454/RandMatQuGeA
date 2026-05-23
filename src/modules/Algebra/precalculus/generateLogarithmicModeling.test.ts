/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateLogarithmicModeling} from "./generateLogarithmicModeling";
import {questionArea} from "../../../script.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateLogarithmicModeling", ()=>{
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
		generateLogarithmicModeling();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates Richter scale question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "richter"
			.mockReturnValueOnce(0.5); // intensity -> floor(0.5*1000)+100=500+100=600
		generateLogarithmicModeling();
		expect(mockDiv.innerHTML).toContain("Richter");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("generates pH question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "ph"
			.mockReturnValueOnce(0.5) // intensity (unused in ph)
			.mockReturnValueOnce(0.5); // exponent -> -floor(0.5*7)-1=-3-1=-4
		generateLogarithmicModeling();
		expect(mockDiv.innerHTML).toContain("pH");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("generates decibel question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "decibel"
			.mockReturnValueOnce(0.5) // intensity (unused, consumed)
			.mockReturnValueOnce(0.5); // power -> floor(0.5*1000)+10=500+10=510
		generateLogarithmicModeling();
		expect(mockDiv.innerHTML).toContain("decibels");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
});
