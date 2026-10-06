/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateRationalEquation} from "../../../../modules/Algebra/precalculus/GenerateRationalEquation";
import {seededRng} from "../../../../main/core/Rng";
describe("generateRationalEquation", ()=>{
    it("generates simple rational equation correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.4)
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.0);
        const dto=generateRationalEquation("medium", rng);
        expect(dto.latex).toBe("Solve: \\( \\frac{3x + 1}{1x + 1} = 2 \\)");
        expect(dto.correct).toBe("1.00");
        expect(dto.alternate).toBe("1");
        expect(dto.display).toBe("1.00");
        expect(dto.expectedFormat).toBe("Enter decimal answer");
        expect(dto.choices).toContain("1.00");
    });
    it("generates extraneous solution question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.8);
        const dto=generateRationalEquation("medium", rng);
        expect(dto.latex).toBe("Solve and check for extraneous solutions: \\( \\frac{1}{x - 2} = \\frac{4}{x - 2} + 1 \\)");
        expect(dto.correct).toBe("-1.00");
        expect(dto.alternate).toBe("-1");
        expect(dto.display).toBe("-1.00");
        expect(dto.expectedFormat).toBe("Enter 'no solution' or the solution");
        expect(dto.choices).toContain("no solution");
    });
    it("should handle easy difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.8);
        const dto=generateRationalEquation("easy", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle medium difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.8);
        const dto=generateRationalEquation("medium", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle hard difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.8);
        const dto=generateRationalEquation("hard", rng);
        expect(dto.latex).not.toBe("");
    });
    it("returns deterministic output for same seed", ()=>{
        const dto1=generateRationalEquation("medium", seededRng(42));
        const dto2=generateRationalEquation("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("treats two spellings of one solution as one option rather than two", ()=>{
        for(let difficulty of ["easy","medium","hard"]){
            for(let seed=1; seed<=80; seed++){
                const dto=generateRationalEquation(difficulty, seededRng(seed));
                expect(dto.choices).toHaveLength(4);
                expect(new Set(dto.choices).size).toBe(4);
                expect(dto.choices).toContain(dto.correct);
                let asNumbers=(dto.choices??[]).map(o=>Number(o));
                if (asNumbers.every(o=>Number.isFinite(o))){
                    expect(new Set(asNumbers).size).toBe(4);
                }
            }
        }
    });
});
