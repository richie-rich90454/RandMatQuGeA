/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateCosecant,generateSecant,generateCotangent} from "./trigReciprocal.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
describe("generateCosecant",()=>{
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
		generateCosecant();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates evaluate cosecant correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateCosecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("generates relationship cosecant correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.4).mockReturnValueOnce(0.5);
		generateCosecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.alternate).toContain("sin");
	});
	it("generates evaluate secant correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.5);
		generateSecant();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates cotangent relationship correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.6).mockReturnValueOnce(0.5);
		generateCotangent();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.alternate).toContain("tan");
	});
});
