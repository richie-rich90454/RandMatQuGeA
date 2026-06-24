/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateExponentialModeling} from "./generateExponentialModeling";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>10),
}));
describe("generateExponentialModeling", ()=>{
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
		generateExponentialModeling();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates growth question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "growth"
			.mockReturnValueOnce(0.3) // initial -> floor(0.3*100)+50=30+50=80
			.mockReturnValueOnce(0.5) // rate -> 0.05+0.05=0.100
			.mockReturnValueOnce(0.5); // time -> floor(0.5*5)+1=2+1=3
		generateExponentialModeling();
		expect(mockDiv.innerHTML).toContain("grows continuously");
		expect((window as any).expectedFormat).toBe("Enter whole number");
	});
	it("generates decay question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.25) // type "decay"
			.mockReturnValueOnce(0.3) // initial
			.mockReturnValueOnce(0.5) // rate
			.mockReturnValueOnce(0.5); // time
		generateExponentialModeling();
		expect(mockDiv.innerHTML).toContain("decays");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("generates half-life question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "half-life"
			.mockReturnValueOnce(0.3) // initial
			.mockReturnValueOnce(0.5) // rate (unused in half-life but consumed)
			.mockReturnValueOnce(0.5) // time
			.mockReturnValueOnce(0.3); // halfLife -> floor(0.3*10)+5=3+5=8
		generateExponentialModeling();
		expect(mockDiv.innerHTML).toContain("half-life");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("generates cooling question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.75) // type "cooling"
			.mockReturnValueOnce(0.3) // initial
			.mockReturnValueOnce(0.5) // rate -> 0.050
			.mockReturnValueOnce(0.5); // time -> 3
		generateExponentialModeling();
		expect(mockDiv.innerHTML).toContain("Cooling");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateExponentialModeling();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateExponentialModeling();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateExponentialModeling("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateExponentialModeling("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateExponentialModeling("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
