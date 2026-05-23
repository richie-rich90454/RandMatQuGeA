/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateBasicFunctions} from "./generateBasicFunctions";
import {questionArea} from "../../../script.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateBasicFunctions", ()=>{
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
		generateBasicFunctions();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates identify question type correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // chosen index 0 -> "identity"
			.mockReturnValueOnce(0.0); // type index 0 -> "identify"
		generateBasicFunctions();
		expect(mockDiv.innerHTML).toContain("Identify the function");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "identity",
			alternate: "identity",
			display: "identity"
		});
		expect((window as any).expectedFormat).toBe("Enter the function name");
	});
	it("generates properties question type correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // chosen index 0 -> "identity"
			.mockReturnValueOnce(0.5); // type index 1 -> "properties"
		generateBasicFunctions();
		expect(mockDiv.innerHTML).toContain("Give one key property");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "linear, odd, increasing",
			alternate: "linear, odd, increasing",
			display: "linear, odd, increasing"
		});
		expect((window as any).expectedFormat).toBe("Enter a property (e.g., 'even', 'increasing')");
	});
	it("generates different function correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // chosen index 1 -> "squaring"
			.mockReturnValueOnce(0.0); // type index 0 -> "identify"
		generateBasicFunctions();
		expect((window as any).correctAnswer).toMatchObject({
			correct: "squaring",
			display: "squaring"
		});
	});
	it("does not call MathJax.typesetPromise if MathJax is missing", ()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		generateBasicFunctions();
		expect((window as any).MathJax).toBeUndefined();
	});
});
