/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateCartesianConcepts} from "./generateCartesianConcepts";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>10)
}));
describe("generateCartesianConcepts", ()=>{
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
		generateCartesianConcepts();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates quadrant question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "quadrant"
			.mockReturnValueOnce(0.6) // x -> floor(0.6*20)-10=12-10=2
			.mockReturnValueOnce(0.8); // y -> floor(0.8*20)-10=16-10=6
		generateCartesianConcepts();
		expect(mockDiv.innerHTML).toContain("quadrant");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "I",
			display: "I"
		});
	});
	it("generates distance question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.25) // type "distance"
			.mockReturnValueOnce(0.1) // x1 -> floor(0.1*10)=1
			.mockReturnValueOnce(0.2) // y1 -> floor(0.2*10)=2
			.mockReturnValueOnce(0.3) // x2 -> floor(0.3*10)=3
			.mockReturnValueOnce(0.4); // y2 -> floor(0.4*10)=4
		generateCartesianConcepts();
		expect(mockDiv.innerHTML).toContain("distance");
		expect((window as any).expectedFormat).toBe("Enter a decimal rounded to two places");
	});
	it("generates midpoint question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "midpoint"
			.mockReturnValueOnce(0.1) // x1
			.mockReturnValueOnce(0.2) // y1
			.mockReturnValueOnce(0.3) // x2
			.mockReturnValueOnce(0.4); // y2
		generateCartesianConcepts();
		expect(mockDiv.innerHTML).toContain("midpoint");
		expect((window as any).expectedFormat).toBe("Enter as (x, y)");
	});
	it("generates plot question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.75) // type "plot"
			.mockReturnValueOnce(0.1) // x -> floor(0.1*10)+1=1+1=2
			.mockReturnValueOnce(0.2); // y -> floor(0.2*10)+1=2+1=3
		generateCartesianConcepts();
		expect(mockDiv.innerHTML).toContain("units right");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "(2, 3)",
			display: "(2, 3)"
		});
	});
	it("uses getMaxForDifficulty with provided difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type
			.mockReturnValueOnce(0.1) // x
			.mockReturnValueOnce(0.2); // y
		generateCartesianConcepts("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		generateCartesianConcepts();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.25)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		generateCartesianConcepts();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		generateCartesianConcepts("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		generateCartesianConcepts("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		generateCartesianConcepts("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
