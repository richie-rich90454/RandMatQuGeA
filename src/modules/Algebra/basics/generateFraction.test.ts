/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateFraction} from "./generateFraction";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty,gcd} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	getMaxForDifficulty: vi.fn(()=>12),
	gcd: vi.fn(()=>1)
}));
describe("generateFraction",()=>{
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
		generateFraction();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates add type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(1);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFraction();
		expect(mockDiv.innerHTML).toBe("<div>Add: \\( \\frac{7}{3} + \\frac{4}{7} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "61/21",
			alternate: "61/21",
			display: "\\frac{61}{21}"
		});
		expect((window as any).expectedFormat).toBe("Enter a fraction in simplest form like 3/4");
	});
	it("generates subtract type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(1);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFraction();
		expect(mockDiv.innerHTML).toBe("<div>Subtract: \\( \\frac{7}{3} - \\frac{4}{7} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "37/21",
			alternate: "37/21",
			display: "\\frac{37}{21}"
		});
	});
	it("generates multiply type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(7);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFraction();
		expect(mockDiv.innerHTML).toBe("<div>Multiply: \\( \\frac{7}{3} \\times \\frac{4}{7} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "4/3",
			alternate: "28/21",
			display: "\\frac{4}{3}"
		});
	});
	it("generates divide type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(1);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFraction();
		expect(mockDiv.innerHTML).toBe("<div>Divide: \\( \\frac{7}{3} \\div \\frac{4}{7} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "49/12",
			alternate: "49/12",
			display: "\\frac{49}{12}"
		});
	});
	it("generates simplify type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(1);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateFraction();
		expect(mockDiv.innerHTML).toBe("<div>Simplify: \\( \\frac{17}{11} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "17/11",
			alternate: "17/11",
			display: "\\frac{17}{11}"
		});
	});
	it("generates convert type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(100);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateFraction();
		expect(mockDiv.innerHTML).toBe("<div>Convert \\( 5.00 \\) to a fraction in simplest form.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "5/1",
			alternate: "5/1",
			display: "\\frac{5}{1}"
		});
	});
	it("passes difficulty to getMaxForDifficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(15);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFraction("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy",12);
	});
});
