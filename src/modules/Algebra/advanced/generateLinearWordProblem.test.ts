/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateLinearWordProblem} from "./generateLinearWordProblem";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement | null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>20)
}));
describe("generateLinearWordProblem", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={ typeset: vi.fn() };
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", ()=>{
		(questionArea as any)=null;
		generateLinearWordProblem();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates consecutive integers problem correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // type "consecutive_integers"
			.mockReturnValueOnce(0.3); // n -> floor(0.3*20)+1=6+1=7
		generateLinearWordProblem();
		expect(mockDiv.innerHTML).toBe("The sum of two consecutive integers is 15. Find the smaller integer.");
		expect((window as any).correctAnswer).toEqual({
			correct: "7",
			alternate: "7",
			display: "7"
		});
		expect((window as any).expectedFormat).toBe("Enter a whole number");
		expect((window as any).MathJax.typeset).toHaveBeenCalled();
	});
	it("generates money problem correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3) // type "money"
			.mockReturnValueOnce(0.2) // quarters -> floor(0.2*5)+2=1+2=3
			.mockReturnValueOnce(0.8); // dimes -> floor(0.8*5)+2=4+2=6
		generateLinearWordProblem();
		expect(mockDiv.innerHTML).toBe("You have 3 quarters and 6 dimes. How much money do you have in cents?");
		expect((window as any).correctAnswer).toEqual({
			correct: "135",
			alternate: "135",
			display: "135"
		});
		expect((window as any).expectedFormat).toBe("Enter a number (cents)");
	});
	it("generates distance problem correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "distance"
			.mockReturnValueOnce(0.5) // rate -> floor(0.5*30)+20=15+20=35
			.mockReturnValueOnce(0.8); // time -> floor(0.8*3)+2=2+2=4
		generateLinearWordProblem();
		expect(mockDiv.innerHTML).toBe("A car travels at 35 mph for 4 hours. How far does it travel?");
		expect((window as any).correctAnswer).toEqual({
			correct: "140",
			alternate: "140",
			display: "140"
		});
		expect((window as any).expectedFormat).toBe("Enter a number (miles)");
	});
	it("generates age problem correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "age"
			.mockReturnValueOnce(0.5) // now -> floor(0.5*20)+10=10+10=20
			.mockReturnValueOnce(0.4); // past -> floor(0.4*5)+2=2+2=4
		generateLinearWordProblem();
		expect(mockDiv.innerHTML).toBe("A person is 20 years old. How old were they 4 years ago?");
		expect((window as any).correctAnswer).toEqual({
			correct: "16",
			alternate: "16",
			display: "16"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("generates mixture problem correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9) // type "mixture"
			.mockReturnValueOnce(0.5) // total -> floor(0.5*20)+10=10+10=20
			.mockReturnValueOnce(0.6); // percent -> floor(0.6*30)+20=18+20=38
		generateLinearWordProblem();
		expect(mockDiv.innerHTML).toBe("A 20 gallon mixture contains 38% alcohol. How many gallons of alcohol are in it?");
		expect((window as any).correctAnswer).toEqual({
			correct: "8",
			alternate: "8",
			display: "8"
		});
		expect((window as any).expectedFormat).toBe("Enter a number (gallons)");
	});
	it("uses getMaxForDifficulty with provided difficulty", ()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(30);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1) // type
			.mockReturnValueOnce(0.1); // n for consecutive
		generateLinearWordProblem("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 20);
		expect(mockGetMax).toHaveReturnedWith(30);
	});
	it("does not call MathJax.typeset if MathJax is missing", ()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1);
		generateLinearWordProblem();
		expect((window as any).MathJax).toBeUndefined();
	});
});