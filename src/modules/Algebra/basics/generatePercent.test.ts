/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generatePercent} from "./generatePercent";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>100),
}));
describe("generatePercent",()=>{
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
		generatePercent();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates percent_of type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generatePercent();
		expect(mockDiv.innerHTML).toBe("<div>What is \\( 35\\% \\) of \\( 40 \\)?</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "14",
			alternate: "14",
			display: "14"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates increase type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generatePercent();
		expect(mockDiv.innerHTML).toBe("<div>If \\( 40 \\) increases by \\( 35\\% \\), what is the new value?</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "54",
			alternate: "54",
			display: "54"
		});
	});
	it("generates decrease type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		generatePercent();
		expect(mockDiv.innerHTML).toBe("<div>If \\( 40 \\) decreases by \\( 17\\% \\), what is the new value?</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "33",
			alternate: "33",
			display: "33"
		});
	});
	it("generates interest type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		generatePercent();
		expect(mockDiv.innerHTML).toBe("<div>Simple interest on \\( $700 \\) at \\( 5.0\\% \\) for \\( 3 \\) years?</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "105",
			alternate: "105",
			display: "105"
		});
	});
	it("generates markup type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.6);
		generatePercent();
		expect(mockDiv.innerHTML).toBe("<div>A store buys an item for \\( $35 \\) and marks it up \\( 44\\% \\). What is the selling price?</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "50",
			alternate: "50",
			display: "50"
		});
	});
	it("passes difficulty to getMaxForDifficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(50);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generatePercent("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy",100);
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generatePercent();
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
			.mockReturnValueOnce(0.3);
		generatePercent();
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(50);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generatePercent("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy",100);
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(100);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generatePercent("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium",100);
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(200);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generatePercent("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",100);
		expect((window as any).correctAnswer).toBeDefined();
	});
});
