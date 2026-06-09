/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import * as trig from "./index.js";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
describe("Trigonometry index exports",()=>{
	it("exports generateSin",()=>{
		expect(typeof trig.generateSin).toBe("function");
	});
	it("exports generateCosine",()=>{
		expect(typeof trig.generateCosine).toBe("function");
	});
	it("exports generateTangent",()=>{
		expect(typeof trig.generateTangent).toBe("function");
	});
	it("exports generateCosecant",()=>{
		expect(typeof trig.generateCosecant).toBe("function");
	});
	it("exports formatPiFraction",()=>{
		expect(typeof trig.formatPiFraction).toBe("function");
	});
});
describe("Trigonometry index functions",()=>{
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
		Math.random=vi.fn().mockReturnValue(0.5);
		trig.generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		trig.generateSin();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		trig.generateSin("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		trig.generateSin("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		trig.generateSin("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
