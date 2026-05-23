/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateIntegrationAdvanced} from "./calculusIntegrationAdvanced";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateIntegrationAdvanced",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typeset:vi.fn()};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateIntegrationAdvanced();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates avgValue correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.01)// type->floor(28*0.01)=0 avgValue
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2 (swapped with b)
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3 (swapped with a)
		generateIntegrationAdvanced();
		let val=((27-8)/3)/(3-2);
		expect((window as any).correctAnswer).toMatchObject({
			correct:val.toFixed(2),
			alternate:val.toFixed(2)
		});
	});
	it("generates areaBetweenX correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)// type->floor(28*0.04)=1 areaBetweenX
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateIntegrationAdvanced();
		let val=8/6;
		expect((window as any).correctAnswer).toMatchObject({
			correct:val.toFixed(2),
			alternate:val.toFixed(2)
		});
	});
	it("generates parts correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(28*0.4)=11 parts
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateIntegrationAdvanced();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"(1/2)x e^(2x) - (1/4) e^(2x) + C",
			alternate:"(1/2)x e^(2x) - (1/4) e^(2x) + C"
		});
	});
	it("generates verifySolution correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.58)// type->floor(28*0.58)=16 verifySolution
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateIntegrationAdvanced();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"yes",
			alternate:"yes"
		});
	});
	it("generates slopeField correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.61);// type->floor(28*0.61)=17 slopeField
		generateIntegrationAdvanced();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"slope 0",
			alternate:"slope 0"
		});
	});
});
