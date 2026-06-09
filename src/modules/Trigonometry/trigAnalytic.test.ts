/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateDegreesToRadians,generateArcLength,generateReferenceAngle,generateASTCSign} from "./trigAnalytic.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("../Algebra/algebraUtils.js",async()=>{
	const actual=await vi.importActual("../Algebra/algebraUtils.js");
	return{...actual,getMaxForDifficulty:vi.fn(()=>5)};
});
describe("generateDegreesToRadians",()=>{
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
		generateDegreesToRadians();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates degrees to radians correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		expect((window as any).correctAnswer).toBeDefined();
		expect(mockDiv.innerHTML).toContain("Convert");
	});
	it("generates arc length correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArcLength();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates reference angle correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateReferenceAngle();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates ASTC sign correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.2).mockReturnValueOnce(0.5);
		generateASTCSign();
		expect((window as any).correctAnswer).toBeDefined();
		expect(["positive","negative"]).toContain((window as any).correctAnswer.correct);
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
describe("generateDegreesToRadians - edge cases",()=>{
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
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
		expect((window as any).correctAnswer.display.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.display).toBe(second.display);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateDegreesToRadians();
		let ans=(window as any).correctAnswer;
		expect(ans).toHaveProperty("correct");
		expect(ans).toHaveProperty("display");
		expect(ans).toHaveProperty("choices");
		expect(Array.isArray(ans.choices)).toBe(true);
		expect(ans.choices.length).toBeGreaterThanOrEqual(1);
	});
});
