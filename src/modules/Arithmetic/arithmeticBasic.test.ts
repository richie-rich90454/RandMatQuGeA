/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {getRangeForDifficulty} from "./arithmeticUtils.js";
import {generateAddition,generateSubtraction,generateMultiplication,generateDivision} from "./arithmeticBasic.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
vi.mock("./arithmeticUtils.js",()=>({
    getRangeForDifficulty: vi.fn(()=>({min:1,max:10}))
}));
describe("generateAddition",()=>{
    let mockDiv: HTMLDivElement;
    let originalMathRandom: ()=>number;
    beforeEach(()=>{
        originalMathRandom=Math.random;
        mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
    });
    afterEach(()=>{
        Math.random=originalMathRandom;
        delete (window as any).MathJax;
    });
    it("returns early if questionArea is null",()=>{
        (questionArea as any)=null;
        generateAddition();
        expect(mockDiv.innerHTML).toBe("");
        expect((window as any).correctAnswer).toBeUndefined();
        expect((window as any).expectedFormat).toBeUndefined();
    });
    it("generates correct addition question and answer",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition();
        expect(mockDiv.innerHTML).toBe("$5.5+5=$");
        expect((window as any).correctAnswer.correct).toBe("10.500");
        expect((window as any).correctAnswer.alternate).toBe("10.500");
        expect((window as any).correctAnswer.display).toBe("10.500");
        expect((window as any).expectedFormat).toBe("Enter a number (up to 3 decimals)");
        expect((window as any).MathJax.typeset).toHaveBeenCalled();
    });
    it("generates addition with easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition("easy");
        expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("easy");
    });
    it("handles negative addition result",()=>{
        Math.random=vi.fn().mockReturnValue(0.01);
        generateAddition();
        let result=parseFloat((window as any).correctAnswer.correct);
        expect(result).not.toBeNaN();
    });
    it("does not call MathJax when missing",()=>{
        delete (window as any).MathJax;
        Math.random=vi.fn().mockReturnValue(0.5);
        generateAddition();
        expect((window as any).MathJax).toBeUndefined();
    });
});
describe("generateSubtraction",()=>{
    let mockDiv: HTMLDivElement;
    let originalMathRandom: ()=>number;
    beforeEach(()=>{
        originalMathRandom=Math.random;
        mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
    });
    afterEach(()=>{
        Math.random=originalMathRandom;
        delete (window as any).MathJax;
    });
    it("returns early if questionArea is null",()=>{
        (questionArea as any)=null;
        generateSubtraction();
        expect(mockDiv.innerHTML).toBe("");
        expect((window as any).correctAnswer).toBeUndefined();
    });
    it("generates correct subtraction question",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateSubtraction();
        expect(mockDiv.innerHTML).toBe("$5.5-5=$");
        expect((window as any).correctAnswer.correct).toBe("0.500");
        expect((window as any).expectedFormat).toBe("Enter a number (up to 3 decimals)");
    });
    it("handles negative subtraction result",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
        generateSubtraction();
        expect((window as any).correctAnswer.correct).toBe("-7.100");
    });
    it("generates subtraction with hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateSubtraction("hard");
        expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("hard");
    });
});
describe("generateMultiplication",()=>{
    let mockDiv: HTMLDivElement;
    let originalMathRandom: ()=>number;
    beforeEach(()=>{
        originalMathRandom=Math.random;
        mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
    });
    afterEach(()=>{
        Math.random=originalMathRandom;
        delete (window as any).MathJax;
    });
    it("returns early if questionArea is null",()=>{
        (questionArea as any)=null;
        generateMultiplication();
        expect(mockDiv.innerHTML).toBe("");
    });
    it("generates correct multiplication question",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateMultiplication();
        expect(mockDiv.innerHTML).toBe("$5.5 \\times 5=$<br>Round your answer to two decimal places");
        expect((window as any).correctAnswer.correct).toBe("27.50");
        expect((window as any).correctAnswer.alternate).toBe("27.50000");
        expect((window as any).expectedFormat).toBe("Enter a number rounded to 2 decimal places");
    });
    it("generates multiplication with given difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateMultiplication("easy");
        expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("easy");
    });
    it("includes choices when generating multiplication",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateMultiplication();
        expect((window as any).correctAnswer.choices).toBeDefined();
        expect((window as any).correctAnswer.choices.length).toBeGreaterThan(0);
        expect((window as any).correctAnswer.choices).toContain("27.50");
    });
});
describe("generateDivision",()=>{
    let mockDiv: HTMLDivElement;
    let originalMathRandom: ()=>number;
    beforeEach(()=>{
        originalMathRandom=Math.random;
        mockDiv=document.createElement("div");
        (questionArea as any)=mockDiv;
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={typeset:vi.fn()};
    });
    afterEach(()=>{
        Math.random=originalMathRandom;
        delete (window as any).MathJax;
    });
    it("returns early if questionArea is null",()=>{
        (questionArea as any)=null;
        generateDivision();
        expect(mockDiv.innerHTML).toBe("");
    });
    it("generates correct division question",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivision();
        expect(mockDiv.innerHTML).toBe("$5.5 \\div 5=$<br>Round your answer to two decimal places");
        expect((window as any).correctAnswer.correct).toBe("1.10");
        expect((window as any).expectedFormat).toBe("Enter a number rounded to 2 decimal places");
    });
    it("guards against division by zero",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0);
        generateDivision();
        expect((window as any).correctAnswer.correct).toBe("5.50");
        expect((window as any).correctAnswer.alternate).toBe("5.50000");
    });
    it("generates division with hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivision("hard");
        expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("hard");
    });
});
