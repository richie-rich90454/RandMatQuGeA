/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateRealNumberOperations} from "../../../../modules/Algebra/precalculus/GenerateRealNumberOperations";
import {seededRng} from "../../../../main/core/Rng";
describe("generateRealNumberOperations", ()=>{
    it("generates absolute value question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.3);
        const dto=generateRealNumberOperations("medium", rng);
        expect(dto.latex).toBe("Evaluate: \\( |-4| \\)");
        expect(dto.correct).toBe("4");
        expect(dto.alternate).toBe("4");
        expect(dto.display).toBe("4");
        expect(dto.expectedFormat).toBe("Enter a number");
        expect(dto.choices).toContain("4");
    });
    it("generates distance question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.25)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6);
        const dto=generateRealNumberOperations("medium", rng);
        expect(dto.latex).toBe("Find the distance between \\( 3 \\) and \\( 6 \\) on the number line.");
        expect(dto.correct).toBe("3");
        expect(dto.alternate).toBe("3");
        expect(dto.display).toBe("3");
        expect(dto.expectedFormat).toBe("Enter a number");
        expect(dto.choices).toContain("3");
    });
    it("generates order question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6);
        const dto=generateRealNumberOperations("medium", rng);
        expect(dto.latex).toBe("Which of the following is true for \\( 3 \\) and \\( 6 \\)?");
        expect(dto.correct).toBe("3 < 6");
        expect(dto.alternate).toBe("3 < 6");
        expect(dto.display).toBe("3 < 6");
        expect(dto.expectedFormat).toBe("Enter the true relation");
        expect(dto.choices).toContain("3 < 6");
    });
    it("generates interval question correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.75)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.0);
        const dto=generateRealNumberOperations("medium", rng);
        expect(dto.latex).toBe("Write the interval \\( (4, 12) \\) in set-builder notation.");
        expect(dto.correct).toBe("all x such that 4 < x < 12");
        expect(dto.alternate).toBe("all x such that 4 < x < 12");
        expect(dto.display).toBe("all x such that 4 < x < 12");
        expect(dto.expectedFormat).toBe("Enter a description like 'x > 3' or interval");
        expect(dto.choices).toContain("all x such that 4 < x < 12");
    });
    it("should handle easy difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.3);
        const dto=generateRealNumberOperations("easy", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle medium difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.3);
        const dto=generateRealNumberOperations("medium", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle hard difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.3);
        const dto=generateRealNumberOperations("hard", rng);
        expect(dto.latex).not.toBe("");
    });
    it("returns deterministic output for same seed", ()=>{
        const dto1=generateRealNumberOperations("medium", seededRng(42));
        const dto2=generateRealNumberOperations("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
    it("offers four distinct options for the absolute value branch, where the signed input used to be the answer itself", ()=>{
        for(let seed=1; seed<=60; seed++){
            const dto=generateRealNumberOperations("easy", seededRng(seed));
            if (dto.latex.indexOf("Evaluate")!==0) continue;
            expect(dto.choices).toHaveLength(4);
            expect(new Set(dto.choices).size).toBe(4);
            expect(dto.choices).toContain(dto.correct);
        }
    });
    it("offers four relations for the ordering branch rather than padding a true/false answer with two non-answers", ()=>{
        let seen=0;
        for(let seed=1; seed<=60; seed++){
            const dto=generateRealNumberOperations("easy", seededRng(seed));
            if (dto.latex.indexOf("Which of the following is true")!==0) continue;
            seen++;
            expect(dto.choices).toHaveLength(4);
            expect(new Set(dto.choices).size).toBe(4);
            expect(dto.choices).toContain(dto.correct);
            for(let option of dto.choices??[]){
                expect(["maybe","cannot determine","true","false"]).not.toContain(option);
            }
        }
        expect(seen).toBeGreaterThan(0);
    });
});
