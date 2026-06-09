/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {getRangeForDifficulty,getMaxForDifficulty,gcd,isPrime,generateAddition,generateSubtraction,generateMultiplication,generateDivision,generateWholeNumberPlaceValue,generateNumberLineOrdering,generateDivisibility,generateGCFLCM} from "./index.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
describe("barrel exports",()=>{
    let originalMathRandom: ()=>number;
    beforeEach(()=>{
        originalMathRandom=Math.random;
    });
    afterEach(()=>{
        Math.random=originalMathRandom;
        delete (window as any).MathJax;
    });
    it("exports getRangeForDifficulty",()=>{
        expect(typeof getRangeForDifficulty).toBe("function");
    });
    it("exports getMaxForDifficulty",()=>{
        expect(typeof getMaxForDifficulty).toBe("function");
    });
    it("exports gcd",()=>{
        expect(typeof gcd).toBe("function");
    });
    it("exports isPrime",()=>{
        expect(typeof isPrime).toBe("function");
    });
    it("exports generateAddition",()=>{
        expect(typeof generateAddition).toBe("function");
    });
    it("exports generateSubtraction",()=>{
        expect(typeof generateSubtraction).toBe("function");
    });
    it("exports generateMultiplication",()=>{
        expect(typeof generateMultiplication).toBe("function");
    });
    it("exports generateDivision",()=>{
        expect(typeof generateDivision).toBe("function");
    });
    it("exports generateWholeNumberPlaceValue",()=>{
        expect(typeof generateWholeNumberPlaceValue).toBe("function");
    });
    it("exports generateNumberLineOrdering",()=>{
        expect(typeof generateNumberLineOrdering).toBe("function");
    });
    it("exports generateDivisibility",()=>{
        expect(typeof generateDivisibility).toBe("function");
    });
    it("exports generateGCFLCM",()=>{
        expect(typeof generateGCFLCM).toBe("function");
    });
    it("getRangeForDifficulty returns correct range",()=>{
        let result=getRangeForDifficulty("easy");
        expect(result.min).toBe(1);
        expect(result.max).toBe(50);
    });
    it("getMaxForDifficulty returns correct max",()=>{
        let result=getMaxForDifficulty("hard",50);
        expect(result).toBe(100);
    });
    it("gcd computes correctly",()=>{
        expect(gcd(12,8)).toBe(4);
    });
    it("isPrime works",()=>{
        expect(isPrime(7)).toBe(true);
        expect(isPrime(4)).toBe(false);
    });
    it("should set window.correctAnswer",()=>{
        let mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        let mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition();
        expect((window as any).expectedFormat).toBe("Enter a number (up to 3 decimals)");
    });
    it("should handle easy difficulty",()=>{
        let mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition("easy");
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        let mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition("medium");
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        let mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition("hard");
        expect((window as any).correctAnswer).toBeDefined();
    });
});
