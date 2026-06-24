/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateLinearEquationSpecial} from "./generateLinearEquationSpecial";
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
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateLinearEquationSpecial();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateLinearEquationSpecial();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateLinearEquationSpecial("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateLinearEquationSpecial("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateLinearEquationSpecial("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
