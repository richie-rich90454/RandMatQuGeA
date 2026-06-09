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
describe("generateDerivative - edge cases",()=>{
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
	it("should produce non-empty question HTML",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		let first=(window as any).correctAnswer;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.alternate).toBe(second.alternate);
	});
	it("should handle power rule derivative",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)// type->floor(13*0)=0 polynomial
			.mockReturnValueOnce(0.0)// numTerms->floor(4*0)+2=2
			.mockReturnValueOnce(0.0)// exponent->floor(11*0)=0
			.mockReturnValueOnce(0.1)// exponent->floor(11*0.1)=1
			.mockReturnValueOnce(0.3)// coeff for exp 1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff for exp 0->floor(100*0.5)+1=51
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer.correct).toBe("2");
	});
	it("should handle trigonometric derivative",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.08)// type->floor(13*0.08)=1 trigonometric
			.mockReturnValueOnce(0.1)// trig index->floor(6*0.1)=0 sin
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=2
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBe("2*cos(x)");
	});
	it("should handle exponential derivative",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.16)// type->floor(13*0.16)=2 exponential
			.mockReturnValueOnce(0.1)// exp index->floor(2*0.1)=0 e^x
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=2
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBe("2*e^x");
	});
	it("should handle logarithmic derivative",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.24)// type->floor(13*0.24)=3 logarithmic
			.mockReturnValueOnce(0.1);// log index->floor(2*0.1)=0 ln(x)
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBe("1/x");
	});
	it("should handle chain rule derivative",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.47)// type->floor(13*0.47)=6 chain
			.mockReturnValueOnce(0.0)// chainType->floor(3*0)=0 trig chain
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(3*0.5)=1
			.mockReturnValueOnce(0.0);// trigFunc->floor(2*0)=0 sin
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBe("cos(2x+1)*2");
	});
});
