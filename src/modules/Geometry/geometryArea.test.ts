/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateAreaCircle,generateAreaRectangle,generateAreaTriangle} from "./geometryArea.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./geometryUtils.js",()=>({
	getMaxForDifficulty:vi.fn(()=>5),
	cleanupVisualization:vi.fn()
}));
vi.mock("./geometryVisualization.js",()=>({
	createVisualization:vi.fn()
}));
describe("generateAreaCircle",()=>{
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
		generateAreaCircle();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates circle area correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		expect((window as any).correctAnswer).toBeDefined();
		expect(mockDiv.innerHTML).toContain("circle");
	});
	it("generates rectangle area correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaRectangle();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates triangle area correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaTriangle();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("sets correctAnswer with choices",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
