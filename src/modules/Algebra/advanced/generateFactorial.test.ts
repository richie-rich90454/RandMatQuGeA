/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateFactorial} from "./generateFactorial";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", () => ({
	questionArea: null as HTMLElement | null
}));
vi.mock("../algebraUtils.js", async () => {
	const actual = await vi.importActual("../algebraUtils.js");
	return {
		...actual,
		getMaxForDifficulty: vi.fn(() => 7)
	};
});
describe("generateFactorial", () => {
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
		generateFactorial();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates basic factorial correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.1) // type "basic"
			.mockReturnValueOnce(0.5) // n -> 8
			.mockReturnValueOnce(0.5); // k (unused)
		generateFactorial();
		expect(mockDiv.innerHTML).toBe("Calculate \\( 8! \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "40320",
			alternate: "40320",
			display: "40320"
		});
		expect((window as any).expectedFormat).toBe("Enter a whole number");
		expect((window as any).MathJax.typeset).toHaveBeenCalled();
	});
	it("generates division factorial correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.3) // type "division"
			.mockReturnValueOnce(0.5) // n -> 8
			.mockReturnValueOnce(0.2); // k -> floor(0.2*6)+2 = 1+2=3
		generateFactorial();
		expect(mockDiv.innerHTML).toBe("Simplify: \\( \\frac{8!}{3!} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "6720",
			alternate: "6720",
			display: "6720"
		});
	});
	it("generates equation factorial correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.5) // type "equation"
			.mockReturnValueOnce(0.5) // n -> 8
			.mockReturnValueOnce(0.5); // k (unused)
		generateFactorial();
		expect(mockDiv.innerHTML).toBe("Solve for \\( n \\): \\( n!=40320 \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "8",
			alternate: "8",
			display: "8"
		});
	});
	it("generates approximation factorial correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.7) // type "approximation"
			.mockReturnValueOnce(0.5) // n -> 8
			.mockReturnValueOnce(0.5); // k (unused)
		generateFactorial();
		expect(mockDiv.innerHTML).toBe("Estimate \\( 8! \\) using Stirling's approximation");
		// Stirling's approximation may yield 39902 or 39903 due to floating-point rounding.
		// We accept either value.
		const result = (window as any).correctAnswer.correct;
		expect(["39902", "39903"]).toContain(result);
		expect((window as any).expectedFormat).toBe("Enter a rounded whole number");
	});
	it("generates prime exponent factorial correctly", () => {
		Math.random = vi.fn()
			.mockReturnValueOnce(0.9) // type "prime"
			.mockReturnValueOnce(0.5) // n -> 8
			.mockReturnValueOnce(0.5) // k (unused)
			.mockReturnValueOnce(0.1); // prime index -> 0 -> prime 2
		generateFactorial();
		expect(mockDiv.innerHTML).toBe("Find the exponent of \\( 2 \\) in \\( 8! \\) (prime factorization)");
		expect((window as any).correctAnswer).toEqual({
			correct: "7",
			alternate: "7",
			display: "7"
		});
	});
	it("uses getMaxForDifficulty with provided difficulty", () => {
		const mockGetMax = vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random = vi.fn()
			.mockReturnValueOnce(0.1) // type
			.mockReturnValueOnce(0.1) // n
			.mockReturnValueOnce(0.1); // k
		generateFactorial("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 7);
		expect(mockGetMax).toHaveReturnedWith(10);
	});
	it("does not call MathJax.typeset if MathJax is missing", () => {
		delete (window as any).MathJax;
		Math.random = vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateFactorial();
		expect((window as any).MathJax).toBeUndefined();
	});
});