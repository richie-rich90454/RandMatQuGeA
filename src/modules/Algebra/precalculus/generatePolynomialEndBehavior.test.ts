/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generatePolynomialEndBehavior} from "./generatePolynomialEndBehavior";
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
describe("generatePolynomialEndBehavior", ()=>{
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
		generatePolynomialEndBehavior();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates end behavior question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "endbehavior"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*3)+1=0+1=1
			.mockReturnValueOnce(0.6) // b -> floor(0.6*3)+1=1+1=2
			.mockReturnValueOnce(0.5) // deg -> floor(0.5*2)+3=1+3=4
			.mockReturnValueOnce(0.4); // lc -> Math.random()<0.5 -> positive (0.4<0.5)
		generatePolynomialEndBehavior();
		expect(mockDiv.innerHTML).toContain("end behavior");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "both ends up",
			display: "both ends up"
		});
	});
	it("generates multiplicity question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "multiplicity"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6) // b
			.mockReturnValueOnce(0.5); // mult -> floor(0.5*2)+1=1+1=2
		generatePolynomialEndBehavior();
		expect(mockDiv.innerHTML).toContain("multiplicity");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "2",
			display: "2"
		});
	});
	it("generates IVT question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "ivt"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6) // b
			.mockReturnValueOnce(0.3) // val1 -> floor(0.3*10)-5=3-5=-2
			.mockReturnValueOnce(0.5); // val2Offset -> floor(0.5*5)+2=2+2=4
		generatePolynomialEndBehavior();
		expect(mockDiv.innerHTML).toContain("Intermediate Value Theorem");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "yes",
			display: "yes"
		});
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		generatePolynomialEndBehavior();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		generatePolynomialEndBehavior();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		generatePolynomialEndBehavior("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		generatePolynomialEndBehavior("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		generatePolynomialEndBehavior("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
