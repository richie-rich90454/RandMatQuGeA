/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach,afterEach,vi}from"vitest";
import*as eq from"./algebraEquations.js";
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
describe("generateQuadraticEquation - no duplicate choices",()=>{
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
    it("factor case should not have duplicate choices identical to correct answer",()=>{
        // Force "factor" type by making Math.random() < 0.25 (type index 0)
        Math.random=vi.fn()
            .mockReturnValueOnce(0.01)   // selects "factor" type
            .mockReturnValueOnce(0.3)    // p
            .mockReturnValueOnce(0.5);   // q
        eq.generateQuadraticEquation();
        const ca=(window as any).correctAnswer;
        expect(ca).toBeDefined();
        const correct=ca.correct;
        const choices=ca.choices as string[];
        // Count how many times correct appears in choices
        const correctCount=choices.filter(c=>c===correct).length;
        expect(correctCount).toBe(1);
        // All choices should be unique
        const uniqueChoices=new Set(choices);
        expect(uniqueChoices.size).toBe(choices.length);
    });
    it("complete_square case should not have duplicate choices identical to correct answer",()=>{
        // Force "complete_square" type (index 1) via random ~0.3
        Math.random=vi.fn()
            .mockReturnValueOnce(0.26)   // selects "complete_square" type
            .mockReturnValueOnce(0.5)    // d
            .mockReturnValueOnce(0.3);   // e
        eq.generateQuadraticEquation();
        const ca=(window as any).correctAnswer;
        expect(ca).toBeDefined();
        const correct=ca.correct;
        const choices=ca.choices as string[];
        const correctCount=choices.filter(c=>c===correct).length;
        expect(correctCount).toBe(1);
        const uniqueChoices=new Set(choices);
        expect(uniqueChoices.size).toBe(choices.length);
    });
    it("all generator outputs should have unique choices",()=>{
        // Run each generator multiple times and verify no duplicates
        const generators=[
            eq.generateLinearEquation,
            eq.generateQuadraticEquation,
            eq.generateLinearInequality,
            eq.generateQuadraticInequality,
            eq.generateRationalInequality,
            eq.generateSystem2x2,
            eq.generateSystem3x3
        ];
        for(const gen of generators){
            for(let i=0;i<5;i++){
                Math.random=vi.fn().mockReturnValue(Math.random());
                gen();
                const ca=(window as any).correctAnswer;
                if(ca&&ca.choices){
                    const uniqueChoices=new Set(ca.choices);
                    expect(uniqueChoices.size).toBe(ca.choices.length);
                }
            }
        }
    });
});
