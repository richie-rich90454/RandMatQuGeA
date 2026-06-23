/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateRationalGraphAnalysis} from "./generateRationalGraphAnalysis";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number){return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number){return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>5),
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
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toContain("4");
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
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
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		generateRationalGraphAnalysis();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		generateRationalGraphAnalysis();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		generateRationalGraphAnalysis("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		generateRationalGraphAnalysis("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		generateRationalGraphAnalysis("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});