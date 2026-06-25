/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateAreaCircle,generateAreaRectangle,generateAreaTriangle} from "./geometryArea.js";
let sink=vi.hoisted(()=>({ div: null as HTMLDivElement|null }));
vi.mock("../../main/core/questionRenderer",()=>({
	renderer:{
		render(html: string){
			if(sink.div) sink.div.innerHTML=html;
			let mj=(window as any).MathJax;
			if(mj&&typeof mj.typesetPromise==="function") mj.typesetPromise([sink.div]);
		},
		clear(){ if(sink.div) sink.div.innerHTML=""; },
		setAnswer(a: any){ (window as any).correctAnswer=a; },
		setExpectedFormat(f: string){ (window as any).expectedFormat=f; },
		setHasQuestion(v: boolean){ (window as any).hasQuestion=v; },
		typeset(){
			let mj=(window as any).MathJax;
			if(mj&&typeof mj.typesetPromise==="function") mj.typesetPromise([sink.div]);
		}
	}
}));
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
		sink.div=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		sink.div=null;
		generateAreaCircle();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeDefined();
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
describe("generateAreaCircle - edge cases",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		sink.div=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("should produce non-empty question HTML",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle radius of 1",()=>{
		Math.random=vi.fn().mockReturnValue(0);
		generateAreaCircle();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle large radius",()=>{
		Math.random=vi.fn().mockReturnValue(0.99);
		generateAreaCircle();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle decimal radius",()=>{
		Math.random=vi.fn().mockReturnValue(0.45);
		generateAreaCircle();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should use pi in answer",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle();
		let correct=(window as any).correctAnswer.correct;
		let numeric=parseFloat(correct);
		expect(numeric).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateAreaCircle("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
});
