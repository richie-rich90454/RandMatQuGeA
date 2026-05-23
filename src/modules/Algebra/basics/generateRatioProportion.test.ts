/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateRatioProportion} from "./generateRatioProportion";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty,gcd} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	getMaxForDifficulty: vi.fn(()=>20),
	gcd: vi.fn(()=>1)
}));
describe("generateRatioProportion",()=>{
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
		generateRatioProportion();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates ratio type correctly",()=>{
		const mockGcd=vi.mocked(gcd);
		mockGcd.mockClear();
		mockGcd.mockReturnValueOnce(1);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateRatioProportion();
		expect(mockDiv.innerHTML).toBe("<div>Simplify the ratio \\( 11:7 \\) to lowest terms.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "11:7",
			alternate: "11/7",
			display: "11:7"
		});
		expect((window as any).expectedFormat).toBe("Enter a number or ratio like 2:3");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates proportion type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateRatioProportion();
		expect(mockDiv.innerHTML).toBe("<div>Solve for x: \\( \\frac{4}{3}=\\frac{12}{x} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "16",
			alternate: "16",
			display: "16"
		});
	});
	it("generates scale type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateRatioProportion();
		expect(mockDiv.innerHTML).toBe("<div>On a map with scale 1:6, a distance measures 4 cm. What is the actual distance in cm?</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "25",
			alternate: "25",
			display: "25"
		});
	});
	it("generates unit_rate type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateRatioProportion();
		expect(mockDiv.innerHTML).toBe("<div>If 70 items cost $5, what is the unit price? (nearest cent)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "14.00",
			alternate: "14",
			display: "14.00"
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
		generateRatioProportion("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",20);
	});
	it("does not call MathJax if missing",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3);
		generateRatioProportion();
		expect((window as any).MathJax).toBeUndefined();
	});
});
