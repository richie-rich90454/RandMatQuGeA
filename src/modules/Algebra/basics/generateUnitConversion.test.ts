/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateUnitConversion} from "./generateUnitConversion";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	getMaxForDifficulty: vi.fn(()=>50)
}));
describe("generateUnitConversion",()=>{
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
		generateUnitConversion();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates length_us type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateUnitConversion();
		expect(mockDiv.innerHTML).toBe("<div>Convert \\( 26 \\text{ ft} \\) to \\( \\text{in} \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "312",
			alternate: "312",
			display: "312"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates length_metric type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.6);
		generateUnitConversion();
		expect(mockDiv.innerHTML).toBe("<div>Convert \\( 26 \\text{ km} \\) to \\( \\text{m} \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "26000",
			alternate: "26000",
			display: "26000"
		});
	});
	it("generates area type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateUnitConversion();
		expect(mockDiv.innerHTML).toBe("<div>Convert \\( 4 \\text{ yd}^2 \\) to \\( \\text{ft}^2 \\). (1 yd=3 ft)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "36",
			alternate: "36",
			display: "36"
		});
	});
	it("generates volume type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		generateUnitConversion();
		expect(mockDiv.innerHTML).toBe("<div>Convert \\( 3 \\text{ L} \\) to \\( \\text{mL} \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "3000",
			alternate: "3000",
			display: "3000"
		});
	});
	it("generates multi_step type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateUnitConversion();
		expect(mockDiv.innerHTML).toBe("<div>Convert \\( 6 \\text{ yd} \\) to \\( \\text{in} \\). (1 yd=3 ft, 1 ft=12 in)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "216",
			alternate: "216",
			display: "216"
		});
	});
	it("passes difficulty to getMaxForDifficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(30);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateUnitConversion("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy",50);
	});
	it("does not call MathJax if missing",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateUnitConversion();
		expect((window as any).MathJax).toBeUndefined();
	});
});
