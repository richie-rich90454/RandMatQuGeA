/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateScientificNotation} from "./generateScientificNotation";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",async()=>{
	const actual=await vi.importActual("../algebraUtils.js");
	return{
		...actual,
		getMaxForDifficulty: vi.fn(()=>10)
	};
});
describe("generateScientificNotation",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateScientificNotation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates to_standard correctly",()=>{
		// a=floor(0.3*10)+1=4, b=floor(0.5*3)+1=2, std=4*10^2=400
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->to_standard
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5);//b->2
		generateScientificNotation();
		expect(mockDiv.innerHTML).toBe("<div>Convert to standard notation: \\( 4 \\times 10^{2} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"400",
			alternate:"400",
			display:"400"
		});
		expect((window as any).expectedFormat).toBe("Enter a whole number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates to_scientific correctly",()=>{
		// a=4, b=2, std=400, toExponential(1)="4.0e+2"
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35)//type->to_scientific
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5);//b->2
		generateScientificNotation();
		expect(mockDiv.innerHTML).toBe("<div>Write in scientific notation: \\( 400 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"4.0e+2",
			display:"4 \\times 10^{2}"
		});
		expect((window as any).expectedFormat).toBe("Enter in form like 1.2e3 or 1.2×10^3");
	});
	it("generates multiply correctly",()=>{
		// a=4, b=2, product=4*4*10^(5)=1600000, toExponential(2)="1.60e+6"
		Math.random=vi.fn()
			.mockReturnValueOnce(0.6)//type->multiply
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5);//b->2
		generateScientificNotation();
		expect(mockDiv.innerHTML).toBe("<div>Multiply: \\( (4 \\times 10^{2}) \\times (4 \\times 10^{3}) \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"1.60e+6",
			display:"1.6 \\times 10^{6}"
		});
		expect((window as any).expectedFormat).toBe("Enter in scientific notation like 1.23e4");
	});
	it("generates divide correctly",()=>{
		// a=4, b=2, quotient=10
		Math.random=vi.fn()
			.mockReturnValueOnce(0.85)//type->divide
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5);//b->2
		generateScientificNotation();
		expect(mockDiv.innerHTML).toBe("<div>Divide: \\( \\frac{(4 \\times 10^{3})}{(4 \\times 10^{2})} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"10",
			alternate:"10",
			display:"10"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateScientificNotation("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",1000);
		expect(mockGetMax).toHaveReturnedWith(20);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateScientificNotation();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateScientificNotation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateScientificNotation();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(1000);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateScientificNotation("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy", 1000);
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(2000);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateScientificNotation("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium", 1000);
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(5000);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateScientificNotation("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 1000);
	});
});
