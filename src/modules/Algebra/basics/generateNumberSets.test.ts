/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateNumberSets} from "./generateNumberSets";
import {questionArea} from "../../../script.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateNumberSets",()=>{
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
		generateNumberSets();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates identify type with natural number correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateNumberSets();
		expect(mockDiv.innerHTML).toBe("<div>Identify all number sets for \\( 3.00 \\) (natural, whole, integer, rational, irrational, real).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "natural, whole, integer, rational, real"
		});
		expect((window as any).expectedFormat).toBe("Enter the set names separated by commas");
	});
	it("generates identify type with irrational number correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3333);
		generateNumberSets();
		expect((window as any).correctAnswer).toMatchObject({
			correct: "irrational, real"
		});
	});
	it("generates classify type with positive number correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.6);
		generateNumberSets();
		expect(mockDiv.innerHTML).toBe("<div>Classify \\( 1 \\) as natural, whole, integer, rational, irrational, or real.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "natural, whole, integer, rational, real"
		});
	});
	it("generates classify type with non-positive number correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.1);
		generateNumberSets();
		expect(mockDiv.innerHTML).toBe("<div>Classify \\( -4 \\) as natural, whole, integer, rational, irrational, or real.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "integer, rational, real"
		});
	});
	it("generates compare type with less-than correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5);
		generateNumberSets();
		expect(mockDiv.innerHTML).toBe("<div>Compare: \\( 2.00 \\) ___ \\( 5.00 \\) (enter &lt;, &gt;, or =)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "<"
		});
	});
	it("generates compare type with greater-than correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.8)
			.mockReturnValueOnce(0.3);
		generateNumberSets();
		expect((window as any).correctAnswer).toMatchObject({
			correct: ">"
		});
	});
	it("generates compare type with equal correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateNumberSets();
		expect((window as any).correctAnswer).toMatchObject({
			correct: "="
		});
	});
	it("does not call MathJax if missing",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateNumberSets();
		expect((window as any).MathJax).toBeUndefined();
	});
});
