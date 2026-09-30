/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import{registeredTopicIds, sampleQuestion}from"./Harness";
import{validateQuestionLatex}from"./Latex";
import{isWellFormed}from"./Symbolic";
import{validateMcq, MCQ_CODES}from"./Mcq";
import{buildChoiceSet}from"../../main/Mcq";
import{seededRng}from"../../main/core/Rng";
import{canonicalNumeric, sameNumericValue}from"../../main/AnswerFormat";
import type{QuestionDto}from"../../types/global";

/** The difficulties every topic is sampled at. */
const DIFFICULTIES=["easy", "medium", "hard"];

/**
 * Records a failure against the topic, difficulty and seed that produced it, so a
 * report names the exact case to reproduce rather than a topic in the abstract.
 *
 * @param failures - The accumulator.
 * @param topicId - The topic.
 * @param difficulty - The difficulty.
 * @param seed - The seed.
 * @param detail - What went wrong.
 */
function record(failures: string[], topicId: string, difficulty: string, seed: number, detail: string): void{
    failures.push(topicId+"/"+difficulty+"/seed"+seed+": "+detail);
}

/**
 * Formats a batch of findings, or returns null when there are none, so a test can
 * report them without a stack of empty diffs.
 *
 * @param findings - The findings to format.
 * @returns The formatted text, or null when there are no findings.
 */
function describeFindings(findings: { code: string; message: string }[]): string|null{
    if (findings.length===0) return null;
    return findings.map(f=>f.code+": "+f.message).join(" | ");
}

/**
 * Asserts the invariant the app must hold for every question it can present as
 * multiple choice, which is a stronger statement than the one the generators
 * themselves can make: whatever a generator supplies, the rendered option set is
 * four options with exactly one correct. This is the invariant a learner
 * experiences, so it is the one worth enforcing.
 */
describe("multiple choice option sets",()=>{
    it("builds four usable options with one correct for a numeric answer",()=>{
        for(let answer of ["3.50", "42", "0.25", "-7.125"]){
            for(let seed=1; seed<=20; seed++){
                let options=buildChoiceSet(answer, undefined, seededRng(seed));
                expect(options).toHaveLength(4);
                let correctCount=options.filter(o=>sameNumericValue(o, answer)).length;
                expect(correctCount).toBe(1);
                for(let option of options){
                    expect(option).not.toMatch(/NaN|Infinity|undefined|\?\?/);
                }
            }
        }
    });
    it("treats two spellings of the same number as one option",()=>{
        let options=buildChoiceSet("0.5", ["0.50", "0.500", "0.5", "0.25"], seededRng(3));
        expect(options).toHaveLength(4);
        expect(options.filter(o=>canonicalNumeric(o)===canonicalNumeric("0.5"))).toHaveLength(1);
    });
    it("repairs a generator set that offers only three options",()=>{
        let options=buildChoiceSet("7", ["7", "8", "9"], seededRng(5));
        expect(options).toHaveLength(4);
        expect(options.filter(o=>sameNumericValue(o, "7"))).toHaveLength(1);
    });
    it("repairs a generator set whose distractor is also correct",()=>{
        let options=buildChoiceSet("1", ["1", "1.00", "2", "3"], seededRng(7));
        expect(options).toHaveLength(4);
        expect(options.filter(o=>sameNumericValue(o, "1"))).toHaveLength(1);
    });
    it("never shows a non-finite option for any topic's real answer",async()=>{
        let failures:string[]=[];
        for(let topicId of registeredTopicIds()){
            for(let difficulty of ["easy", "medium"]){
                for(let seed=1; seed<=4; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    let correct=sample.dto.correct;
                    if (correct===""||correct==="NaN"||correct==="Infinity"){
                        record(failures, topicId, difficulty, seed, "the answer itself is unusable: "+JSON.stringify(correct));
                        continue;
                    }
                    let options=buildChoiceSet(correct, sample.dto.choices, seededRng(seed));
                    if (options.length!==4){
                        record(failures, topicId, difficulty, seed, "built "+options.length+" option(s) for "+JSON.stringify(correct));
                    }
                    for(let option of options){
                        if (/NaN|Infinity|undefined/.test(option)){
                            record(failures, topicId, difficulty, seed, "unusable option "+JSON.stringify(option)+" for "+JSON.stringify(correct));
                        }
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    }, 300000);
});

describe("generator invariants",()=>{
    it("every registered topic produces a well-formed question at every difficulty",async()=>{
        let failures:string[]=[];
        for(let topicId of registeredTopicIds()){
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=12; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    if (!isWellFormed(sample.dto)){
                        record(failures, topicId, difficulty, seed, "prompt is empty or the answer is a placeholder: "+JSON.stringify({latex:sample.dto.latex, correct:sample.dto.correct}));
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    }, 300000);
    it("every prompt renders as valid latex",async()=>{
        let failures:string[]=[];
        for(let topicId of registeredTopicIds()){
            for(let difficulty of ["easy", "medium"]){
                for(let seed=1; seed<=8; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    let detail=describeFindings(validateQuestionLatex(sample.dto));
                    if (detail) record(failures, topicId, difficulty, seed, detail);
                }
            }
        }
        expect(failures).toEqual([]);
    }, 300000);
    it("every multiple-choice question presents four usable options with one correct",async()=>{
        let failures:string[]=[];
        for(let topicId of registeredTopicIds()){
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=8; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    let dto: QuestionDto=sample.dto;
                    if (!Array.isArray(dto.choices)) continue;
                    // A generator may offer a short or partly duplicated set,
                    // and the app is required to repair it. The invariant that
                    // matters is the set the learner is shown, so it is checked
                    // after repair rather than on the generator's raw array.
                    let options=buildChoiceSet(dto.correct, dto.choices, seededRng(seed));
                    if (options.length!==4){
                        record(failures, topicId, difficulty, seed, "presents "+options.length+" option(s): "+JSON.stringify(options));
                        continue;
                    }
                    for(let option of options){
                        if (/NaN|Infinity|undefined/.test(option)){
                            record(failures, topicId, difficulty, seed, "unusable option "+JSON.stringify(option)+" for "+JSON.stringify(dto.correct));
                        }
                    }
                    let correctCount=options.filter(o=>sameNumericValue(o, dto.correct)).length;
                    if (correctCount!==1){
                        record(failures, topicId, difficulty, seed, correctCount+" of the presented options are correct: "+JSON.stringify(options)+" for "+JSON.stringify(dto.correct));
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    }, 600000);
    it("a distractor is never also the correct answer",async()=>{
        let failures:string[]=[];
        for(let topicId of registeredTopicIds()){
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=8; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    let dto=sample.dto;
                    if (!Array.isArray(dto.choices)) continue;
                    let findings=await validateMcq(dto);
                    let alsoCorrect=describeFindings(findings.filter(f=>f.code===MCQ_CODES.alsoCorrect));
                    if (alsoCorrect) record(failures, topicId, difficulty, seed, alsoCorrect);
                }
            }
        }
        expect(failures).toEqual([]);
    }, 600000);
});
