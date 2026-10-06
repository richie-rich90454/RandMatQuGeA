/** @vitest-environment jsdom */
import {describe, it, expect} from "vitest";
import {generateVector} from "../../modules/LinearAlgebra/LinearAlgebraVector.js";
import {seededRng} from "../../main/core/Rng";

/**
 * Proves that the magnitude a question is graded with is the magnitude of the
 * vector the prompt actually prints, by recomputing from the printed numbers.
 */
describe("vector prompts are answerable as printed", ()=>{
    it("grades the magnitude of the printed pair",()=>{
        for(let seed=1; seed<=200; seed++){
            const rng=seededRng(seed);
            for(let i=0; i<20; i++){
                const dto=generateVector("medium", rng);
                // Only the magnitude question has a scalar key and exactly one
                // printed pair, so the other branches are not comparable here.
                if(!dto.latex.startsWith("Find the magnitude")) continue;
                const m=dto.latex.match(/\\langle (-?[\d.]+), (-?[\d.]+) \\rangle/);
                if(!m) continue;
                const printed=Math.sqrt(Number(m[1])**2+Number(m[2])**2);
                expect(Number(dto.correct)).toBeCloseTo(printed, 2);
            }
        }
    });
});
