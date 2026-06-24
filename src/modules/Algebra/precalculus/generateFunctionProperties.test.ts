/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateFunctionProperties} from "./generateFunctionProperties";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>5),
}));
describe("generateFunctionProperties", ()=>{
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
		generateFunctionProperties();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates continuity question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "continuity"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.0); // chosen index 0 -> frac
		generateFunctionProperties();
		expect(mockDiv.innerHTML).toContain("discontinuous");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "x = 2",
			display: "x = 2"
		});
	});
	it("generates extrema question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.2) // type "extrema"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6); // b
		generateFunctionProperties();
		expect(mockDiv.innerHTML).toContain("local minimum or maximum");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "min",
			display: "min"
		});
	});
	it("generates symmetry question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4) // type "symmetry"
			.mockReturnValueOnce(0.3) // a (unused in symmetry)
			.mockReturnValueOnce(0.6) // b (unused)
			.mockReturnValueOnce(0.0); // chosen index 0 -> even
		generateFunctionProperties();
		expect(mockDiv.innerHTML).toContain("even");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "even",
			display: "even"
		});
	});
	it("generates asymptotes question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.6) // type "asymptotes"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6); // b
		generateFunctionProperties();
		expect(mockDiv.innerHTML).toContain("asymptote");
		expect((window as any).expectedFormat).toBe("Enter x = number");
	});
	it("generates end behavior question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.8) // type "endbehavior"
			.mockReturnValueOnce(0.3) // aSign -> floor(0.3*2)+1=0+1=1 -> positive
			.mockReturnValueOnce(0.6) // deg -> floor(0.6*2)+3=1+3=4 -> even
			.mockReturnValueOnce(0.0); // unused additional random
		generateFunctionProperties();
		expect(mockDiv.innerHTML).toContain("end behavior");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "both ends up",
			display: "both ends up"
		});
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.0);
		generateFunctionProperties();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.0);
		generateFunctionProperties();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.0);
		generateFunctionProperties("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.0);
		generateFunctionProperties("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.0);
		generateFunctionProperties("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
