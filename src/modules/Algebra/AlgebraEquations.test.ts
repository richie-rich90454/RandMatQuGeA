/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
import*as eq from"./algebraEquations.js";
import{getMaxForDifficulty}from"./algebraUtils.js";
import{seededRng}from"../../main/core/rng";
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
    it("should return a QuestionDto with required fields",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=eq.generateLinearEquation(undefined, rng);
        expect(dto).toBeDefined();
        expect(typeof dto.latex).toBe("string");
        expect(dto.latex.length).toBeGreaterThan(0);
        expect(typeof dto.correct).toBe("string");
        expect(typeof dto.alternate).toBe("string");
        expect(typeof dto.display).toBe("string");
        expect(Array.isArray(dto.choices)).toBe(true);
    });
    it("should return a QuestionDto with expectedFormat",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=eq.generateLinearEquation(undefined, rng);
        expect(typeof dto.expectedFormat).toBe("string");
        expect(dto.expectedFormat!.length).toBeGreaterThan(0);
    });
    it("should handle easy difficulty",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=eq.generateLinearEquation("easy", rng);
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",10);
        expect(typeof dto.correct).toBe("string");
    });
    it("should handle medium difficulty",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=eq.generateLinearEquation("medium", rng);
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",10);
        expect(typeof dto.correct).toBe("string");
    });
    it("should handle hard difficulty",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=eq.generateLinearEquation("hard", rng);
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",10);
        expect(typeof dto.correct).toBe("string");
    });
    it("returns deterministic output for same seed",()=>{
        const dto1=eq.generateLinearEquation("medium", seededRng(42));
        const dto2=eq.generateLinearEquation("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
});
describe("generateQuadraticEquation - no duplicate choices",()=>{
    it("factor case should not have duplicate choices identical to correct answer",()=>{
        const rng=vi.fn()
            .mockReturnValue(0.5)
            .mockReturnValueOnce(0.01)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.5);
        const dto=eq.generateQuadraticEquation(undefined, rng);
        expect(dto).toBeDefined();
        const correct=dto.correct;
        const choices=dto.choices as string[];
        const correctCount=choices.filter(c=>c===correct).length;
        expect(correctCount).toBe(1);
        const uniqueChoices=new Set(choices);
        expect(uniqueChoices.size).toBe(choices.length);
    });
    it("complete_square case should not have duplicate choices identical to correct answer",()=>{
        const rng=vi.fn()
            .mockReturnValue(0.5)
            .mockReturnValueOnce(0.26)
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.3);
        const dto=eq.generateQuadraticEquation(undefined, rng);
        expect(dto).toBeDefined();
        const correct=dto.correct;
        const choices=dto.choices as string[];
        const correctCount=choices.filter(c=>c===correct).length;
        expect(correctCount).toBe(1);
        const uniqueChoices=new Set(choices);
        expect(uniqueChoices.size).toBe(choices.length);
    });
    it("all generator outputs should have unique choices",()=>{
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
                const dto=gen(undefined, seededRng(1000+i));
                if(dto&&dto.choices){
                    const uniqueChoices=new Set(dto.choices);
                    expect(uniqueChoices.size).toBe(dto.choices.length);
                }
            }
        }
    });
});
describe("all generators return deterministic DTOs",()=>{
    it("generateQuadraticEquation deterministic seed",()=>{
        const dto1=eq.generateQuadraticEquation("medium", seededRng(42));
        const dto2=eq.generateQuadraticEquation("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateLinearInequality deterministic seed",()=>{
        const dto1=eq.generateLinearInequality("medium", seededRng(42));
        const dto2=eq.generateLinearInequality("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateQuadraticInequality deterministic seed",()=>{
        const dto1=eq.generateQuadraticInequality("medium", seededRng(42));
        const dto2=eq.generateQuadraticInequality("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateRationalInequality deterministic seed",()=>{
        const dto1=eq.generateRationalInequality("medium", seededRng(42));
        const dto2=eq.generateRationalInequality("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateSystem2x2 deterministic seed",()=>{
        const dto1=eq.generateSystem2x2("medium", seededRng(42));
        const dto2=eq.generateSystem2x2("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateSystem3x3 deterministic seed",()=>{
        const dto1=eq.generateSystem3x3("medium", seededRng(42));
        const dto2=eq.generateSystem3x3("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
});