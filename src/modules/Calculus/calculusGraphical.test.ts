/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateGraphicalCalculus} from "./calculusGraphical";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateGraphicalCalculus",()=>{
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
		generateGraphicalCalculus();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates diffContinuity correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)// type->floor(22*0.14)=3 diffContinuity
			.mockReturnValueOnce(0.3);// x0->floor(3*0.3)=0
		generateGraphicalCalculus();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"no",
			alternate:"no"
		});
	});
	it("generates definiteProps correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.55)// type->floor(22*0.55)=12 definiteProps
			.mockReturnValueOnce(0.3)// int1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// int2->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.3)// a->floor(3*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->2+floor(3*0.5)+1=2+1+1=4
			.mockReturnValueOnce(0.7);// c->4+floor(3*0.7)+1=4+2+1=7
		generateGraphicalCalculus();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"5",
			alternate:"5"
		});
	});
	it("generates inverseFunc correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.19)// type->floor(22*0.19)=4 inverseFunc
			.mockReturnValueOnce(0.3)// fVal->floor(5*0.3)+2=1+2=3
			.mockReturnValueOnce(0.5)// fPrime->floor(5*0.5)+1=2+1=3
			.mockReturnValueOnce(0.7);// a->floor(5*0.7)+1=3+1=4
		generateGraphicalCalculus();
		let correct=1/3;
		expect((window as any).correctAnswer).toMatchObject({
			correct:correct.toFixed(3),
			alternate:correct.toFixed(3)
		});
	});
	it("generates derivativeLimit correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.73)// type->floor(22*0.73)=16 derivativeLimit
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		generateGraphicalCalculus();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2"
		});
	});
	it("sets expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		expect((window as any).expectedFormat).toBeTruthy();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
describe("generateGraphicalCalculus - edge cases",()=>{
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
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.display).toBe(second.display);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		generateGraphicalCalculus();
		let ans=(window as any).correctAnswer;
		expect(ans).toHaveProperty("correct");
		expect(ans).toHaveProperty("display");
		expect(ans).toHaveProperty("choices");
		expect(Array.isArray(ans.choices)).toBe(true);
		expect(ans.choices.length).toBeGreaterThanOrEqual(1);
	});
});
