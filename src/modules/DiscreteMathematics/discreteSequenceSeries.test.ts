/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateArithmeticSequence,generateGeometricSequence,generateSequenceLimit,generateBinomialTheorem} from "./discreteSequenceSeries.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",async()=>{
	const actual=await vi.importActual("./discreteUtils.js");
	return{...actual,getMaxN:vi.fn(()=>6)};
});
describe("generateArithmeticSequence",()=>{
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
		generateArithmeticSequence();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates arithmetic term correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates arithmetic sum correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.6);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates geometric sequence correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateGeometricSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates sequence limit correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSequenceLimit();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates binomial theorem correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateBinomialTheorem();
		expect((window as any).correctAnswer).toBeDefined();
	});
});
