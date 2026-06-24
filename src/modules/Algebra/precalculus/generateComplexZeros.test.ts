/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateComplexZeros} from "./generateComplexZeros";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>3),
}));
describe("generateComplexZeros", ()=>{
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
		generateComplexZeros();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates fundamental theorem question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "fundamental"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*3)+1=0+1=1
			.mockReturnValueOnce(0.6) // b -> floor(0.6*3)+1=1+1=2
			.mockReturnValueOnce(0.5); // deg -> floor(0.5*2)+3=1+3=4
		generateComplexZeros();
		expect(mockDiv.innerHTML).toContain("Fundamental Theorem");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "4",
			display: "4"
		});
	});
	it("generates conjugate pair question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "conjugate"
			.mockReturnValueOnce(0.3) // a -> 1
			.mockReturnValueOnce(0.6); // b -> 2
		generateComplexZeros();
		expect(mockDiv.innerHTML).toContain("real coefficients");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "1 - 2i",
			display: "1 - 2i"
		});
	});
	it("generates factor question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "factor"
			.mockReturnValueOnce(0.3) // a -> 1
			.mockReturnValueOnce(0.6); // b -> 2
		generateComplexZeros();
		expect(mockDiv.innerHTML).toContain("Factor");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "(x - 1)(x - 2)",
			display: "(x - 1)(x - 2)"
		});
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateComplexZeros();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateComplexZeros();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateComplexZeros("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateComplexZeros("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateComplexZeros("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
