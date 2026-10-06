/** @vitest-environment jsdom */
import {describe, it, expect} from "vitest";
import{registeredTopicIds, sampleQuestion}from"./Harness";
import{seededRng}from"../../main/core/Rng";
import * as divisibility from"../../modules/DiscreteMathematics/GenerateDivisibility";
import * as gcdLcm from"../../modules/DiscreteMathematics/GenerateGcdLcm";
import * as modular from"../../modules/DiscreteMathematics/GenerateModular";
import * as dataAnalysis from"../../modules/DiscreteMathematics/GenerateDataAnalysis";

/** The newest generators, called directly so a fault in one of them is attributable. */
const NEW: [string, (d?: string, r?: any)=>any][]=[
    ["divisibility", divisibility.generateDivisibility],
    ["gcd_lcm", gcdLcm.generateGcdLcm],
    ["modular", modular.generateModular],
    ["data_analysis", dataAnalysis.generateDataAnalysis]
];

/**
 * Every generator has to return, at every difficulty, for every seed.
 *
 * This looks like it is asserting something obvious, and it is: a generator whose
 * rejection loop is unbounded does not fail an assertion, it hangs, and a hang in
 * the oracle takes the whole correctness gate with it. The per-call bound turns
 * that from a mystery into a named failure.
 */
describe("generators return",()=>{
    for (let [name, generate] of NEW){
        it(`${name} returns promptly at every difficulty and seed`,()=>{
            for(let difficulty of ["easy", "medium", "hard"]){
                for(let seed=1; seed<=8; seed++){
                    let started=Date.now();
                    let dto=generate(difficulty, seededRng(seed));
                    expect(Date.now()-started).toBeLessThan(200);
                    expect(dto.latex).toBeTruthy();
                    expect(dto.correct).toBeTruthy();
                    expect(dto.choices.length).toBeGreaterThan(0);
                }
            }
        });
    }
    it("every registered topic is reachable through the harness",async()=>{
        for(let topicId of registeredTopicIds()){
            let sample=await sampleQuestion(topicId, "medium", 1);
            expect(sample.dto.latex).toBeTruthy();
        }
    });
});
