/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateRadicalEquation} from "./generateRadicalEquation";
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
describe("generateRadicalEquation",()=>{
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
		generateRadicalEquation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates one_radical equation correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->one_radical
			.mockReturnValueOnce(0.3)//a->floor(0.3*10)+1=4
			.mockReturnValueOnce(0.5);//b->floor(0.5*10)+1=6
		generateRadicalEquation();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\sqrt{x + 4} = 6 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"32",
			alternate:"32",
			display:"32"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates two_radicals equation correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.55)//type->two_radicals
			.mockReturnValueOnce(0.3)//b->floor(0.3*10)+1=4
			.mockReturnValueOnce(0.5);//a->16+floor(0.5*10)+1=16+5+1=22
		generateRadicalEquation();
		expect(mockDiv.innerHTML).toBe("<div>\\( \\sqrt{x + 22} - \\sqrt{x} = 4 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"0.56",
			alternate:"0.5625",
			display:"0.56"
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
		generateRadicalEquation("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
		expect(mockGetMax).toHaveReturnedWith(20);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRadicalEquation();
		expect((window as any).MathJax).toBeUndefined();
	});
});
