/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateExponentRules} from "./generateExponentRules";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", () => ({
	questionArea: null as HTMLElement | null
}));
vi.mock("../algebraUtils.js", () => ({
	getMaxForDifficulty: vi.fn(() => 4)
}));
describe("generateExponentRules", () => {
	let originalMathRandom: () => number;
	let mockDiv: HTMLDivElement;
	beforeEach(() => {
		originalMathRandom = Math.random;
		mockDiv = document.createElement("div");
		(questionArea as any) = mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax = { typeset: vi.fn() };
	});
	afterEach(() => {
		Math.random = originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", () => {
		(questionArea as any) = null;
		generateExponentRules();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates product rule correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.1) // type "product"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.2) // m -> 1 (floor(0.2*3)+1 = 0+1=1)
			.mockReturnValueOnce(0.8); // n -> 3 (floor(0.8*3)+1 = 2+1=3)
		generateExponentRules();
		expect(mockDiv.innerHTML).toBe("Simplify: \\( 4^{1} \\times 4^{3} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "4^4",
			alternate: "4^4",
			display: "4^4"
		});
		expect((window as any).expectedFormat).toBe("Enter as a^b");
		expect((window as any).MathJax.typeset).toHaveBeenCalled();
	});
	it("generates quotient rule correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.3) // type "quotient"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.2) // m -> 1
			.mockReturnValueOnce(0.8); // n -> 3
		generateExponentRules();
		expect(mockDiv.innerHTML).toBe("Simplify: \\( \\frac{4^{4}}{4^{3}} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "4^1",
			alternate: "4^1",
			display: "4^1"
		});
	});
	it("generates power rule correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.5) // type "power"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.2) // m -> 1
			.mockReturnValueOnce(0.8); // n -> 3
		generateExponentRules();
		expect(mockDiv.innerHTML).toBe("Simplify: \\( (4^{1})^{3} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "4^3",
			alternate: "4^3",
			display: "4^3"
		});
	});
	it("generates negative exponent rule correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.7) // type "negative"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.2) // m -> 1
			.mockReturnValueOnce(0.8); // n (unused)
		generateExponentRules();
		expect(mockDiv.innerHTML).toBe("Write with a positive exponent: \\( 4^{-1} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "\\frac{1}{4^{1}}",
			alternate: "1/4^1",
			display: "\\frac{1}{4^{1}}"
		});
		expect((window as any).expectedFormat).toBe("Enter as 1/a^b");
	});
	it("generates zero exponent rule correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.9) // type "zero"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.2) // m (unused)
			.mockReturnValueOnce(0.8); // n (unused)
		generateExponentRules();
		expect(mockDiv.innerHTML).toBe("Evaluate: \\( 4^{0} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "1",
			alternate: "1",
			display: "1"
		});
		expect((window as any).expectedFormat).toBe("Enter 1");
	});
	it("uses getMaxForDifficulty with provided difficulty", () => {
		const mockGetMax = vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random = vi.fn()
			.mockReturnValueOnce(0.1) // type
			.mockReturnValueOnce(0.1) // base
			.mockReturnValueOnce(0.1) // m
			.mockReturnValueOnce(0.1); // n
		generateExponentRules("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 4);
		expect(mockGetMax).toHaveReturnedWith(10);
	});
	it("does not call MathJax.typeset if MathJax is missing", () => {
		delete (window as any).MathJax;
		Math.random = vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateExponentRules();
		expect((window as any).MathJax).toBeUndefined();
	});
});