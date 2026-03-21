/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateExponent} from "./generateExponent";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement | null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>4)
}));
describe("generateExponent", ()=>{
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
		generateExponent();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates basic exponent evaluation correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // type "basic"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.3); // exponent -> 3
		generateExponent();
		expect(mockDiv.innerHTML).toBe("Evaluate: \\( 4^{3} \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "64",
			alternate: "64",
			display: "64"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
		expect((window as any).MathJax.typeset).toHaveBeenCalled();
	});
	it("generates solve exponential equation correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3) // type "solve"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.7); // exponent -> 5
		generateExponent();
		expect(mockDiv.innerHTML).toBe("Solve for \\( x \\): \\( 4^{x}=1024 \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "5",
			alternate: "5",
			display: "5"
		});
		expect((window as any).expectedFormat).toBe("Enter a whole number");
	});
	it("generates laws of exponents simplification correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "laws"
			.mockReturnValueOnce(0.5) // base -> 4
			.mockReturnValueOnce(0.2) // exponent (unused) -> 3
			.mockReturnValueOnce(0.1) // a -> 2
			.mockReturnValueOnce(0.8); // b -> 4
		generateExponent();
		expect(mockDiv.innerHTML).toBe("Simplify: \\( (4^{2}) \\times (4^{4}) \\)");
		expect((window as any).correctAnswer).toEqual({
			correct: "4096",
			alternate: "4^6",
			display: "4096"
		});
		expect((window as any).expectedFormat).toBe("Enter a number (e.g., 32) or an expression (e.g., 2^5)");
	});
	it("generates growth factor question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "growth"
			.mockReturnValueOnce(0.5) // base (unused)
			.mockReturnValueOnce(0.5) // exponent (unused)
			.mockReturnValueOnce(0.5); // rate -> 15.0
		generateExponent();
		expect(mockDiv.innerHTML).toBe("A population grows at \\( 15.0\\% \\) annually. What is the growth factor?");
		expect((window as any).correctAnswer).toEqual({
			correct: "1.150",
			alternate: "1.150",
			display: "1.150"
		});
		expect((window as any).expectedFormat).toBe("Enter a decimal (e.g., 1.05)");
	});
	it("generates compare exponential expressions correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9) // type "compare"
			.mockReturnValueOnce(0.2) // base (unused)
			.mockReturnValueOnce(0.2) // exponent (unused)
			.mockReturnValueOnce(0.1) // b1 -> 2
			.mockReturnValueOnce(0.8) // e1 -> 5
			.mockReturnValueOnce(0.9) // b2 -> 4
			.mockReturnValueOnce(0.3); // e2 -> 3
		generateExponent();
		expect(mockDiv.innerHTML).toBe("Which is larger: \\( 2^{5} \\) or \\( 4^{3} \\)?");
		expect((window as any).correctAnswer).toEqual({
			correct: "64",
			alternate: "4^3",
			display: "64"
		});
		expect((window as any).expectedFormat).toBe("Enter the larger value (e.g., 32) or the expression (e.g., 2^5)");
	});
	it("uses getMaxForDifficulty with provided difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // type
			.mockReturnValueOnce(0.1) // base
			.mockReturnValueOnce(0.1); // exponent
		generateExponent("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 4);
		expect(mockGetMax).toHaveReturnedWith(10);
	});
	it("does not call MathJax.typeset if MathJax is missing", ()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateExponent();
		expect((window as any).MathJax).toBeUndefined();
	});
});