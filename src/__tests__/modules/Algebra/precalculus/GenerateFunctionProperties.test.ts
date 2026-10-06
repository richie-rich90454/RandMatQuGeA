/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateFunctionProperties} from "../../../../modules/Algebra/precalculus/GenerateFunctionProperties";
import {seededRng} from "../../../../main/core/Rng";
describe("generateFunctionProperties", ()=>{
    it("generates continuity question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2);
        const dto=generateFunctionProperties("medium", rng);
        expect(dto.latex).toContain("discontinuous");
        expect(dto.correct).toBe("x = 1");
        expect(dto.display).toBe("x = 1");
        expect(dto.expectedFormat).toBe("Enter x value, interval, or 'none'");
    });
    it("generates extrema question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.25)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2);
        const dto=generateFunctionProperties("medium", rng);
        expect(dto.latex).toContain("minimum or maximum");
        expect(dto.correct).toBe("min");
        expect(dto.alternate).toBe("minimum");
        expect(dto.expectedFormat).toBe("Enter 'min' or 'max'");
    });
    it("generates symmetry question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.0);
        const dto=generateFunctionProperties("medium", rng);
        expect(dto.latex).toContain("even, odd, or neither");
        expect(dto.correct).toBe("even");
        expect(dto.expectedFormat).toBe("Enter 'even', 'odd', 'neither', or 'both'");
    });
    it("generates asymptotes question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.75)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2);
        const dto=generateFunctionProperties("medium", rng);
        expect(dto.latex).toContain("vertical asymptote");
        expect(dto.correct).toBe("x=1");
        expect(dto.expectedFormat).toBe("Enter x = number");
    });
    it("generates endbehavior question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.85)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.6);
        const dto=generateFunctionProperties("medium", rng);
        expect(dto.latex).toContain("end behavior");
        expect(dto.correct).toBe("both ends up");
        expect(dto.expectedFormat).toBe("Enter description like 'both ends up'");
    });
    it("should handle easy difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2);
        const dto=generateFunctionProperties("easy", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle medium difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2);
        const dto=generateFunctionProperties("medium", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle hard difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.2);
        const dto=generateFunctionProperties("hard", rng);
        expect(dto.latex).not.toBe("");
    });
    it("returns deterministic output for same seed", ()=>{
        const dto1=generateFunctionProperties("medium", seededRng(42));
        const dto2=generateFunctionProperties("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("offers a fourth parity word rather than shipping only even, odd and neither", ()=>{
        let seen=0;
        for(let difficulty of ["easy","medium","hard"]){
            for(let seed=1; seed<=60; seed++){
                const dto=generateFunctionProperties(difficulty, seededRng(seed));
                expect(dto.choices).toHaveLength(4);
                expect(new Set(dto.choices).size).toBe(4);
                expect(dto.choices).toContain(dto.correct);
                if (dto.latex.indexOf("even, odd, or neither")===-1) continue;
                seen++;
                expect(dto.choices).toContain("both");
            }
        }
        expect(seen).toBeGreaterThan(0);
    });
});
