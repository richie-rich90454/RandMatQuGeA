/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach,afterEach,vi}from"vitest";
import*as eq from"./algebraEquations.js";
import{questionArea}from"../../script.js";
import{getMaxForDifficulty}from"./algebraUtils.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
vi.mock("./algebraUtils.js",()=>({
    getMaxForDifficulty: vi.fn(()=>10)
}));
describe("algebraEquations exports",()=>{
    it("should export generateLinearEquation",()=>{
        expect(typeof eq.generateLinearEquation).toBe("function");
    });
    it("should export generateQuadraticEquation",()=>{
        expect(typeof eq.generateQuadraticEquation).toBe("function");
    });
    it("should export generateLinearInequality",()=>{
        expect(typeof eq.generateLinearInequality).toBe("function");
    });
    it("should export generateQuadraticInequality",()=>{
        expect(typeof eq.generateQuadraticInequality).toBe("function");
    });
    it("should export generateRationalInequality",()=>{
        expect(typeof eq.generateRationalInequality).toBe("function");
    });
    it("should export generateSystem2x2",()=>{
        expect(typeof eq.generateSystem2x2).toBe("function");
    });
    it("should export generateSystem3x3",()=>{
        expect(typeof eq.generateSystem3x3).toBe("function");
    });
});
describe("generateLinearEquation",()=>{
    let originalMathRandom:()=>number;
    let mockDiv:HTMLDivElement;
    beforeEach(()=>{
        originalMathRandom=Math.random;
        mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
    });
    afterEach(()=>{
        Math.random=originalMathRandom;
        delete (window as any).MathJax;
    });
    it("should set window.correctAnswer",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        eq.generateLinearEquation();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        eq.generateLinearEquation();
        expect((window as any).expectedFormat).toBeDefined();
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        eq.generateLinearEquation("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        eq.generateLinearEquation("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        eq.generateLinearEquation("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
