/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import{registeredTopicIds, sampleQuestion}from"./Harness";
import{validateQuestionLatex}from"./Latex";
import{isWellFormed}from"./Symbolic";
import{validateMcq, MCQ_CODES}from"./Mcq";
import{buildChoiceSet}from"../../main/Mcq";
import{buildHintLadder, buildSolution}from"../../modules/shared/Hints";
import * as help from"../../main/services/Help";
import{seededRng}from"../../main/core/Rng";
import{canonicalNumeric, sameNumericValue}from"../../main/AnswerFormat";
import type{QuestionDto}from"../../types/global";

/** The difficulties every topic is sampled at. */
const DIFFICULTIES=["easy", "medium", "hard"];

/**
 * The option values a learner must never be shown. "undefined" is not on this
 * list: it is the correct answer wherever a trigonometric ratio is undefined,
 * and generators offer it as a distractor for an exponent rule. A non-finite
 * number and a placeholder are the values that are never an answer.
 */
const UNUSABLE_OPTION=/NaN|Infinity|null|\?\?/;

/**
 * The findings the raw gate reports on. `correctNotFirst` is excluded because a
 * generator is allowed to shuffle its options: the app places the key, so where
 * the key sits in a generator's array is not a defect.
 */
const GATED_CODES: string[]=[
    MCQ_CODES.tooFew,
    MCQ_CODES.duplicate,
    MCQ_CODES.nonFinite,
    MCQ_CODES.alsoCorrect,
    MCQ_CODES.correctAbsent
];

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
                    expect(option).not.toMatch(UNUSABLE_OPTION);
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
                        if (UNUSABLE_OPTION.test(option)){
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
                    // The presented set is what the learner is shown, so it is checked
                    // after the builder has run. The generator's own array is checked
                    // separately below, because a builder that quietly repairs a bad
                    // set is a way of never finding the bad set.
                    let options=buildChoiceSet(dto.correct, dto.choices, seededRng(seed));
                    if (options.length!==4){
                        record(failures, topicId, difficulty, seed, "presents "+options.length+" option(s): "+JSON.stringify(options));
                        continue;
                    }
                    for(let option of options){
                        if (UNUSABLE_OPTION.test(option)){
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
    it("every generator's own raw option set is already four usable options with one correct",async()=>{
        let failures:string[]=[];
        for(let topicId of registeredTopicIds()){
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=8; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    let dto: QuestionDto=sample.dto;
                    // A topic that offers no curated options at all is not making a
                    // claim about its options, and the presented-set gate above covers
                    // the set the builder makes for it. One that does offer a set has
                    // already made the claim, and the claim has to hold.
                    if (!Array.isArray(dto.choices)||dto.choices.length===0) continue;
                    let findings=await validateMcq(dto);
                    let gated=describeFindings(findings.filter(f=>GATED_CODES.indexOf(f.code)>=0));
                    if (gated) record(failures, topicId, difficulty, seed, gated+" raw options "+JSON.stringify(dto.choices));
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

/** The eight topics whose generators carry their own worked solutions. */
const WORKED_TOPICS=["counting_principles","probability_rules","similarity","rigid_transformations","circle_geometry","eigenvalues","orthogonality","vectors_3d"];

/** The words the generic scaffold always opens a ladder with. */
const SCAFFOLD_OPENER="What the answer should look like";

/**
 * Mounts the elements the help panel writes into, so `Help` can be driven end to end
 * in jsdom rather than only through the two functions it delegates to. The same
 * panel is reused across tests, because the registry caches the element it first
 * resolved and a second element with the same id would never be found again;
 * `prepare` clears the panel, so each test still starts from empty.
 *
 * @returns The hint panel element.
 */
function mountHelpPanel(): HTMLElement{
    let existing=document.getElementById("hint-panel");
    if (existing) return existing as HTMLElement;
    document.body.innerHTML="<button id=\"show-hint\"></button><button id=\"show-solution\"></button><div id=\"hint-panel\" hidden></div><div id=\"confidence-row\" hidden></div>";
    return document.getElementById("hint-panel") as HTMLElement;
}

/**
 * Reports whether a worked step finishes on the printed answer. A trailing full stop
 * is punctuation rather than content, and several topics print a whole sentence as
 * their answer, so both sides lose theirs before the comparison.
 *
 * @param step - The last worked step.
 * @param key - The printed answer.
 * @returns True when the step ends with the answer.
 */
function endsWithKey(step: string, key: string): boolean{
    let left=step.replace(/\.$/,"").trim();
    let right=key.replace(/\.$/,"").trim();
    if (right===""||left.length<right.length) return false;
    return left.slice(left.length-right.length)===right;
}

/**
 * The help a learner is actually shown has to come from the generator, because the
 * generic scaffold only knows the answer's shape and not the procedure. This drives
 * the service rather than the two helpers it calls, so the preference is proved where
 * it is used rather than where it is implemented.
 */
describe("help ladders",()=>{
    it("shows a generator's own ladder and worked solution instead of the generic scaffold",()=>{
        let panel=mountHelpPanel();
        let supplied: QuestionDto={
            latex:"Find x.",
            correct:"42",
            expectedFormat:"Enter a whole number",
            subskill:"demo",
            solution:["Step one: read the two numbers off the prompt.", "Step two: 6 x 7 = 42."],
            hints:{rungs:["Name the procedure for this branch."], concede:"The answer is 42."}
        };
        help.prepare(supplied);
        help.reveal();
        help.revealSolution();
        let shown=panel.textContent||"";
        expect(shown).toContain("Name the procedure for this branch.");
        expect(shown).toContain("Step two: 6 x 7 = 42.");
        expect(shown).not.toContain(SCAFFOLD_OPENER);
    });
    it("falls back to the generic scaffold when a generator supplies nothing",()=>{
        let panel=mountHelpPanel();
        help.prepare({latex:"Find x.", correct:"hello there", expectedFormat:"Enter a whole number"});
        help.reveal();
        expect(panel.textContent||"").toContain(SCAFFOLD_OPENER);
    });
    it("every branch of the eight new topics opens with its own procedure and never the answer",async()=>{
        let failures:string[]=[];
        for(let topicId of WORKED_TOPICS){
            let byBranch=new Map<string, Set<string>>();
            for(let seed=1; seed<=120; seed++){
                let sample=await sampleQuestion(topicId, "hard", seed);
                let ladder=buildHintLadder(sample.dto);
                if (!ladder||ladder.rungs.length===0){
                    record(failures, topicId, "hard", seed, "the question carries no hint ladder");
                    continue;
                }
                if (ladder.concede.indexOf(sample.dto.correct)<0){
                    record(failures, topicId, "hard", seed, "the concession does not give the answer: "+JSON.stringify(ladder.concede));
                }
                let opener=ladder.rungs[0];
                if (opener.indexOf(SCAFFOLD_OPENER)===0){
                    record(failures, topicId, "hard", seed, "the first hint is the generic scaffold: "+JSON.stringify(opener));
                    continue;
                }
                let branch=sample.dto.subskill||"(none)";
                let openers=byBranch.get(branch);
                if (!openers){
                    openers=new Set<string>();
                    byBranch.set(branch, openers);
                }
                openers.add(opener);
            }
            let branches=Array.from(byBranch.keys());
            if (branches.length<2){
                record(failures, topicId, "hard", 0, "only one branch was reachable, so one hint cannot be branch-specific");
            }
            // Two branches that open with the same words are not two procedures, and a
            // topic that opens every branch the same way has a topic-level hint.
            for(let i=0; i<branches.length; i++){
                for(let j=i+1; j<branches.length; j++){
                    let left=byBranch.get(branches[i] as string) as Set<string>;
                    let right=byBranch.get(branches[j] as string) as Set<string>;
                    let shared=Array.from(left).filter(opener=>right.has(opener));
                    if (shared.length>0){
                        record(failures, topicId, "hard", 0, "branches "+branches[i]+" and "+branches[j]+" share the opening "+JSON.stringify(shared));
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    }, 300000);
    it("the last worked step of every new topic reproduces the printed key",async()=>{
        let failures:string[]=[];
        for(let topicId of WORKED_TOPICS){
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=12; seed++){
                    let sample=await sampleQuestion(topicId, difficulty, seed);
                    let steps=buildSolution(sample.dto);
                    if (!steps||steps.length===0){
                        record(failures, topicId, difficulty, seed, "the question carries no worked solution");
                        continue;
                    }
                    let last=(steps[steps.length-1] as string);
                    if (!endsWithKey(last, sample.dto.correct)){
                        record(failures, topicId, difficulty, seed, "the last step "+JSON.stringify(last)+" does not end with the key "+JSON.stringify(sample.dto.correct));
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    }, 300000);
});
describe("word-level distractor equivalence",()=>{
    it("flags a distractor that restates the key in different words",async()=>{
        let dto={
            latex:"Classify \\( 0 \\) as natural, whole, integer, rational, irrational, or real.",
            correct:"whole, integer, rational, real",
            choices:["whole, integer, rational, real","Whole numbers, integers, rational, real","irrational, real","real"]
        } as QuestionDto;
        let findings=await validateMcq(dto);
        expect(findings.some(f=>f.code===MCQ_CODES.alsoCorrect)).toBe(true);
    });
    it("flags the historical number_sets zero set that offered the whole-number list",async()=>{
        let dto={
            latex:"Classify \\( 0 \\) as natural, whole, integer, rational, irrational, or real.",
            correct:"integer, rational, real",
            choices:["integer, rational, real","natural, whole, integer, rational, real","whole, integer, rational, real","real"]
        } as QuestionDto;
        let findings=await validateMcq(dto);
        expect(findings.some(f=>f.code===MCQ_CODES.alsoCorrect)).toBe(true);
    });
    it("accepts the fixed number_sets zero set",async()=>{
        let dto={
            latex:"Classify \\( 0 \\) as natural, whole, integer, rational, irrational, or real.",
            correct:"whole, integer, rational, real",
            choices:["whole, integer, rational, real","integer, rational, real","irrational, real","natural, integer, rational, real"]
        } as QuestionDto;
        let findings=await validateMcq(dto);
        expect(findings.filter(f=>f.code===MCQ_CODES.alsoCorrect)).toEqual([]);
    });
});
