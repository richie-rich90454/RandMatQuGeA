/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateVariation} from "./generateVariation";
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
describe("generateVariation",()=>{
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
		generateVariation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates direct variation correctly",()=>{
		// a=floor(0.3*10)+1=4, b=floor(0.5*10)+1=6, x=floor(0.7*10)+1=8
		// k=4/6, result=(4/6)*8=5.33
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->direct
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5)//b->6
			.mockReturnValueOnce(0.7);//x->8
		generateVariation();
		expect(mockDiv.innerHTML).toBe("<div>If y varies directly with x, and y=4 when x=6, find y when x=8.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"5.33",
			display:"5.33"
		});
		expect((window as any).expectedFormat).toBe("Enter a decimal number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates inverse variation correctly",()=>{
		// a=4, b=6, x=8, k=24, result=24/8=3.00
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)//type->inverse
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5)//b->6
			.mockReturnValueOnce(0.7);//x->8
		generateVariation();
		expect(mockDiv.innerHTML).toBe("<div>If y varies inversely with x, and y=4 when x=6, find y when x=8.</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"3.00",
			display:"3.00"
		});
	});
	it("generates joint variation correctly",()=>{
		// a=4, b=6, x=8, y=8(shared), c=floor(0.1*10)+1=2
		// k=4/(6*2)=4/12=0.333..., result=0.333*8*8=21.33
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)//type->joint
			.mockReturnValueOnce(0.3)//a->4
			.mockReturnValueOnce(0.5)//b->6
			.mockReturnValueOnce(0.7)//x->8
			.mockReturnValueOnce(0.7)//y->8
			.mockReturnValueOnce(0.1);//c->2
		generateVariation();
		expect(mockDiv.innerHTML).toBe("<div>If z varies jointly with x and y, and z=4 when x=6, y=2, find z when x=8, y=8.</div>");
		let expectedResult=((4/(6*2))*8*8).toFixed(2);
		expect((window as any).correctAnswer).toMatchObject({
			correct:expectedResult,
			display:expectedResult
		});
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateVariation("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
		expect(mockGetMax).toHaveReturnedWith(20);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateVariation();
		expect((window as any).MathJax).toBeUndefined();
	});
});
