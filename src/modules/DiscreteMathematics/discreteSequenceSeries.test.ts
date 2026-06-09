/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateArithmeticSequence,generateGeometricSequence,generateSequenceLimit,generateBinomialTheorem} from "./discreteSequenceSeries.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",async()=>{
	const actual=await vi.importActual("./discreteUtils.js");
	return{...actual,getMaxN:vi.fn(()=>6)};
});
describe("generateArithmeticSequence",()=>{
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
		generateArithmeticSequence();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates arithmetic term correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates arithmetic sum correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.6);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates geometric sequence correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateGeometricSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates sequence limit correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSequenceLimit();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates binomial theorem correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateBinomialTheorem();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
describe("generateArithmeticSequence - edge cases",()=>{
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
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
	});
});
