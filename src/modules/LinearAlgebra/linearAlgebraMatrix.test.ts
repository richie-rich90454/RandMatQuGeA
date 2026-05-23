/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateMatrix} from "./linearAlgebraMatrix.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./linearAlgebraUtils.js",async()=>{
	const actual=await vi.importActual("./linearAlgebraUtils.js");
	return{...actual,getRange:vi.fn(()=>3)};
});
describe("generateMatrix",()=>{
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
		generateMatrix();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates matrix addition correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("generates matrix multiplication correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.25);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates matrix inverse correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates 2x2 system correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.4);
		generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
	});
});
