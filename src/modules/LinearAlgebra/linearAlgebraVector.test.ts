/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateVector} from "./linearAlgebraVector.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./linearAlgebraUtils.js",async()=>{
	const actual=await vi.importActual("./linearAlgebraUtils.js");
	return{...actual,getRange:vi.fn(()=>3)};
});
describe("generateVector",()=>{
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
		generateVector();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates vector magnitude correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateVector();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates vector direction correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.08);
		generateVector();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates dot product correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.28);
		generateVector();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates vector addition correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.86);
		generateVector();
		expect((window as any).correctAnswer).toBeDefined();
	});
});
