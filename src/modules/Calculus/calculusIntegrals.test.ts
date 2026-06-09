/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateIntegral} from "./calculusIntegrals";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateIntegral",()=>{
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
		generateIntegral();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates trigonometric integral correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)// type->floor(15*0.07)=1 trigonometric
			.mockReturnValueOnce(0.1)// trigOptions index->floor(6*0.1)=0 sin->cos sign=-1
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		generateIntegral();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"-1.5cos(2x)+c",
			alternate:"-3/2cos(2x)+c"
		});
	});
	it("generates exponential integral with e base correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)// type->floor(15*0.14)=2 exponential
			.mockReturnValueOnce(0.3)// base->0.3<0.5 => "e"
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		generateIntegral();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"1.5e^(2x)+c",
			alternate:"1.5e^(2x)+c"
		});
		expect((window as any).expectedFormat).toBeTruthy();
	});
	it("generates substitution integral correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.27)// type->floor(15*0.27)=4 substitution
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)=2
			.mockReturnValueOnce(0.3)// power->floor(3*0.3)+2=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		generateIntegral();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"0.5(2x+2)^3+c",
			alternate:"0.5(2x+2)^3+c"
		});
	});
	it("generates logarithmic integral correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.2)// type->floor(15*0.2)=3 logarithmic
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=2
		generateIntegral();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2ln|x|+c",
			alternate:"2ln|x|+c"
		});
	});
	it("sets expectedFormat for integral",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		expect((window as any).expectedFormat).toBe("Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, 1/3 sin(3x)+C, etc.");
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
describe("generateIntegral - edge cases",()=>{
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
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		let first=(window as any).correctAnswer;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateIntegral();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.alternate).toBe(second.alternate);
	});
	it("should handle basic power rule integral",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)// type->floor(15*0)=0 polynomial
			.mockReturnValueOnce(0.0)// numTerms->floor(4*0)+2=2
			.mockReturnValueOnce(0.0)// exponent->floor(11*0)=0
			.mockReturnValueOnce(0.1)// exponent->floor(11*0.1)=1
			.mockReturnValueOnce(0.3)// coeff for exp 1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff for exp 0->floor(100*0.5)+1=51
		generateIntegral();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle trigonometric integral",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.07)// type->floor(15*0.07)=1 trigonometric
			.mockReturnValueOnce(0.3)// trig index->floor(6*0.3)=1 cos
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		generateIntegral();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle exponential integral",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)// type->floor(15*0.14)=2 exponential
			.mockReturnValueOnce(0.3)// base->0.3<0.5 => "e"
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		generateIntegral();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle definite integral",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.34)// type->floor(15*0.34)=5 definite
			.mockReturnValueOnce(0.0)// exp[0]->floor(4*0)=0
			.mockReturnValueOnce(0.25)// exp[1]->floor(4*0.25)=1
			.mockReturnValueOnce(0.5)// exp[2]->floor(4*0.5)=2
			.mockReturnValueOnce(0.3)// coeff[0]->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// coeff[1]->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.7)// coeff[2]->floor(5*0.7)+1=4
			.mockReturnValueOnce(0.5);// upper->floor(5*0.5)+2=4
		generateIntegral();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle u-substitution integral",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.27)// type->floor(15*0.27)=4 substitution
			.mockReturnValueOnce(0.5)// a->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.2)// b->floor(5*0.2)=1
			.mockReturnValueOnce(0.5)// power->floor(3*0.5)+2=3
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=2
		generateIntegral();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
