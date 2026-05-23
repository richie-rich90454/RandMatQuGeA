/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateInverseFunctions} from "./generateInverseFunctions";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));
describe("generateInverseFunctions", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={typeset: vi.fn()};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", ()=>{
		(questionArea as any)=null;
		generateInverseFunctions();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates find inverse question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "find"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6); // b -> floor(0.6*5)+1=3+1=4
		generateInverseFunctions();
		expect(mockDiv.innerHTML).toContain("Find the inverse");
		expect((window as any).correctAnswer).toMatchObject({
			alternate: "(x-4)/2"
		});
		expect((window as any).correctAnswer.correct).toContain("f^{-1}(x)");
		expect((window as any).correctAnswer.display).toContain("f^{-1}(x)");
	});
	it("generates verify inverse question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "verify"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6); // b
		generateInverseFunctions();
		expect(mockDiv.innerHTML).toContain("Verify");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "true",
			display: "true"
		});
	});
	it("generates one-to-one question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "onetoone"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6); // b
		generateInverseFunctions();
		expect(mockDiv.innerHTML).toContain("one-to-one");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "no",
			display: "no"
		});
	});
});
