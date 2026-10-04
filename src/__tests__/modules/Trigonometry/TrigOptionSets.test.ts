/**
 * @file The option-set contract for every trigonometry topic, at a width the
 * oracle's eight seeds do not reach.
 * @description The oracle gate samples seeds 1 to 8. A trigonometry defect once
 * hid outside that window for twenty-six seeds, so these assertions sweep far
 * wider and state the same contract the gate states: exactly four options, the
 * key among them, and nothing a learner could never be shown.
 *
 * The first test is the guard that makes the rest non-vacuous: it asserts the
 * topic ids are still registered, so a generator that quietly stopped being
 * reachable cannot make this file pass by generating nothing.
 */
import {describe,it,expect} from "vitest";
import {seededRng} from "../../../main/core/Rng";
import * as Trigonometry from "../../../modules/Trigonometry/index.js";
import {topics} from "../../../main/TopicData";
import {topicRegistry} from "../../../main/services/TopicRegistry";
import "../../../modules/Trigonometry/RegisterTopics";

/** The trigonometry topic ids the app currently registers. */
const TRIG_IDS=topics.filter(t=>t.category==="Trigonometry").map(t=>t.id);

/** How many seeds each topic is swept at, per difficulty. */
const SEEDS=120;

/**
 * Runs a registered trigonometry topic across seeds and difficulties.
 *
 * @param topicId - The topic to sample.
 * @returns Every question it produced.
 */
function sample(topicId: string): {difficulty: string; choices: string[]; correct: string}[]{
    let entry=topicRegistry.getTopic(topicId);
    if (!entry) throw new Error("Topic is not registered: "+topicId);
    let mod=Trigonometry as unknown as Record<string, (difficulty?: string, rng?: ()=>number)=>{choices?: string[]; correct: string}>;
    let generate=mod[entry.fn];
    if (!generate) throw new Error("Generator function not found: "+entry.fn);
    let out: {difficulty: string; choices: string[]; correct: string}[]=[];
    for(let difficulty of ["easy","medium","hard"]){
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generate(difficulty, seededRng(seed));
            out.push({difficulty, choices:dto.choices||[], correct:dto.correct});
        }
    }
    return out;
}

describe("trigonometry option sets",()=>{
    it("registers every trigonometry topic this file sweeps, so the sweep cannot pass vacuously",()=>{
        expect(TRIG_IDS.length).toBeGreaterThanOrEqual(29);
        for(let topicId of TRIG_IDS){
            expect(topicRegistry.getTopic(topicId)).toBeDefined();
        }
    });
    it("offers exactly four options with the key among them for every trigonometry topic",()=>{
        let failures:string[]=[];
        for(let topicId of TRIG_IDS){
            for(let sample_ of sample(topicId)){
                if (sample_.choices.length!==4){
                    failures.push(topicId+"/"+sample_.difficulty+": "+sample_.choices.length+" option(s) for "+JSON.stringify(sample_.correct));
                }
                else if (!sample_.choices.some(option=>option===sample_.correct)){
                    failures.push(topicId+"/"+sample_.difficulty+": the key "+JSON.stringify(sample_.correct)+" is not among "+JSON.stringify(sample_.choices));
                }
            }
        }
        expect(failures).toEqual([]);
    });
    it("never offers a value no learner could write",()=>{
        let failures:string[]=[];
        for(let topicId of TRIG_IDS){
            for(let sample_ of sample(topicId)){
                for(let option of sample_.choices){
                    if (option.includes("Infinity")||option.includes("NaN")||option.trim()===""||option==="null"){
                        failures.push(topicId+"/"+sample_.difficulty+": "+JSON.stringify(option));
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    });
    it("never offers two options that are the same value",()=>{
        let failures:string[]=[];
        for(let topicId of TRIG_IDS){
            for(let sample_ of sample(topicId)){
                let seen=new Set<string>();
                for(let option of sample_.choices){
                    let identity=Number.isFinite(Number(option.trim()))?String(Number(option.trim())):option.trim();
                    if (seen.has(identity)){
                        failures.push(topicId+"/"+sample_.difficulty+": "+JSON.stringify(option)+" appears twice in "+JSON.stringify(sample_.choices));
                    }
                    seen.add(identity);
                }
            }
        }
        expect(failures).toEqual([]);
    });
});
