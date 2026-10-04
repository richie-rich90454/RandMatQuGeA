/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateBasicFunctions} from "../../../../modules/Algebra/precalculus/GenerateBasicFunctions";
import {seededRng} from "../../../../main/core/Rng";
describe("generateBasicFunctions", ()=>{
    it("generates identify question type correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.0);
        const dto=generateBasicFunctions("medium", rng);
        expect(dto.latex).toBe("Identify the function: \\( f(x)=x \\). (Enter name)");
        expect(dto.correct).toBe("identity");
        expect(dto.alternate).toBe("identity");
        expect(dto.display).toBe("identity");
        expect(dto.expectedFormat).toBe("Enter the function name");
        expect(dto.choices).toContain("identity");
    });
    it("generates properties question type correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.5);
        const dto=generateBasicFunctions("medium", rng);
        expect(dto.latex).toContain("Give one key property");
        expect(dto.correct).toBe("linear, odd, increasing");
        expect(dto.alternate).toBe("linear, odd, increasing");
        expect(dto.display).toBe("linear, odd, increasing");
        expect(dto.expectedFormat).toBe("Enter a property (e.g., 'even', 'increasing')");
    });
    it("generates different function correctly", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.2)
            .mockReturnValueOnce(0.0);
        const dto=generateBasicFunctions("medium", rng);
        expect(dto.correct).toBe("squaring");
        expect(dto.display).toBe("squaring");
    });
    it("should handle easy difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.0);
        const dto=generateBasicFunctions("easy", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle medium difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.0);
        const dto=generateBasicFunctions("medium", rng);
        expect(dto.latex).not.toBe("");
    });
    it("should handle hard difficulty", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.0);
        const dto=generateBasicFunctions("hard", rng);
        expect(dto.latex).not.toBe("");
    });
    it("prints the square root with sqrt rather than a bare radical", ()=>{
        const rng=vi.fn()
            .mockReturnValueOnce(0.55)
            .mockReturnValueOnce(0.0);
        const dto=generateBasicFunctions("medium", rng);
        expect(dto.correct).toBe("square root");
        expect(dto.latex).toBe("Identify the function: \\( f(x)=\\sqrt{x} \\). (Enter name)");
    });
    it("varies the pool and question type by difficulty", ()=>{
        // Easy draws from familiar shapes and only asks for names.
        for(let seed of [1,2,3,4,5,6]){
            let dto=generateBasicFunctions("easy", seededRng(seed));
            expect(dto.latex).toContain("Identify the function");
        }
        // Hard reaches the full pool: over many seeds every family appears.
        let seen=new Set<string>();
        for(let seed of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]){
            seen.add(generateBasicFunctions("hard", seededRng(seed)).correct);
        }
        expect(seen.size).toBeGreaterThan(6);
    });
    it("returns deterministic output for same seed", ()=>{
        const dto1=generateBasicFunctions("medium", seededRng(42));
        const dto2=generateBasicFunctions("medium", seededRng(42));
        expect(dto1).toEqual(dto2);
    });
});
