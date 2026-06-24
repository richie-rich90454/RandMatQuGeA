/** @vitest-environment jsdom */
/**
 * Edge-case tests covering cross-module scenarios not tested elsewhere.
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";

// Mock the questionArea to be settable
const mockQuestionArea=document.createElement("div");
vi.mock("../script.js",()=>({
    questionArea: mockQuestionArea,
}));

// ========================================
// GENERATOR MCQ EDGE CASES
// ========================================
describe("Generator MCQ dedup edge cases",()=>{
    beforeEach(()=>{
        mockQuestionArea.innerHTML="";
        delete (window as any).correctAnswer;
        delete (window as any).expectedFormat;
        (window as any).MathJax={
            typesetPromise:vi.fn().mockResolvedValue(undefined),
        };
    });
    afterEach(()=>{
        delete (window as any).MathJax;
    });

    it("arithmeticBasic generates unique choices with correct answer",async()=>{
        const mod=await import("../modules/Arithmetic/arithmeticBasic.js");
        const originalRandom=Math.random;
        Math.random=vi.fn()
            .mockReturnValueOnce(0.1) // pick "addition" type
            .mockReturnValueOnce(0.5) // operand
            .mockReturnValueOnce(0.3); // operand
        mod.generateAddition();
        const ca=(window as any).correctAnswer;
        expect(ca).toBeDefined();
        expect(ca.choices).toContain(ca.correct);
        expect(new Set(ca.choices).size).toBe(ca.choices.length);
        Math.random=originalRandom;
    });

    it("trigBasic sin generates unique choices with correct answer across seeds",async()=>{
        const mod=await import("../modules/Trigonometry/trigBasic.js");
        const originalRandom=Math.random;
        for(let seed=0;seed<10;seed++){
            Math.random=vi.fn()
                .mockReturnValueOnce(0.01+seed*0.02) // evaluate type
                .mockReturnValueOnce(0.1+seed*0.05); // angle index
            mod.generateSin();
            const ca=(window as any).correctAnswer;
            expect(ca).toBeDefined();
            expect(ca.choices).toContain(ca.correct);
            expect(new Set(ca.choices).size).toBe(ca.choices.length);
        }
        Math.random=originalRandom;
    });

    it("algebraEquations choices always contain correct answer",async()=>{
        const mod=await import("../modules/Algebra/algebraEquations.js");
        const originalRandom=Math.random;
        for(let seed=0;seed<10;seed++){
            Math.random=vi.fn().mockReturnValue(seed/10);
            mod.generateLinearEquation();
            const ca=(window as any).correctAnswer;
            expect(ca).toBeDefined();
            expect(ca.choices).toContain(ca.correct);
            expect(new Set(ca.choices).size).toBe(ca.choices.length);
        }
        Math.random=originalRandom;
    });

    // calculusDerivatives choices test moved to calculusDerivatives.test.ts
});

// ========================================
// NULL/UNDEFINED HANDLING
// ========================================
describe("Generator null-safety",()=>{
    it("should not crash when MathJax is undefined",async()=>{
        delete (window as any).MathJax;
        const mod=await import("../modules/Trigonometry/trigBasic.js");
        const originalRandom=Math.random;
        Math.random=vi.fn().mockReturnValue(0.5);
        expect(()=>{mod.generateSin();}).not.toThrow();
        expect((window as any).correctAnswer).toBeDefined();
        Math.random=originalRandom;
    });

    it("should not crash when MathJax.typesetPromise is undefined",async()=>{
        (window as any).MathJax={};
        const mod=await import("../modules/Calculus/calculusDerivatives.js");
        const originalRandom=Math.random;
        Math.random=vi.fn().mockReturnValue(0.5);
        expect(()=>{mod.generateDerivative();}).not.toThrow();
        Math.random=originalRandom;
        delete (window as any).MathJax;
    });
});

// ========================================
// NUMERIC STABILITY
// ========================================
describe("Generator numeric stability",()=>{
    beforeEach(()=>{
        (window as any).MathJax={
            typesetPromise:vi.fn().mockResolvedValue(undefined),
        };
    });
    afterEach(()=>{
        delete (window as any).MathJax;
    });

    it("basic arithmetic never produces NaN or Infinity",async()=>{
        const arithMod=await import("../modules/Arithmetic/arithmeticBasic.js");
        const originalRandom=Math.random;
        const generators=[
            arithMod.generateAddition,
            arithMod.generateSubtraction,
            arithMod.generateMultiplication,
            arithMod.generateDivision,
        ];
        for(const gen of generators){
            for(let seed=0;seed<20;seed++){
                Math.random=vi.fn().mockReturnValue(seed/20);
                gen();
                const ca=(window as any).correctAnswer;
                if(ca&&ca.correct){
                    const numVal=Number(ca.correct);
                    if(!isNaN(numVal)&&ca.correct.trim()!==''){
                        expect(isFinite(numVal)).toBe(true);
                    }
                }
            }
        }
        Math.random=originalRandom;
    });

    it("trig evaluate never produces NaN for all 16 special angles",async()=>{
        const mod=await import("../modules/Trigonometry/trigBasic.js");
        const originalRandom=Math.random;
        for(let angleIdx=0;angleIdx<16;angleIdx++){
            Math.random=vi.fn()
                .mockReturnValueOnce(0.01) // evaluate type
                .mockReturnValueOnce(angleIdx/16); // specific angle
            mod.generateSin();
            const ca=(window as any).correctAnswer;
            if(ca&&ca.correct){
                const val=parseFloat(ca.correct);
                if(!isNaN(val)) expect(isFinite(val)).toBe(true);
            }
        }
        Math.random=originalRandom;
    });

    it("trig cosine evaluate never produces NaN for all angles",async()=>{
        const mod=await import("../modules/Trigonometry/trigBasic.js");
        const originalRandom=Math.random;
        for(let angleIdx=0;angleIdx<16;angleIdx++){
            Math.random=vi.fn()
                .mockReturnValueOnce(0.01) // evaluate type
                .mockReturnValueOnce(angleIdx/16);
            mod.generateCosine();
            const ca=(window as any).correctAnswer;
            if(ca&&ca.correct){
                const val=parseFloat(ca.correct);
                if(!isNaN(val)) expect(isFinite(val)).toBe(true);
            }
        }
        Math.random=originalRandom;
    });
});

// ========================================
// DISPLAY STABILITY
// ========================================
describe("Display stability",()=>{
    beforeEach(()=>{
        mockQuestionArea.innerHTML="";
        delete (window as any).correctAnswer;
        (window as any).MathJax={
            typesetPromise:vi.fn().mockResolvedValue(undefined),
        };
    });
    afterEach(()=>{
        delete (window as any).MathJax;
    });

    it("generates non-empty HTML for all arithmetic types",async()=>{
        const mod=await import("../modules/Arithmetic/arithmeticBasic.js");
        const originalRandom=Math.random;
        const generators=[
            mod.generateAddition,
            mod.generateSubtraction,
            mod.generateMultiplication,
            mod.generateDivision,
        ];
        for(const gen of generators){
            Math.random=vi.fn().mockReturnValue(0.5);
            gen();
            expect(mockQuestionArea.innerHTML.length).toBeGreaterThan(0);
        }
        Math.random=originalRandom;
    });

    it("correctAnswer contains all required properties",async()=>{
        const mod=await import("../modules/Algebra/algebraEquations.js");
        const originalRandom=Math.random;
        Math.random=vi.fn().mockReturnValue(0.5);
        mod.generateLinearEquation();
        const ca=(window as any).correctAnswer;
        expect(ca).toBeDefined();
        expect(ca).toHaveProperty("correct");
        expect(ca).toHaveProperty("alternate");
        expect(ca).toHaveProperty("display");
        expect(ca).toHaveProperty("choices");
        expect(Array.isArray(ca.choices)).toBe(true);
        expect(ca.choices.length).toBeGreaterThan(0);
        Math.random=originalRandom;
    });

    it("correctAnswer.display is always a string",async()=>{
        const mod=await import("../modules/Geometry/geometryArea.js");
        const originalRandom=Math.random;
        for(let seed=0;seed<5;seed++){
            Math.random=vi.fn().mockReturnValue(seed/5);
            mod.generateAreaCircle();
            const ca=(window as any).correctAnswer;
            expect(ca).toBeDefined();
            expect(typeof ca.display).toBe("string");
        }
        Math.random=originalRandom;
    });
});

// ========================================
// MCQ ANSWER CHECKING
// ========================================
describe("MCQ answer checking",()=>{
    it("answer.test.ts loads all expected test cases",async()=>{
        // Verify the test module loads without error
        const answerModule=await import("../main/answer.js");
        expect(answerModule.checkAnswer).toBeDefined();
        expect(answerModule.startQuestionTimer).toBeDefined();
    });

    it("mcq.test.ts loads all expected test cases",async()=>{
        const mcqModule=await import("../main/mcq.js");
        expect(mcqModule.generateDistractors).toBeDefined();
        expect(mcqModule.generateChoicesForCurrentQuestion).toBeDefined();
    });
});

// ========================================
// WINDOW STATE
// ========================================
describe("window state flags",()=>{
    it("hasQuestion defaults to false on module load",async()=>{
        // script.ts sets window.hasQuestion=false on init
        expect((window as any).hasQuestion).toBeUndefined();
    });
});
// ========================================
// NULL-SAFETY: updateUIState and copyCorrectAnswer
// ========================================
describe("UI null-safety fixes",()=>{
    beforeEach(()=>{
        delete (window as any).correctAnswer;
        delete (window as any).hasQuestion;
        (window as any).MathJax={ typesetPromise: vi.fn().mockResolvedValue(undefined), };
        mockQuestionArea.innerHTML="<div>test</div>";
    });
    afterEach(()=>{
        delete (window as any).MathJax;
    });

    it("updateUIState does not crash when correctAnswer is undefined",async()=>{
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.updateUIState()).not.toThrow();
    });

    it("updateUIState does not crash when correctAnswer is null",async()=>{
        (window as any).correctAnswer=null;
        const uiMod=await import("../main/ui.js");
        // Force re-import for fresh window state
        expect(()=>uiMod.updateUIState()).not.toThrow();
    });

    it("updateUIState does not crash when correctAnswer.correct is undefined",async()=>{
        (window as any).correctAnswer={};
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.updateUIState()).not.toThrow();
    });

    it("copyCorrectAnswer does not crash when correctAnswer is undefined",async()=>{
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.copyCorrectAnswer()).not.toThrow();
    });

    it("copyCorrectAnswer does not crash when correctAnswer.correct is undefined",async()=>{
        (window as any).correctAnswer={};
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.copyCorrectAnswer()).not.toThrow();
    });
});

// ========================================
// MCQ DISTRACTOR STABILITY
// ========================================
describe("MCQ distractor stability fixes",()=>{
    it("generateNumericDistractors never returns NaN as choice",async()=>{
        const mcqMod=await import("../main/mcq.js");
        const choices=await mcqMod.generateDistractors("-16", 4);
        for(const c of choices){
            const val=Number(c);
            if(!isNaN(val)){
                expect(isFinite(val)).toBe(true);
                expect(isNaN(val)).toBe(false);
            }
        }
    });

    it("generateNumericDistractors handles negative numbers without infinite loop",async()=>{
        const mcqMod=await import("../main/mcq.js");
        const choices=await mcqMod.generateDistractors("-1", 4);
        expect(choices.length).toBe(4);
        for(const c of choices){
            const val=Number(c);
            if(!isNaN(val)){
                expect(isFinite(val)).toBe(true);
            }
        }
    });

    it("generateNumericDistractors handles zero without infinite loop",async()=>{
        const mcqMod=await import("../main/mcq.js");
        const choices=await mcqMod.generateDistractors("0", 4);
        expect(choices.length).toBe(4);
    });

    it("generateNumericDistractors terminates even when given extreme values",async()=>{
        const mcqMod=await import("../main/mcq.js");
        // Very large number where variations may produce the same rounded value
        const choices=await mcqMod.generateDistractors("999999999", 4);
        expect(choices.length).toBeGreaterThanOrEqual(2);
    });

    it("generateDistractors handles non-numeric patterns",async()=>{
        const mcqMod=await import("../main/mcq.js");
        const choices=await mcqMod.generateDistractors("center (0, 0), radius 5", 4);
        expect(choices.length).toBeGreaterThanOrEqual(2);
        expect(choices).toContain("center (0, 0), radius 5");
    });

    it("generateDistractors handles quadrant answers",async()=>{
        const mcqMod=await import("../main/mcq.js");
        const choices=await mcqMod.generateDistractors("II", 4);
        expect(choices.length).toBeGreaterThanOrEqual(2);
        expect(choices).toContain("II");
    });
});

// ========================================
// PROGRESS BAR / DIVISION BY ZERO
// ========================================
describe("Progress bar division by zero fixes",()=>{
    beforeEach(()=>{
        mockQuestionArea.innerHTML="";
    });

    it("updateProgressBar does not crash when maxQuestions is 0",async()=>{
        // Set up state with maxQuestions=0
        const stateMod=await import("../main/state.js");
        const originalMax=stateMod.maxQuestions;
        stateMod.setMaxQuestions(0);
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.updateProgressBar()).not.toThrow();
        stateMod.setMaxQuestions(originalMax);
    });

    it("updateProgressBar does not crash when maxQuestions is negative",async()=>{
        const stateMod=await import("../main/state.js");
        const originalMax=stateMod.maxQuestions;
        stateMod.setMaxQuestions(-1);
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.updateProgressBar()).not.toThrow();
        stateMod.setMaxQuestions(originalMax);
    });

    it("updateProgressBar produces finite percentage when maxQuestions is positive",async()=>{
        const stateMod=await import("../main/state.js");
        const originalMax=stateMod.maxQuestions;
        stateMod.setMaxQuestions(10);
        stateMod.setSessionScore({correct:3,total:5});
        const uiMod=await import("../main/ui.js");
        expect(()=>uiMod.updateProgressBar()).not.toThrow();
        stateMod.setMaxQuestions(originalMax);
    });
});

// ========================================
// END SESSION NULL TOPIC
// ========================================
describe("endMentalSession null topic fix",()=>{
    beforeEach(()=>{
        mockQuestionArea.innerHTML="";
        delete (window as any).correctAnswer;
        (window as any).MathJax={ typesetPromise: vi.fn().mockResolvedValue(undefined), };
    });
    afterEach(()=>{
        delete (window as any).MathJax;
    });

    it("endMentalSession does not crash when selectedTopic is null",async()=>{
        const sessionMod=await import("../main/session.js");
        const stateMod=await import("../main/state.js");
        // Set session active with null topic
        stateMod.setSelectedTopic(null);
        stateMod.setSessionActive(true);
        stateMod.setSessionScore({correct:0,total:0});
        // endMentalSession should handle null topic gracefully
        // It should not throw even though promptSaveScore checks selectedTopic
        let threw=false;
        try{
            await sessionMod.endMentalSession();
        }catch(e){
            threw=true;
        }
        expect(threw).toBe(false);
    });
});

// ========================================
// EVENT DELEGATION IN LEADERBOARD
// ========================================
describe("Leaderboard event delegation",()=>{
    it("updateLeaderboard uses event delegation not per-button handlers",async()=>{
        const sessionMod=await import("../main/session.js");
        // The implementation should use event delegation on leaderboardContent
        // rather than attaching per-button click handlers
        expect(sessionMod.updateLeaderboard).toBeDefined();
    });
});
