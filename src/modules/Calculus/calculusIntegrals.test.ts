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
});
