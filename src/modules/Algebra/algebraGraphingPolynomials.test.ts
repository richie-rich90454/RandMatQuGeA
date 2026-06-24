/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach,afterEach,vi}from"vitest";
import*as gp from"./algebraGraphingPolynomials.js";
import{questionArea}from"../../script.js";
import{getMaxForDifficulty}from"./algebraUtils.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
vi.mock("./algebraUtils.js",()=>({
    factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
    gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
    getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
    getMaxForDifficulty:vi.fn(()=>5),
}));
describe("algebraGraphingPolynomials exports",()=>{
    it("should export generatePolynomial",()=>{
        expect(typeof gp.generatePolynomial).toBe("function");
    });
    it("should export generatePolynomialDivision",()=>{
        expect(typeof gp.generatePolynomialDivision).toBe("function");
    });
    it("should export generateFactoring",()=>{
        expect(typeof gp.generateFactoring).toBe("function");
    });
    it("should export generateFunctionConcepts",()=>{
        expect(typeof gp.generateFunctionConcepts).toBe("function");
    });
    it("should export generateLinearGraphing",()=>{
        expect(typeof gp.generateLinearGraphing).toBe("function");
    });
    it("should export generateNonLinearGraphing",()=>{
        expect(typeof gp.generateNonLinearGraphing).toBe("function");
    });
});
describe("generatePolynomial",()=>{
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
        gp.generatePolynomial();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        gp.generatePolynomial();
        expect((window as any).expectedFormat).toBeDefined();
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        gp.generatePolynomial("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",5);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        gp.generatePolynomial("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",5);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        gp.generatePolynomial("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",5);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
