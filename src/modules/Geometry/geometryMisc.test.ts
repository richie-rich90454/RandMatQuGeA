/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generatePerimeter,generateArcLength,generateDistanceFormula,generateAngleRelations} from "./geometryMisc.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./geometryUtils.js",()=>({
	getMaxForDifficulty:vi.fn(()=>5),
	cleanupVisualization:vi.fn()
}));
vi.mock("./geometryVisualization.js",()=>({
	createVisualization:vi.fn()
}));
describe("generatePerimeter",()=>{
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
		generatePerimeter();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates rectangle perimeter correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.6).mockReturnValue(0.3);
		generatePerimeter();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates triangle perimeter correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.3).mockReturnValue(0.3);
		generatePerimeter();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates arc length correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArcLength();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates angle relations correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAngleRelations();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toContain("complement");
	});
	it("generates distance formula correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateDistanceFormula();
		expect((window as any).correctAnswer).toBeDefined();
	});
});
