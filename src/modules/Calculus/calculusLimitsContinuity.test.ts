/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateLimitsContinuity} from "./calculusLimitsContinuity";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateLimitsContinuity",()=>{
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
		generateLimitsContinuity();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates limitSqueeze correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)// type->floor(14*0.3)=4 limitSqueeze
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"0",
			alternate:"0"
		});
	});
	it("generates discontinuityType correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(14*0.4)=5 discontinuityType
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"removable",
			alternate:"removable"
		});
	});
	it("generates horizontalAsymptote correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.75)// type->floor(14*0.75)=10 horizontalAsymptote
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"1",
			alternate:"1"
		});
	});
	it("generates continuityConditions correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.45);// type->floor(14*0.45)=6 continuityConditions
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"f(c) defined, limit exists, limit equals f(c)",
			alternate:"f(c) defined, limit exists, limit equals f(c)"
		});
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
describe("generateLimit - edge cases",()=>{
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
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity();
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity();
		let first=(window as any).correctAnswer;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		generateLimitsContinuity();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.alternate).toBe(second.alternate);
	});
	it("should handle direct substitution limit",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.15)// type->floor(14*0.15)=2 limitProperties
			.mockReturnValueOnce(0.1)// limF->floor(10*0.1)+1=2
			.mockReturnValueOnce(0.2)// limG->floor(10*0.2)+1=3
			.mockReturnValueOnce(0.3)// coeff1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff2->floor(5*0.5)+1=3
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBe("13");
	});
	it("should handle factoring limit",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.22)// type->floor(14*0.22)=3 limitManipulation
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.3);// c->floor(5*0.3)+1=2
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle rational limit",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)// type->floor(14*0)=0 limitNotation
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.3);// c->floor(5*0.3)+1=2
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle infinite limit",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.65)// type->floor(14*0.65)=9 verticalAsymptote
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle continuity question",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.43);// type->floor(14*0.43)=6 continuityConditions
		generateLimitsContinuity();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBe("f(c) defined, limit exists, limit equals f(c)");
	});
});
