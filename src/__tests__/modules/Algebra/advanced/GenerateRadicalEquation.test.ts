/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generateRadicalEquation} from "../../../../modules/Algebra/advanced/GenerateRadicalEquation";
import {seededRng} from "../../../../main/core/Rng";
describe("generateRadicalEquation",()=>{
    it("returns a QuestionDto with required fields",()=>{
        const dto=generateRadicalEquation("medium", seededRng(42));
        expect(dto).toHaveProperty("latex");
        expect(dto).toHaveProperty("correct");
        expect(dto).toHaveProperty("alternate");
        expect(typeof dto.latex).toBe("string");
        expect(dto.latex.length).toBeGreaterThan(0);
        expect(typeof dto.correct).toBe("string");
        expect(dto.correct.length).toBeGreaterThan(0);
    });
    it("returns expectedFormat string",()=>{
        const dto=generateRadicalEquation("medium", seededRng(42));
        expect(dto.expectedFormat).toBeDefined();
        expect(typeof dto.expectedFormat).toBe("string");
    });
    it("returns choices array",()=>{
        const dto=generateRadicalEquation("medium", seededRng(42));
        expect(Array.isArray(dto.choices)).toBe(true);
        expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
    });
    it("should handle easy difficulty",()=>{
        const dto=generateRadicalEquation("easy", seededRng(42));
        expect(dto.correct).toBeDefined();
    });
    it("should handle medium difficulty",()=>{
        const dto=generateRadicalEquation("medium", seededRng(42));
        expect(dto.correct).toBeDefined();
    });
    it("should handle hard difficulty",()=>{
        const dto=generateRadicalEquation("hard", seededRng(42));
        expect(dto.correct).toBeDefined();
    });
    it("returns deterministic output for same seed",()=>{
        const dto1=generateRadicalEquation("medium", seededRng(42));
        const dto2=generateRadicalEquation("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("produces different output for different seeds",()=>{
        const dto1=generateRadicalEquation("medium", seededRng(42));
        const dto2=generateRadicalEquation("medium", seededRng(99));
        expect(dto1).not.toEqual(dto2);
    });
    it("offers four options for every radical branch, where squaring without subtracting the shift left three",()=>{
        for(let difficulty of ["easy","medium","hard"]){
            for(let seed=1; seed<=60; seed++){
                const dto=generateRadicalEquation(difficulty, seededRng(seed));
                expect(dto.choices).toHaveLength(4);
                expect(new Set(dto.choices).size).toBe(4);
                expect(dto.choices).toContain(dto.correct);
            }
        }
    });
    it("never offers the unsolved intermediate value as a distractor when it equals the answer",()=>{
        for(let seed=1; seed<=60; seed++){
            const dto=generateRadicalEquation("easy", seededRng(seed));
            if (dto.latex.indexOf("sqrt{x}")===-1) continue;
            const printed=dto.latex.match(/x \+ (\d+)/);
            const rhs=dto.latex.match(/= (\d+)/);
            if (!printed||!rhs) continue;
            const a=Number(printed[1]);
            const b=Number(rhs[1]);
            const intermediate=(a-b*b)/(2*b);
            if (Number(intermediate.toFixed(2))!==Number(dto.correct)) continue;
            expect((dto.choices??[]).filter(o=>Number(o)===Number(dto.correct))).toHaveLength(1);
        }
    });
});
