/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateFinance} from "./generateFinance";
import {questionArea} from "../../../script.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateFinance", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={typesetPromise: vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", ()=>{
		(questionArea as any)=null;
		generateFinance();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates compound interest question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "compound"
			.mockReturnValueOnce(0.5) // principal -> floor(0.5*5000)+1000=2500+1000=3500
			.mockReturnValueOnce(0.5) // rate -> 0.050+0.02=0.070
			.mockReturnValueOnce(0.5) // years -> floor(0.5*10)+1=5+1=6
			.mockReturnValueOnce(0.5); // n -> floor(0.5*4)+1=2+1=3
		generateFinance();
		expect(mockDiv.innerHTML).toContain("compounded");
		expect((window as any).expectedFormat).toBe("Enter decimal (two decimals)");
	});
	it("generates continuous compounding question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.25) // type "continuous"
			.mockReturnValueOnce(0.5) // principal
			.mockReturnValueOnce(0.5) // rate
			.mockReturnValueOnce(0.5) // years
			.mockReturnValueOnce(0.5); // n (unused in continuous)
		generateFinance();
		expect(mockDiv.innerHTML).toContain("compounded continuously");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("generates APY question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "apy"
			.mockReturnValueOnce(0.5) // principal
			.mockReturnValueOnce(0.5) // rate
			.mockReturnValueOnce(0.5) // years
			.mockReturnValueOnce(0.5); // n
		generateFinance();
		expect(mockDiv.innerHTML).toContain("APY");
		expect((window as any).expectedFormat).toBe("Enter percentage (e.g., 5.25)");
	});
	it("generates annuity question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.75) // type "annuity"
			.mockReturnValueOnce(0.5) // principal -> consumed but not used as principal in annuity
			.mockReturnValueOnce(0.5) // rate
			.mockReturnValueOnce(0.5) // years
			.mockReturnValueOnce(0.5) // n (unused)
			.mockReturnValueOnce(0.5); // payment -> floor(0.5*500)+100=250+100=350
		generateFinance();
		expect(mockDiv.innerHTML).toContain("deposit");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
});
