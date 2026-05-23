/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateProbability} from "./discreteProbability.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",async()=>{
	const actual=await vi.importActual("./discreteUtils.js");
	return{...actual,getMaxN:vi.fn(()=>6)};
});
describe("generateProbability",()=>{
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
		generateProbability();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates basic probability correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates conditional probability correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.09);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates binomial probability correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.45);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates expected value correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.55);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
});
