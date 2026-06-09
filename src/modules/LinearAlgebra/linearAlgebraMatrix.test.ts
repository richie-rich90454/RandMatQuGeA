/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateMatrix} from "./linearAlgebraMatrix.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./linearAlgebraUtils.js",async()=>{
	const actual=await vi.importActual("./linearAlgebraUtils.js");
	return{...actual,getRange:vi.fn(()=>3)};
});
describe("generateMatrix",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateMatrix();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates matrix addition correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("generates matrix multiplication correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.25);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates matrix inverse correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates 2x2 system correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.4);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
describe("generateMatrix - edge cases",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("should produce non-empty question HTML",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.24);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle 2x2 matrix",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle 3x3 matrix",()=>{
		Math.random=vi.fn().mockReturnValue(0.35);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should handle identity matrix",()=>{
		Math.random=vi.fn().mockReturnValue(0.57);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.35);
		generateMatrix("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.68);
		generateMatrix("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
