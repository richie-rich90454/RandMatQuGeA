/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateRealNumberOperations} from "./generateRealNumberOperations";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js", ()=>({
	getMaxForDifficulty: vi.fn(()=>10)
}));
describe("generateRealNumberOperations", ()=>{
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
		generateRealNumberOperations();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates absolute value question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "absolute"
			.mockReturnValueOnce(0.3); // a -> floor(0.3*20)-10=6-10=-4
		generateRealNumberOperations();
		expect(mockDiv.innerHTML).toContain("|");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "4",
			display: "4"
		});
	});
	it("generates distance question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.25) // type "distance"
			.mockReturnValueOnce(0.3) // a -> 3
			.mockReturnValueOnce(0.6); // b -> 6
		generateRealNumberOperations();
		expect(mockDiv.innerHTML).toContain("distance");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "3",
			display: "3"
		});
	});
	it("generates order question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5) // type "order"
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.6) // b
			.mockReturnValueOnce(0.1); // op index 0 -> "<"
		generateRealNumberOperations();
		expect(mockDiv.innerHTML).toContain("true or false");
		expect((window as any).expectedFormat).toBe("Enter 'true' or 'false'");
	});
	it("generates interval question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.75) // type "interval"
			.mockReturnValueOnce(0.3) // a -> floor(0.3*10)+1=3+1=4
			.mockReturnValueOnce(0.6) // bOffset -> floor(0.6*10)+2=6+2=8 -> b=12
			.mockReturnValueOnce(0.0); // intervalType index 0 -> "open"
		generateRealNumberOperations();
		expect(mockDiv.innerHTML).toContain("interval");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "all x such that 4 < x < 12",
			display: "all x such that 4 < x < 12"
		});
	});
});
