/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateParametricPolarVector} from "./calculusParametricPolarVector";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateParametricPolarVector",()=>{
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
		generateParametricPolarVector();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates parametricDeriv correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)// type->floor(13*0.04)=0 parametricDeriv
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.5);// t->floor(3*0.5)+1=1+1=2
		generateParametricPolarVector();
		let dx=2*2*2;
		let dy=3*4-3;
		let deriv=dy/dx;
		expect((window as any).correctAnswer).toMatchObject({
			correct:deriv.toFixed(3),
			alternate:deriv.toFixed(3)
		});
	});
	it("generates polarArea correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.54)// type->floor(13*0.54)=7 polarArea
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateParametricPolarVector();
		let area=Math.PI*(1+2);
		expect((window as any).correctAnswer).toMatchObject({
			correct:area.toFixed(3),
			alternate:area.toFixed(3)
		});
	});
	it("generates vectorIntegral correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.31)// type->floor(13*0.31)=4 vectorIntegral
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateParametricPolarVector();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"<0.500, 0.667>",
			alternate:"<0.500, 0.667>"
		});
	});
	it("generates motionParam correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(13*0.4)=5 motionParam
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateParametricPolarVector();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2"
		});
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
describe("generateParametricPolarVector - edge cases",()=>{
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
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.display).toBe(second.display);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateParametricPolarVector();
		let ans=(window as any).correctAnswer;
		expect(ans).toHaveProperty("correct");
		expect(ans).toHaveProperty("display");
		expect(ans).toHaveProperty("choices");
		expect(Array.isArray(ans.choices)).toBe(true);
		expect(ans.choices.length).toBeGreaterThanOrEqual(1);
	});
});
