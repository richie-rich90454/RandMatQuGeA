/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "./arithmeticUtils.js";
import {generateWholeNumberPlaceValue,generateNumberLineOrdering,generateDivisibility,generateGCFLCM} from "./arithmeticAdvanced.js";
vi.mock("../../script.js",()=>({
    questionArea: null as HTMLElement|null
}));
vi.mock("./arithmeticUtils.js",()=>({
    getMaxForDifficulty: vi.fn(()=>100),
    isPrime: vi.fn((n:number)=>{
        if (n<2) return false;
        if (n===2) return true;
        if (n%2===0) return false;
        for (let i=3;i*i<=n;i+=2){if (n%i===0) return false;}
        return true;
    }),
	gcd: vi.fn(function g(a:number,b:number):number{
        return b===0?Math.abs(a):g(b,a%b);
    })
}));
describe("generateWholeNumberPlaceValue",()=>{
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
        generateWholeNumberPlaceValue();
        expect(mockDiv.innerHTML).toBe("");
        expect((window as any).correctAnswer).toBeUndefined();
    });
    it("generates place_value type question",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0);
        generateWholeNumberPlaceValue();
        expect(mockDiv.innerHTML).toContain("What is the place value of the digit");
        expect(mockDiv.innerHTML).toContain("150");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).expectedFormat).toBe("Enter a number (e.g., 500)");
    });
    it("generates expanded_form type question",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.34).mockReturnValueOnce(0.5);
        generateWholeNumberPlaceValue();
        expect(mockDiv.innerHTML).toBe("Write 150 in expanded form.");
        expect((window as any).correctAnswer.correct).toBe("100 + 50");
        expect((window as any).expectedFormat).toBe("Enter as 200 + 30 + 4");
    });
    it("generates rounding type question",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.67).mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
        generateWholeNumberPlaceValue();
        expect(mockDiv.innerHTML).toBe("Round 150 to the nearest hundred.");
        expect((window as any).correctAnswer.correct).toBe("200");
    });
    it("passes difficulty to getMaxForDifficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateWholeNumberPlaceValue("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",9999);
    });
    it("does not call MathJax when missing",()=>{
        delete (window as any).MathJax;
        Math.random=vi.fn().mockReturnValue(0);
        generateWholeNumberPlaceValue();
        expect((window as any).MathJax).toBeUndefined();
    });
    it("should set window.correctAnswer",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateWholeNumberPlaceValue();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateWholeNumberPlaceValue();
        expect((window as any).expectedFormat).toBeDefined();
        expect(typeof (window as any).expectedFormat).toBe("string");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateWholeNumberPlaceValue("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",9999);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateWholeNumberPlaceValue("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",9999);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateWholeNumberPlaceValue("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",9999);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
describe("generateNumberLineOrdering",()=>{
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
        generateNumberLineOrdering();
        expect(mockDiv.innerHTML).toBe("");
    });
    it("generates question with mixed negative and positive numbers",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.3).mockReturnValueOnce(0.6).mockReturnValueOnce(0.9).mockReturnValue(0.5);
        generateNumberLineOrdering();
        expect(mockDiv.innerHTML).toContain("Order the numbers from least to greatest");
        expect(mockDiv.innerHTML).toContain("-80");
        expect(mockDiv.innerHTML).toContain("80");
        expect((window as any).correctAnswer.correct).toBe("-80, -40, 20, 80");
        expect((window as any).expectedFormat).toBe("Enter numbers separated by commas, e.g., -3, 0, 5, 7");
    });
    it("ensures at least one negative in output",()=>{
        Math.random=vi.fn().mockReturnValue(0.9);
        generateNumberLineOrdering();
        expect(mockDiv.innerHTML).toContain("-");
    });
    it("passes difficulty to getMaxForDifficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateNumberLineOrdering("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",20);
    });
    it("should set window.correctAnswer",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateNumberLineOrdering();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateNumberLineOrdering();
        expect((window as any).expectedFormat).toBe("Enter numbers separated by commas, e.g., -3, 0, 5, 7");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateNumberLineOrdering("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",20);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateNumberLineOrdering("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",20);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateNumberLineOrdering("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",20);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
describe("generateDivisibility",()=>{
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
        generateDivisibility();
        expect(mockDiv.innerHTML).toBe("");
    });
    it("generates rule type question for divisor 2",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.1).mockReturnValueOnce(0.1);
        generateDivisibility();
        expect(mockDiv.innerHTML).toBe("State the divisibility rule for 2.");
        expect((window as any).correctAnswer.correct).toBe("A number is divisible by 2 if its last digit is even.");
        expect((window as any).expectedFormat).toBe("Enter the rule in your own words");
    });
    it("generates rule type question for divisor 5",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
        generateDivisibility();
        expect(mockDiv.innerHTML).toBe("State the divisibility rule for 5.");
        expect((window as any).correctAnswer.correct).toBe("A number is divisible by 5 if its last digit is 0 or 5.");
    });
    it("generates identify_prime type for composite number",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.35).mockReturnValueOnce(0.5);
        generateDivisibility();
        expect(mockDiv.innerHTML).toBe("Is 52 prime or composite?");
        expect((window as any).correctAnswer.correct).toBe("composite");
        expect((window as any).expectedFormat).toBe("Enter 'prime' or 'composite'");
    });
    it("generates divisible_by type with yes answer",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.7).mockReturnValueOnce(0.1).mockReturnValueOnce(0.1).mockReturnValueOnce(0.4);
        generateDivisibility();
        expect(mockDiv.innerHTML).toContain("Is");
        expect(mockDiv.innerHTML).toContain("divisible by 2");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).expectedFormat).toBe("Enter 'yes' or 'no'");
    });
    it("passes difficulty to getMaxForDifficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",100);
    });
    it("should set window.correctAnswer",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateDivisibility();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateDivisibility();
        expect((window as any).expectedFormat).toBeDefined();
        expect(typeof (window as any).expectedFormat).toBe("string");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",100);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",100);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",100);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
describe("generateDivisibility - edge cases",()=>{
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
    it("should produce non-empty question HTML",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility();
        expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
    });
    it("should set correctAnswer with display property",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateDivisibility();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect(typeof (window as any).correctAnswer.display).toBe("string");
    });
    it("should handle divisibility by 2",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0);
        generateDivisibility();
        expect(mockDiv.innerHTML).toContain("divisibility rule for 2");
        expect((window as any).correctAnswer.correct).toBe("A number is divisible by 2 if its last digit is even.");
    });
    it("should handle divisibility by 3",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.2);
        generateDivisibility();
        expect(mockDiv.innerHTML).toContain("divisibility rule for 3");
        expect((window as any).correctAnswer.correct).toBe("A number is divisible by 3 if the sum of its digits is divisible by 3.");
    });
    it("should handle divisibility by 5",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.4);
        generateDivisibility();
        expect(mockDiv.innerHTML).toContain("divisibility rule for 5");
        expect((window as any).correctAnswer.correct).toBe("A number is divisible by 5 if its last digit is 0 or 5.");
    });
    it("should handle prime numbers",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.35).mockReturnValueOnce(0.05);
        generateDivisibility();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBe("prime");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",100);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateDivisibility("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",100);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
describe("generateGCFLCM",()=>{
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
        generateGCFLCM();
        expect(mockDiv.innerHTML).toBe("");
    });
    it("generates GCF type question",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateGCFLCM();
        expect(mockDiv.innerHTML).toContain("Find the greatest common factor (GCF) of");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).expectedFormat).toBe("Enter a number");
    });
    it("generates LCM type question",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.35).mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateGCFLCM();
        expect(mockDiv.innerHTML).toContain("Find the least common multiple (LCM) of");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).expectedFormat).toBe("Enter a number");
    });
    it("generates word problem type question",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.7).mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
        generateGCFLCM();
        expect(mockDiv.innerHTML).toContain("largest number that divides both");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).expectedFormat).toBe("Enter a number");
    });
    it("passes difficulty to getMaxForDifficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateGCFLCM("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",30);
    });
    it("should set window.correctAnswer",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateGCFLCM();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer.correct).toBeDefined();
        expect((window as any).correctAnswer.alternate).toBeDefined();
        expect((window as any).correctAnswer.display).toBeDefined();
        expect((window as any).correctAnswer.choices).toBeDefined();
    });
    it("should set window.expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValue(0);
        generateGCFLCM();
        expect((window as any).expectedFormat).toBe("Enter a number");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateGCFLCM("easy");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",30);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateGCFLCM("medium");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",30);
        expect((window as any).correctAnswer).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValue(0.5);
        generateGCFLCM("hard");
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",30);
        expect((window as any).correctAnswer).toBeDefined();
    });
});
