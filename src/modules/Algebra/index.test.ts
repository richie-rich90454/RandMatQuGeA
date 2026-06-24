/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach,afterEach,vi}from"vitest";
import*as Algebra from"./index.js";
import{questionArea}from"../../script.js";
import{getMaxForDifficulty}from"./algebraUtils.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
vi.mock("./algebraUtils.js",()=>({
    factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
    gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
    getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
    getMaxForDifficulty:vi.fn(()=>10),
}));
describe("Algebra index barrel exports",()=>{
    it("should re-export generateLinearEquation from algebraEquations",()=>{
        expect(typeof Algebra.generateLinearEquation).toBe("function");
    });
    it("should re-export generateFraction from algebraBasics",()=>{
        expect(typeof Algebra.generateFraction).toBe("function");
    });
    it("should re-export generateLogarithm from algebraAdvanced",()=>{
        expect(typeof Algebra.generateLogarithm).toBe("function");
    });
    it("should re-export generatePolynomial from algebraGraphingPolynomials",()=>{
        expect(typeof Algebra.generatePolynomial).toBe("function");
    });
    it("should re-export generateRealNumberOperations from algebraInPrecalculus",()=>{
        expect(typeof Algebra.generateRealNumberOperations).toBe("function");
    });
    it("should re-export getMaxForDifficulty from algebraUtils",()=>{
        expect(typeof Algebra.getMaxForDifficulty).toBe("function");
    });
    it("should re-export factorial from algebraUtils",()=>{
        expect(typeof Algebra.factorial).toBe("function");
    });
});
describe("generateLinearEquation via barrel",()=>{
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
        Algebra.generateLinearEquation();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        Algebra.generateLinearEquation();
        expect((window as any).expectedFormat).toBeDefined();
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        Algebra.generateLinearEquation("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        Algebra.generateLinearEquation("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        Algebra.generateLinearEquation("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",10);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
