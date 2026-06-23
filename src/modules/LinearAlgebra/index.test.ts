/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import * as la from "./index.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./linearAlgebraUtils.js",()=>({
	getRange:vi.fn(()=>3),
	matrixToString:vi.fn((m:any,style="bmatrix")=>`\\begin{${style}} ${m.a} & ${m.b} \\\\ ${m.c} & ${m.d} \\end{${style}}`),
	getDeterminant:vi.fn(()=>0),
	formatMatrix:vi.fn(()=>""),
	formatVector:vi.fn(()=>""),
	getMatrixSize:vi.fn(()=>({rows:2,cols:2})),
	getVectorDimension:vi.fn(()=>2),
}));
describe("LinearAlgebra index exports",()=>{
	it("exports generateMatrix",()=>{
		expect(typeof la.generateMatrix).toBe("function");
	});
	it("exports generateVector",()=>{
		expect(typeof la.generateVector).toBe("function");
	});
	it("exports generateSystem3x3",()=>{
		expect(typeof la.generateSystem3x3).toBe("function");
	});
	it("exports getRange",()=>{
		expect(typeof la.getRange).toBe("function");
	});
	it("exports matrixToString",()=>{
		expect(typeof la.matrixToString).toBe("function");
	});
});
describe("generateMatrix via index",()=>{
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
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		la.generateMatrix();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		la.generateMatrix();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		la.generateMatrix("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		la.generateMatrix("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		la.generateMatrix("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
