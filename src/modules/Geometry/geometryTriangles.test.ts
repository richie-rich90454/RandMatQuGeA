/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generatePythagorean,generateSimilarTriangles,generateTriangleClassification} from "./geometryTriangles.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./geometryUtils.js",()=>({
	getMaxForDifficulty:vi.fn(()=>5),
	cleanupVisualization:vi.fn()
}));
vi.mock("./geometryVisualization.js",()=>({
	createVisualization:vi.fn()
}));
describe("generatePythagorean",()=>{
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
		generatePythagorean();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates pythagorean correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePythagorean();
		expect((window as any).correctAnswer).toBeDefined();
		expect(mockDiv.innerHTML).toContain("hypotenuse");
	});
	it("generates similar triangles correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSimilarTriangles();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates triangle classification correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.2);
		generateTriangleClassification();
		expect((window as any).correctAnswer).toBeDefined();
		expect(["equilateral","isosceles","scalene"]).toContain((window as any).correctAnswer.correct);
	});
	it("generates triangle classification for scalene",()=>{
		Math.random=vi.fn().mockReturnValue(0.8);
		generateTriangleClassification();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePythagorean();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePythagorean();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePythagorean("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePythagorean("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generatePythagorean("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
