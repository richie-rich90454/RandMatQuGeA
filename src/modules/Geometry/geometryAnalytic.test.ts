/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateParabola,generateEllipse,generateHyperbola,generate3DDistanceMidpoint} from "./geometryAnalytic.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./geometryUtils.js",()=>({
	getMaxForDifficulty:vi.fn(()=>5),
	cleanupVisualization:vi.fn()
}));
vi.mock("./geometryVisualization.js",()=>({
	createVisualization:vi.fn()
}));
describe("generateParabola",()=>{
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
		generateParabola();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates parabola correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
		generateParabola();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toContain("focus");
	});
	it("generates ellipse correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateEllipse();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates hyperbola correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateHyperbola();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates 3D distance midpoint correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generate3DDistanceMidpoint();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toContain("distance");
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
		generateParabola();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
		generateParabola();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
		generateParabola("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
		generateParabola("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
		generateParabola("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
