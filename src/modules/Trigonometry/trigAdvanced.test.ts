/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateInverseTrig,generateTrigEquations} from "./trigAdvanced.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
describe("generateInverseTrig",()=>{
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
		generateInverseTrig();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates inverse trig question correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateInverseTrig();
		expect((window as any).correctAnswer).toBeDefined();
		expect(mockDiv.children.length).toBeGreaterThan(0);
	});
	it("generates easy inverse trig correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.2);
		generateInverseTrig("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates trig equations basic correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateTrigEquations();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates trig equations multiple angle correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.4).mockReturnValueOnce(0.5);
		generateTrigEquations();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateInverseTrig();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateInverseTrig();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateInverseTrig("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateInverseTrig("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateInverseTrig("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
describe("generateInverseTrig - edge cases",()=>{
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
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateInverseTrig();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateInverseTrig();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle arcsin(0)",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0);
		generateInverseTrig("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle arcsin(1)",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.75);
		generateInverseTrig("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle arccos(0)",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
		generateInverseTrig("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle arctan(1)",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.99).mockReturnValueOnce(0.5);
		generateInverseTrig();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateInverseTrig("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateInverseTrig("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
});
