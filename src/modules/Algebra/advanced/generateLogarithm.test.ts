/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateLogarithm} from "./generateLogarithm";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",async()=>{
	const actual=await vi.importActual("../algebraUtils.js");
	return{
		...actual,
		getMaxForDifficulty: vi.fn(()=>4)
	};
});
describe("generateLogarithm",()=>{
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
		generateLogarithm();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates basic logarithm correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->basic
			.mockReturnValueOnce(0)//base->2
			.mockReturnValueOnce(0.25)//arg exp->2, arg=4
			.mockReturnValueOnce(0);//newBase(unused)
		generateLogarithm();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\log_{2} 4 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2.00",
			alternate:"2.00",
			display:"2.00"
		});
		expect((window as any).expectedFormat).toBe("Enter a number or expression");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates change_base logarithm correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.25)//type->change_base
			.mockReturnValueOnce(0)//base->2
			.mockReturnValueOnce(0.25)//arg->4
			.mockReturnValueOnce(0.5);//newBase->3
		generateLogarithm();
		expect(mockDiv.innerHTML).toBe("<div>Express \\( \\log_{2} 4 \\) in base \\( 3 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2.00",
			display:"2.00"
		});
	});
	it("generates equation logarithm correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.45)//type->equation
			.mockReturnValueOnce(0)//base->2
			.mockReturnValueOnce(0.25)//arg->4(unused)
			.mockReturnValueOnce(0)//newBase(unused)
			.mockReturnValueOnce(0);//exponent->2
		generateLogarithm();
		expect(mockDiv.innerHTML).toBe("<div>\\( 2^{x}=4 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2",
			display:"2"
		});
	});
	it("generates properties logarithm correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.65)//type->properties
			.mockReturnValueOnce(0)//base->2
			.mockReturnValueOnce(0.25)//arg->4(unused)
			.mockReturnValueOnce(0)//newBase(unused)
			.mockReturnValueOnce(0)//a->2
			.mockReturnValueOnce(0);//b->2
		generateLogarithm();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\log_{2} (2 \\times 2) \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2.00",
			display:"2.00"
		});
	});
	it("generates exponential_form logarithm correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.85)//type->exponential_form
			.mockReturnValueOnce(0)//base->2
			.mockReturnValueOnce(0.25)//arg->4(unused)
			.mockReturnValueOnce(0)//newBase(unused)
			.mockReturnValueOnce(0);//exponent->2
		generateLogarithm();
		expect(mockDiv.innerHTML).toBe("<div>If \\( \\log_{2} x=2 \\), find \\( x \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"4",
			alternate:"2^2",
			display:"4"
		});
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateLogarithm("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",4);
		expect(mockGetMax).toHaveReturnedWith(10);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateLogarithm();
		expect((window as any).MathJax).toBeUndefined();
	});
});
