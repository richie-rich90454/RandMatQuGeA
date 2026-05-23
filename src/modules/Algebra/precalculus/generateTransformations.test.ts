/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateTransformations} from "./generateTransformations";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));
describe("generateTransformations", ()=>{
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
		generateTransformations();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates translation question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "translation"
			.mockReturnValueOnce(0.3) // h -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6) // k -> floor(0.6*5)+1=3+1=4
			.mockReturnValueOnce(0.1); // a -> floor(0.1*2)+1=0+1=1
		generateTransformations();
		expect(mockDiv.innerHTML).toContain("shifted");
		expect((window as any).expectedFormat).toBe("Enter as y = (x-h)^2 + k");
	});
	it("generates reflection question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "reflection"
			.mockReturnValueOnce(0.3) // h
			.mockReturnValueOnce(0.6) // k
			.mockReturnValueOnce(0.1) // a
			.mockReturnValueOnce(0.2); // axis -> Math.random()<0.5 -> "x-axis"
		generateTransformations();
		expect(mockDiv.innerHTML).toContain("reflected");
		expect((window as any).expectedFormat).toBe("Enter equation");
	});
	it("generates stretch question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "stretch"
			.mockReturnValueOnce(0.3) // h
			.mockReturnValueOnce(0.6) // k
			.mockReturnValueOnce(0.1); // a -> 1
		generateTransformations();
		expect(mockDiv.innerHTML).toContain("stretched");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "y = 1|x|",
			display: "y = 1|x|"
		});
	});
});
