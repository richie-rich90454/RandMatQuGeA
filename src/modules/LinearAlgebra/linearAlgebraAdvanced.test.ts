/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateSystem3x3,generateRowEchelon3x3,generatePartialFractions,generateVector3D} from "./linearAlgebraAdvanced.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./linearAlgebraUtils.js",async()=>{
	const actual=await vi.importActual("./linearAlgebraUtils.js");
	return{...actual,getRange:vi.fn(()=>3)};
});
describe("generateSystem3x3",()=>{
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
		generateSystem3x3();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates 3x3 system correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toContain("x=");
	});
	it("generates row echelon correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateRowEchelon3x3();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates partial fractions correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePartialFractions();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates 3D vector correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateVector3D();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toContain("x=");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
describe("generateSystem3x3 - edge cases",()=>{
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
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
		expect((window as any).correctAnswer.display.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.display).toBe(second.display);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSystem3x3();
		let ans=(window as any).correctAnswer;
		expect(ans).toHaveProperty("correct");
		expect(ans).toHaveProperty("display");
		expect(ans).toHaveProperty("choices");
		expect(Array.isArray(ans.choices)).toBe(true);
		expect(ans.choices.length).toBeGreaterThanOrEqual(1);
	});
});
