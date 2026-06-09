/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateComplex} from "./generateComplex";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement | null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));

describe("generateComplex", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={ typeset: vi.fn() };
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", ()=>{
		(questionArea as any)=null;
		generateComplex();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates addition question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // type index 0=>"add"
			.mockReturnValueOnce(0.1) // a=floor(0.5)+1=1
			.mockReturnValueOnce(0.1) // b=1
			.mockReturnValueOnce(0.1) // c=1
			.mockReturnValueOnce(0.1); // d=1
		generateComplex();
		expect(mockDiv.innerHTML).toBe("Add: \\( (1 + 1i) + (1 + 1i) \\)");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "2 + 2i",
			alternate: "2+2i",
			display: "2 + 2i"
		});
		expect((window as any).expectedFormat).toBe("Enter as a+bi (e.g., 3+2i)");
		expect((window as any).MathJax.typeset).toHaveBeenCalled();
	});
	it("generates subtraction question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3) // type index 1=>"subtract"
			.mockReturnValueOnce(0.2) // a=2
			.mockReturnValueOnce(0.4) // b=3
			.mockReturnValueOnce(0.6) // c=4
			.mockReturnValueOnce(0.8); // d=5
		generateComplex();
		expect(mockDiv.innerHTML).toBe("Subtract: \\( (2 + 3i) - (4 + 5i) \\)");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "-2 - 2i",
			alternate: "-2-2i",
			display: "-2 - 2i"
		});
		expect((window as any).expectedFormat).toBe("Enter as a+bi (e.g., 3+2i)");
	});
	it("generates multiplication question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type index 2=>"multiply"
			.mockReturnValueOnce(0.2) // a=2
			.mockReturnValueOnce(0.4) // b=3
			.mockReturnValueOnce(0.6) // c=4
			.mockReturnValueOnce(0.8); // d=5
		generateComplex();
		expect(mockDiv.innerHTML).toBe("Multiply: \\( (2 + 3i)(4 + 5i) \\)");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "-7 + 22i",
			alternate: "-7+22i",
			display: "-7 + 22i"
		});
	});
	it("generates division question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type index 3=>"divide"
			.mockReturnValueOnce(0.1) // a=1 (0.1*5=0.5 floor=0+1=1)
			.mockReturnValueOnce(0.3) // b=2 (0.3*5=1.5 floor=1+1=2)
			.mockReturnValueOnce(0.5) // c=3 (0.5*5=2.5 floor=2+1=3)
			.mockReturnValueOnce(0.7); // d=4 (0.7*5=3.5 floor=3+1=4)
		generateComplex();
		expect(mockDiv.innerHTML).toBe("Divide: \\( \\frac{1 + 2i}{3 + 4i} \\)");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "0.44 + 0.08i",
			alternate: "0.44+0.08i",
			display: "0.44 + 0.08i"
		});
		expect((window as any).expectedFormat).toBe("Enter as a+bi decimals (e.g., 0.33+0.25i)");
	});
	it("generates powers of i question correctly", ()=>{
		// For powers_i we need 6 random calls: type, a, b, c, d, n.
		// n=1
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9) // type "powers_i"
			.mockReturnValueOnce(0.1) // a (unused)
			.mockReturnValueOnce(0.1) // b
			.mockReturnValueOnce(0.1) // c
			.mockReturnValueOnce(0.1) // d
			.mockReturnValueOnce(0.0); // n=1
		generateComplex();
		expect(mockDiv.innerHTML).toBe("Simplify: \\( i^{1} \\)");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "i",
			alternate: "i",
			display: "i"
		});
		expect((window as any).expectedFormat).toBe("Enter i, -1, -i, or 1");
		// n=2
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.1) // a
			.mockReturnValueOnce(0.1) // b
			.mockReturnValueOnce(0.1) // c
			.mockReturnValueOnce(0.1) // d
			.mockReturnValueOnce(0.25); // n=2
		generateComplex();
		expect((window as any).correctAnswer.correct).toBe("-1");
		// n=3
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5); // n=3
		generateComplex();
		expect((window as any).correctAnswer.correct).toBe("-i");
		// n=4
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.75); // n=4
		generateComplex();
		expect((window as any).correctAnswer.correct).toBe("1");
	});
	it("uses getMaxForDifficulty with provided difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // type "add"
			.mockReturnValueOnce(0.05) // a=1 (floor(0.5)+1=1)
			.mockReturnValueOnce(0.05) // b=1
			.mockReturnValueOnce(0.05) // c=1
			.mockReturnValueOnce(0.05); // d=1
		generateComplex("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 5);
		expect(mockGetMax).toHaveReturnedWith(10);
		expect(mockDiv.innerHTML).toContain("(1 + 1i) + (1 + 1i)");
	});
	it("does not call MathJax.typeset if MathJax is missing", ()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(5);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy", 5);
	});
	it("should handle medium difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(8);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium", 5);
	});
	it("should handle hard difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(12);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 5);
	});
});
describe("generateComplex - edge cases", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={ typeset: vi.fn() };
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("should produce non-empty question HTML", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle easy difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(5);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle medium difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(8);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle hard difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(12);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should set expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		let first=(window as any).correctAnswer;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
	});
	it("should verify correctAnswer structure", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateComplex();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
});