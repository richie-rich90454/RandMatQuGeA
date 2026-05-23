/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generatePermutation,generateCombination} from "./discretePermutationsCombinations.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",async()=>{
	const actual=await vi.importActual("./discreteUtils.js");
	return{...actual,getMaxN:vi.fn(()=>6)};
});
describe("generatePermutation",()=>{
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
		generatePermutation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates basic permutation correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates word permutation correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.25);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates basic combination correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateCombination();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates combination word correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.35);
		generateCombination();
		expect((window as any).correctAnswer).toBeDefined();
		expect(mockDiv.innerHTML).toContain("choose");
	});
});
