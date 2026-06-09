/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach,afterEach,vi}from"vitest";
import*as precalc from"./algebraInPrecalculus.js";
import{questionArea}from"../../script.js";
import{getMaxForDifficulty}from"./algebraUtils.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
vi.mock("./algebraUtils.js",()=>({
    getMaxForDifficulty: vi.fn(()=>10)
}));
describe("algebraInPrecalculus exports",()=>{
    it("should export generateRealNumberOperations",()=>{
        expect(typeof precalc.generateRealNumberOperations).toBe("function");
    });
    it("should export generateCartesianConcepts",()=>{
        expect(typeof precalc.generateCartesianConcepts).toBe("function");
    });
    it("should export generateCircleEquations",()=>{
        expect(typeof precalc.generateCircleEquations).toBe("function");
    });
    it("should export generateLinearEquationSpecial",()=>{
        expect(typeof precalc.generateLinearEquationSpecial).toBe("function");
    });
    it("should export generateRationalEquation",()=>{
        expect(typeof precalc.generateRationalEquation).toBe("function");
    });
    it("should export generatePolynomialInequality",()=>{
        expect(typeof precalc.generatePolynomialInequality).toBe("function");
    });
    it("should export generateFunctionProperties",()=>{
        expect(typeof precalc.generateFunctionProperties).toBe("function");
    });
    it("should export generateBasicFunctions",()=>{
        expect(typeof precalc.generateBasicFunctions).toBe("function");
    });
    it("should export generateFunctionOperations",()=>{
        expect(typeof precalc.generateFunctionOperations).toBe("function");
    });
    it("should export generateInverseFunctions",()=>{
        expect(typeof precalc.generateInverseFunctions).toBe("function");
    });
    it("should export generateTransformations",()=>{
        expect(typeof precalc.generateTransformations).toBe("function");
    });
    it("should export generatePowerFunctionModeling",()=>{
        expect(typeof precalc.generatePowerFunctionModeling).toBe("function");
    });
    it("should export generatePolynomialEndBehavior",()=>{
        expect(typeof precalc.generatePolynomialEndBehavior).toBe("function");
    });
    it("should export generateSyntheticDivision",()=>{
        expect(typeof precalc.generateSyntheticDivision).toBe("function");
    });
    it("should export generateComplexZeros",()=>{
        expect(typeof precalc.generateComplexZeros).toBe("function");
    });
    it("should export generateRationalGraphAnalysis",()=>{
        expect(typeof precalc.generateRationalGraphAnalysis).toBe("function");
    });
    it("should export generateLogisticFunctions",()=>{
        expect(typeof precalc.generateLogisticFunctions).toBe("function");
    });
    it("should export generateExponentialModeling",()=>{
        expect(typeof precalc.generateExponentialModeling).toBe("function");
    });
    it("should export generateLogarithmicModeling",()=>{
        expect(typeof precalc.generateLogarithmicModeling).toBe("function");
    });
    it("should export generateFinance",()=>{
        expect(typeof precalc.generateFinance).toBe("function");
    });
});
describe("generateRealNumberOperations",()=>{
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
        precalc.generateRealNumberOperations();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        precalc.generateRealNumberOperations();
        expect((window as any).expectedFormat).toBeDefined();
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        precalc.generateRealNumberOperations("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        precalc.generateRealNumberOperations("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        precalc.generateRealNumberOperations("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
