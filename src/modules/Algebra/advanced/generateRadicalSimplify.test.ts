/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateRadicalSimplify} from "./generateRadicalSimplify";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",async()=>{
	const actual=await vi.importActual("../algebraUtils.js");
	return{
		...actual,
		getMaxForDifficulty: vi.fn(()=>20)
	};
});
describe("generateRadicalSimplify",()=>{
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
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates simplify radical correctly",()=>{
		// a=floor(0.3*20)+1=7, b=floor(0.1*20)+1=3(square-free), radicand=49*3=147
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->simplify
			.mockReturnValueOnce(0.3)//a->7
			.mockReturnValueOnce(0.1);//b->3
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\sqrt{147} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"7\\sqrt{3}",
			alternate:"7√3",
			display:"7\\sqrt{3}"
		});
		expect((window as any).expectedFormat).toBe("Enter a simplified radical expression");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates add radicals correctly",()=>{
		// a=7, c=11, b=3(square-free), coeff=18
		Math.random=vi.fn()
			.mockReturnValueOnce(0.2)//type->add
			.mockReturnValueOnce(0.3)//a->7
			.mockReturnValueOnce(0.5)//c->11
			.mockReturnValueOnce(0.1);//b->3
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("<div>\\( 7\\sqrt{3} + 11\\sqrt{3} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"18\\sqrt{3}",
			alternate:"18√3",
			display:"18\\sqrt{3}"
		});
	});
	it("generates subtract radicals correctly",()=>{
		// a=15, c=7, b=3(square-free), coeff=8
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)//type->subtract
			.mockReturnValueOnce(0.7)//a->15
			.mockReturnValueOnce(0.3)//c->7
			.mockReturnValueOnce(0.1);//b->3
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("<div>\\( 15\\sqrt{3} - 7\\sqrt{3} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"8\\sqrt{3}",
			alternate:"8√3",
			display:"8\\sqrt{3}"
		});
	});
	it("generates multiply radicals correctly",()=>{
		// a=7, b=11, product=77, simplifyRadical(77)="\\sqrt{77}"
		Math.random=vi.fn()
			.mockReturnValueOnce(0.6)//type->multiply
			.mockReturnValueOnce(0.3)//a->7
			.mockReturnValueOnce(0.5);//b->11
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\sqrt{7} \\times \\sqrt{11} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"\\sqrt{77}",
			display:"\\sqrt{77}"
		});
	});
	it("generates divide radicals correctly",()=>{
		// a=7, b=11, sqrt(7) not int, sqrt(11) not int -> "\\frac{\\sqrt{77}}{11}"
		Math.random=vi.fn()
			.mockReturnValueOnce(0.8)//type->divide
			.mockReturnValueOnce(0.3)//a->7
			.mockReturnValueOnce(0.5);//b->11
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\frac{\\sqrt{7}}{\\sqrt{11}} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"\\frac{\\sqrt{77}}{11}",
			display:"\\frac{\\sqrt{77}}{11}"
		});
	});
	it("generates rationalize correctly",()=>{
		// a=7
		Math.random=vi.fn()
			.mockReturnValueOnce(0.95)//type->rationalize
			.mockReturnValueOnce(0.3);//a->7
		generateRadicalSimplify();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\frac{1}{\\sqrt{7}} \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"\\frac{\\sqrt{7}}{7}",
			alternate:"√7/7",
			display:"\\frac{\\sqrt{7}}{7}"
		});
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(30);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRadicalSimplify("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",20);
		expect(mockGetMax).toHaveReturnedWith(30);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRadicalSimplify();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1);
		generateRadicalSimplify();
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
			.mockReturnValueOnce(0.1);
		generateRadicalSimplify();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRadicalSimplify("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy", 20);
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(25);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRadicalSimplify("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium", 20);
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(30);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRadicalSimplify("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 20);
	});
});
