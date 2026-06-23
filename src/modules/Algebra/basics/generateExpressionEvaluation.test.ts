/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateExpressionEvaluation} from "./generateExpressionEvaluation";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number){return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number){return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>10),
}));
describe("generateExpressionEvaluation",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateExpressionEvaluation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates linear type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation();
		expect(mockDiv.innerHTML).toBe("<div>Evaluate \\( 6x + 4 \\) when \\( x=8 \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "52",
			alternate: "52",
			display: "52"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates quadratic type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation();
		expect(mockDiv.innerHTML).toBe("<div>Evaluate \\( 6x^2 + 4x + 1 \\) when \\( x=8 \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "417",
			alternate: "417",
			display: "417"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("generates with_substitution type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.2);
		generateExpressionEvaluation();
		expect(mockDiv.innerHTML).toBe("<div>Evaluate \\( 6x + 4y \\) when \\( x=8 \\) and \\( y=3 \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "60",
			alternate: "60",
			display: "60"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("passes difficulty to getMaxForDifficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
	});
	it("does not call MathJax if missing",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation();
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(5);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy",10);
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium",10);
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateExpressionEvaluation("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
		expect((window as any).correctAnswer).toBeDefined();
	});
});
