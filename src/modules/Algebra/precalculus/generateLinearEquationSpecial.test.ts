/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateLinearEquationSpecial} from "./generateLinearEquationSpecial";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));
describe("generateLinearEquationSpecial", ()=>{
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
		generateLinearEquationSpecial();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates identity question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "identity"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6); // b -> floor(0.6*5)+1=3+1=4
		generateLinearEquationSpecial();
		expect(mockDiv.innerHTML).toContain("identity");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "identity",
			display: "identity"
		});
		expect((window as any).expectedFormat).toBe("Enter 'identity', 'contradiction', or the solution");
	});
	it("generates contradiction question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "contradiction"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6); // b
		generateLinearEquationSpecial();
		expect(mockDiv.innerHTML).toContain("contradiction");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "contradiction",
			display: "contradiction"
		});
	});
});
