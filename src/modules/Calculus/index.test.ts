/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import{
	getMaxCoeff,
	latexToPlain,
	trigFunctions,
	expFunctions,
	logFunctions,
	trigIntegrals,
	generateDerivative,
	generateIntegral,
	generateLimit,
	generateRelatedRates,
	generateLimitsContinuity,
	generateApplicationsDiff,
	generateIntegrationAdvanced,
	generateGraphicalCalculus,
	generateParametricPolarVector,
	generateSequencesSeries,
}from "./index";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("index barrel",()=>{
	it("exports calculusUtils functions",()=>{
		expect(getMaxCoeff).toBeDefined();
		expect(typeof getMaxCoeff).toBe("function");
		expect(latexToPlain).toBeDefined();
		expect(typeof latexToPlain).toBe("function");
	});
	it("exports calculusUtils arrays",()=>{
		expect(Array.isArray(trigFunctions)).toBe(true);
		expect(Array.isArray(expFunctions)).toBe(true);
		expect(Array.isArray(logFunctions)).toBe(true);
		expect(Array.isArray(trigIntegrals)).toBe(true);
	});
	it("exports generateDerivative",()=>{
		expect(generateDerivative).toBeDefined();
		expect(typeof generateDerivative).toBe("function");
	});
	it("exports generateIntegral",()=>{
		expect(generateIntegral).toBeDefined();
		expect(typeof generateIntegral).toBe("function");
	});
	it("exports generateLimit and generateRelatedRates",()=>{
		expect(generateLimit).toBeDefined();
		expect(typeof generateLimit).toBe("function");
		expect(generateRelatedRates).toBeDefined();
		expect(typeof generateRelatedRates).toBe("function");
	});
	it("exports generateLimitsContinuity",()=>{
		expect(generateLimitsContinuity).toBeDefined();
		expect(typeof generateLimitsContinuity).toBe("function");
	});
	it("exports generateApplicationsDiff",()=>{
		expect(generateApplicationsDiff).toBeDefined();
		expect(typeof generateApplicationsDiff).toBe("function");
	});
	it("exports generateIntegrationAdvanced",()=>{
		expect(generateIntegrationAdvanced).toBeDefined();
		expect(typeof generateIntegrationAdvanced).toBe("function");
	});
	it("exports generateGraphicalCalculus",()=>{
		expect(generateGraphicalCalculus).toBeDefined();
		expect(typeof generateGraphicalCalculus).toBe("function");
	});
	it("exports generateParametricPolarVector",()=>{
		expect(generateParametricPolarVector).toBeDefined();
		expect(typeof generateParametricPolarVector).toBe("function");
	});
	it("exports generateSequencesSeries",()=>{
		expect(generateSequencesSeries).toBeDefined();
		expect(typeof generateSequencesSeries).toBe("function");
	});
});
describe("index barrel — window side effects",()=>{
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
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateDerivative("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
