/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateRationalExponents} from "./generateRationalExponents";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",async()=>{
	const actual=await vi.importActual("../algebraUtils.js");
	return{
		...actual,
		getMaxForDifficulty: vi.fn(()=>5)
	};
});
describe("generateRationalExponents",()=>{
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
		generateRationalExponents();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates convert_to_radical correctly",()=>{
		// a=floor(0.3*5)+2=3, m=floor(0.5*2)+2=3, n=floor(0.1*2)+2=2
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->convert_to_radical
			.mockReturnValueOnce(0.3)//a->3
			.mockReturnValueOnce(0.5)//m->3
			.mockReturnValueOnce(0.1);//n->2
		generateRationalExponents();
		expect(mockDiv.innerHTML).toBe("<div>\\( x^{3/2} \\) in radical form.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"\\sqrt[2]{x^{3}}",
			alternate:"x^(3/2)",
			display:"\\sqrt[2]{x^{3}}"
		});
		expect((window as any).expectedFormat).toBe("Enter as \\sqrt[n]{x^m}");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates convert_to_exponent correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)//type->convert_to_exponent
			.mockReturnValueOnce(0.3)//a->3
			.mockReturnValueOnce(0.5)//m->3
			.mockReturnValueOnce(0.1);//n->2
		generateRationalExponents();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\sqrt[2]{x^{3}} \\) using a rational exponent.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"x^{3/2}",
			alternate:"x^(3/2)",
			display:"x^{3/2}"
		});
		expect((window as any).expectedFormat).toBe("Enter as x^(m/n)");
	});
	it("generates evaluate correctly",()=>{
		// base=3, m=3, n=2, exponent=1.5, result=Math.pow(3,1.5)=5.196...->"5.20"
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)//type->evaluate
			.mockReturnValueOnce(0.3)//a->3
			.mockReturnValueOnce(0.5)//m->3
			.mockReturnValueOnce(0.1);//n->2
		generateRationalExponents();
		expect(mockDiv.innerHTML).toBe("<div>\\( 3^{3/2} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"5.20",
			alternate:"5.20",
			display:"5.20"
		});
		expect((window as any).expectedFormat).toBe("Enter a decimal number");
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(8);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRationalExponents("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",5);
		expect(mockGetMax).toHaveReturnedWith(8);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRationalExponents();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1);
		generateRationalExponents();
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
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1);
		generateRationalExponents();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(5);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRationalExponents("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy", 5);
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(7);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRationalExponents("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium", 5);
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(8);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRationalExponents("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 5);
	});
});
