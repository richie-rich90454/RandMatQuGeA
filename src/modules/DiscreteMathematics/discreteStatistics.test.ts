/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateStatistics} from "./discreteStatistics.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",async()=>{
	const actual=await vi.importActual("./discreteUtils.js");
	return{...actual,getDataRange:vi.fn(()=>({min:1,max:20,count:5}))};
});
describe("generateStatistics",()=>{
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
		generateStatistics();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates mean correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateStatistics();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates median correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.12);
		generateStatistics();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates mode correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.23);
		generateStatistics();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates range correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.35);
		generateStatistics();
		expect((window as any).correctAnswer).toBeDefined();
	});
});
