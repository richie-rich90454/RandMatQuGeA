/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateDerivative} from "./calculusDerivatives";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateDerivative",()=>{
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
		generateDerivative();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates trigonometric derivative correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)// type->floor(13*0.1)=1 trigonometric
			.mockReturnValueOnce(0.1)// trig index->floor(6*0.1)=0 sin
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=1+1=2
		generateDerivative();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2*cos(x)",
			alternate:"2*cos(x)"
		});
		expect((window as any).expectedFormat).toBeTruthy();
	});
	it("generates implicit derivative correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.55)// type->floor(13*0.55)=7 implicit
			.mockReturnValueOnce(0.2)// a->floor(5*0.2)+1=1+1=2
			.mockReturnValueOnce(0.4);// b->floor(5*0.4)+1=2+1=3
		generateDerivative();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"-(2x)/(3y)",
			alternate:"-(2x)/(3y)"
		});
		expect((window as any).expectedFormat).toBeTruthy();
	});
	it("generates inverseTrig derivative correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.85)// type->floor(13*0.85)=11 inverseTrig
			.mockReturnValueOnce(0.1)// subType->floor(3*0.1)=0 arcsin
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=1+1=2
		generateDerivative();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2/sqrt(1-4x^2)",
			alternate:"2/sqrt(1-4x^2)"
		});
	});
	it("sets window.correctAnswer with correct properties",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		let ca=(window as any).correctAnswer;
		expect(ca).toHaveProperty("correct");
		expect(ca).toHaveProperty("alternate");
		expect(ca).toHaveProperty("display");
		expect(ca).toHaveProperty("choices");
		expect(Array.isArray(ca.choices)).toBe(true);
		expect(ca.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("does not call MathJax.typeset if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
