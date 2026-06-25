/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateParabola,generateEllipse,generateHyperbola,generate3DDistanceMidpoint} from "./geometryAnalytic.js";
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
describe("generateParabola",()=>{
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
		generateParabola();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeDefined();
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
describe("generateParabola - edge cases",()=>{
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
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateParabola();
        expect(mockDiv.innerHTML).not.toBe("");
    });
    it("should set correctAnswer with display property",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateParabola();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("display");
    });
    it("should handle vertical parabola",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.3);
        generateParabola();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toContain("focus");
    });
    it("should handle horizontal parabola",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.7);
        generateParabola();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toContain("focus");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateParabola("easy");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateParabola("medium");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateParabola("hard");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle repeated calls",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateParabola();
        let first=(window as any).correctAnswer;
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.7);
        generateParabola();
        let second=(window as any).correctAnswer;
        expect(first).toBeDefined();
        expect(second).toBeDefined();
    });
});
