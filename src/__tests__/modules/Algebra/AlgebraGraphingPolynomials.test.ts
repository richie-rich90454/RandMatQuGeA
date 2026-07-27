/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
import*as gp from"./AlgebraGraphingPolynomials.js";
import{getMaxForDifficulty}from"./AlgebraUtils.js";
import{seededRng}from"../../main/core/Rng";
vi.mock("../../../modules/Algebra/AlgebraUtils.js",()=>({
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
    it("should return a QuestionDto with required fields",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=gp.generatePolynomial(undefined, rng);
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
        const dto=gp.generatePolynomial(undefined, rng);
        expect(typeof dto.expectedFormat).toBe("string");
        expect(dto.expectedFormat!.length).toBeGreaterThan(0);
    });
    it("should handle easy difficulty",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=gp.generatePolynomial("easy", rng);
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",5);
        expect(typeof dto.correct).toBe("string");
    });
    it("should handle medium difficulty",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=gp.generatePolynomial("medium", rng);
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",5);
        expect(typeof dto.correct).toBe("string");
    });
    it("should handle hard difficulty",()=>{
        const rng=vi.fn().mockReturnValue(0.5);
        const dto=gp.generatePolynomial("hard", rng);
        expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",5);
        expect(typeof dto.correct).toBe("string");
    });
    it("returns deterministic output for same seed",()=>{
        const dto1=gp.generatePolynomial("medium", seededRng(42));
        const dto2=gp.generatePolynomial("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
});
describe("all generators return deterministic DTOs",()=>{
    it("generatePolynomialDivision deterministic seed",()=>{
        const dto1=gp.generatePolynomialDivision("medium", seededRng(42));
        const dto2=gp.generatePolynomialDivision("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateFactoring deterministic seed",()=>{
        const dto1=gp.generateFactoring("medium", seededRng(42));
        const dto2=gp.generateFactoring("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateFunctionConcepts deterministic seed",()=>{
        const dto1=gp.generateFunctionConcepts("medium", seededRng(42));
        const dto2=gp.generateFunctionConcepts("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateLinearGraphing deterministic seed",()=>{
        const dto1=gp.generateLinearGraphing("medium", seededRng(42));
        const dto2=gp.generateLinearGraphing("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("generateNonLinearGraphing deterministic seed",()=>{
        const dto1=gp.generateNonLinearGraphing("medium", seededRng(42));
        const dto2=gp.generateNonLinearGraphing("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
});
describe("all generator outputs have unique choices",()=>{
    it("no duplicate choices across generators and seeds",()=>{
        const generators=[
            gp.generatePolynomial,
            gp.generatePolynomialDivision,
            gp.generateFactoring,
            gp.generateFunctionConcepts,
            gp.generateLinearGraphing,
            gp.generateNonLinearGraphing
        ];
        for(const gen of generators){
            for(let i=0;i<5;i++){
                const dto=gen(undefined, seededRng(2000+i));
                if(dto&&dto.choices){
                    const uniqueChoices=new Set(dto.choices);
                    expect(uniqueChoices.size).toBe(dto.choices.length);
                }
            }
        }
    });
});