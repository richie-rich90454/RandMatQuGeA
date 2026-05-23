/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateSin,generateCosine,generateTangent} from "./trigBasic.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
describe("generateSin",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typeset:vi.fn()};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateSin();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates evaluate sin correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("generates identity sin correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.9);
		generateSin();
		expect((window as any).correctAnswer.correct).toBe("1");
	});
	it("generates evaluate cosine correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateCosine();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates tangent identity correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.85);
		generateTangent();
		expect((window as any).correctAnswer.correct).toBe("\\sec^2\\theta");
	});
});
