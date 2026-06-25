/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generatePythagorean,generateSimilarTriangles,generateTriangleClassification} from "./geometryTriangles.js";
import {getMaxForDifficulty} from "./geometryUtils.js";
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
describe("generatePythagorean",()=>{
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
		generatePythagorean();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeDefined();
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
describe("generatePythagorean - edge cases",()=>{
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
        generatePythagorean();
        expect(mockDiv.innerHTML).not.toBe("");
    });
    it("should set correctAnswer with display property",()=>{
        Math.random=vi.fn().mockReturnValue(0.3);
        generatePythagorean();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("display");
    });
    it("should handle 3-4-5 triangle",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.3);
        generatePythagorean();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBe("5.00");
    });
    it("should handle 5-12-13 triangle",()=>{
        vi.mocked(getMaxForDifficulty).mockReturnValueOnce(12);
        Math.random=vi.fn()
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.8);
        generatePythagorean();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBe("13.00");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.3);
        generatePythagorean("easy");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.3);
        generatePythagorean("medium");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.3);
        generatePythagorean("hard");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle repeated calls",()=>{
        Math.random=vi.fn().mockReturnValue(0.3);
        generatePythagorean();
        let first=(window as any).correctAnswer;
        Math.random=vi.fn().mockReturnValue(0.5);
        generatePythagorean();
        let second=(window as any).correctAnswer;
        expect(first).toBeDefined();
        expect(second).toBeDefined();
    });
});
