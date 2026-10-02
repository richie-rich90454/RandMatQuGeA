/**
 * @vitest-environment jsdom
 * @file The option-set contract for the Calculus generators.
 * @description Every multiple-choice question has to offer four options with
 * exactly one of them correct, and the generator's own array has to satisfy that
 * before the app's builder ever sees it. These tests drive the generators across
 * every difficulty and a wide range of seeds, because the defects they cover were
 * all branch-specific: a branch that lower-cased its options until none of them
 * was the answer, a branch that offered its own answer twice in two spellings, and
 * a branch whose distractors were the answer again whenever a coefficient came out
 * as one.
 */
import{describe,it,expect}from"vitest";
import{generateIntegrationAdvanced}from"../../../modules/Calculus/CalculusIntegrationAdvanced";
import{generateDerivative}from"../../../modules/Calculus/CalculusDerivatives";
import{generateIntegral}from"../../../modules/Calculus/CalculusIntegrals";
import{generateApplicationsDiff}from"../../../modules/Calculus/CalculusApplicationsDiff";
import{generateLimit}from"../../../modules/Calculus/CalculusLimitsRelated";
import{generateLimitsContinuity}from"../../../modules/Calculus/CalculusLimitsContinuity";
import{generateGraphicalCalculus}from"../../../modules/Calculus/CalculusGraphical";
import{generateParametricPolarVector}from"../../../modules/Calculus/CalculusParametricPolarVector";
import{generateSequencesSeries}from"../../../modules/Calculus/CalculusSequencesSeries";
import{seededRng}from"../../../main/core/Rng";
import{validateMcq, MCQ_CODES}from"../../oracle/Mcq";
import{equivalentExpressions}from"../../oracle/Symbolic";
import type{QuestionDto}from"../../../types/global";

/** Every topic the Calculus subject registers that supplies options. */
const GENERATORS: [string, (difficulty?: string, rng?: ()=>number)=>QuestionDto][]=[
    ["integration_advanced", generateIntegrationAdvanced],
    ["deri", generateDerivative],
    ["inte", generateIntegral],
    ["applications_diff", generateApplicationsDiff],
    ["lim", generateLimit],
    ["limits_continuity", generateLimitsContinuity],
    ["graphical_calculus", generateGraphicalCalculus],
    ["parametric_polar", generateParametricPolarVector],
    ["sequences_series", generateSequencesSeries]
];

/** The difficulties every topic is driven at. */
const DIFFICULTIES=["easy","medium","hard"];

/** How many seeds each branch is driven from. */
const SEEDS=30;

/**
 * Reports the gated defects for one generated question, which is the same check
 * the oracle's raw-option gate makes and nothing more.
 *
 * @param dto - The generated question.
 * @returns The gated findings.
 */
async function gatedFindings(dto: QuestionDto): Promise<string[]>{
    let findings=await validateMcq(dto);
    return findings
        .filter(f=>f.code!==MCQ_CODES.correctNotFirst)
        .map(f=>f.code+": "+f.message);
}

describe("the Calculus generators' own option sets",()=>{
    for(let [topicId, generate] of GENERATORS){
        it(`${topicId} offers four options with one correct at every difficulty`,async()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SEEDS; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    let findings=await gatedFindings(dto);
                    if (findings.length>0) failures.push(topicId+"/"+difficulty+"/seed"+seed+": "+findings.join(" | "));
                }
            }
            expect(failures).toEqual([]);
        }, 60000);
    }
});

describe("generateIntegrationAdvanced",()=>{
    it("offers the answer exactly as it is printed, letter for letter",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateIntegrationAdvanced("hard", seededRng(seed));
            if (!dto.choices?.includes(dto.correct)) continue;
            checked++;
            // An option that differs from the answer only in case is a second
            // correct answer the learner cannot tell from the first.
            let cased=dto.choices.filter(o=>o!==dto.correct&&o.toLowerCase()===dto.correct.toLowerCase());
            expect(cased).toEqual([]);
        }
        expect(checked).toBeGreaterThan(0);
    });
    it("never asks for an average over a zero-width interval",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateIntegrationAdvanced("medium", seededRng(seed));
            if (dto.latex.indexOf("Average value")<0) continue;
            checked++;
            let interval=dto.latex.match(/\[(\d+),(\d+)\]/);
            expect(interval).not.toBeNull();
            expect(Number(interval![1])).not.toBe(Number(interval![2]));
            expect(dto.correct).not.toBe("NaN");
        }
        expect(checked).toBeGreaterThan(0);
    });
});

describe("generateDerivative and generateIntegral",()=>{
    it("never offers the derivative again as a different spelling of itself",async()=>{
        let failures:string[]=[];
        for(let generate of [generateDerivative, generateIntegral]){
            for(let seed=1; seed<=SEEDS; seed++){
                let dto=generate("hard", seededRng(seed));
                for(let option of dto.choices??[]){
                    if (option===dto.correct) continue;
                    if (await equivalentExpressions(option, dto.correct)==="equal"){
                        failures.push(JSON.stringify({correct:dto.correct, option, latex:dto.latex.replace(/\s+/g," ")}));
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    }, 120000);
    it("offers four options for a tangent or secant question, where no name test matches",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateDerivative("medium", seededRng(seed));
            if (dto.latex.indexOf("\\sec(x)")<0&&dto.latex.indexOf("\\csc(x)")<0&&dto.latex.indexOf("\\cot(x)")<0) continue;
            checked++;
            expect(dto.choices).toHaveLength(4);
        }
        expect(checked).toBeGreaterThan(0);
    });
    it("offers four options for an inverse trigonometric integral at any radius",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateIntegral("easy", seededRng(seed));
            // The prompt is the integral, not the antiderivative, so the branch is
            // recognised by the answer it asks for.
            if (dto.correct.indexOf("arcsin")<0&&dto.correct.indexOf("arctan")<0) continue;
            checked++;
            expect(dto.choices).toHaveLength(4);
        }
        expect(checked).toBeGreaterThan(0);
    });
});

describe("generateApplicationsDiff",()=>{
    it("offers a whole number beside a halved limit, which is the same value twice",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateApplicationsDiff("medium", seededRng(seed));
            if (dto.latex.indexOf("e^{")===dto.latex.length) continue;
            if (dto.latex.indexOf("\\lim_{x\\to 0}")<0) continue;
            checked++;
            let values=(dto.choices??[]).map(Number);
            expect(new Set(values).size).toBe(values.length);
        }
        expect(checked).toBeGreaterThan(0);
    });
    it("never offers the true value of the root as a second option",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateApplicationsDiff("easy", seededRng(seed));
            if (dto.latex.indexOf("linear approximation")<0) continue;
            checked++;
            let radicand=Number(dto.latex.match(/sqrt\{([\d.]+)\}/)?.[1]);
            expect(Number.isFinite(radicand)).toBe(true);
            // The estimate and the true value agree to three places at any radicand
            // a learner can be asked about, so the true value is the answer and may
            // not also be a distractor.
            let trueValue=Math.sqrt(radicand).toFixed(3);
            let options=dto.choices??[];
            expect(options.filter(o=>o===trueValue)).toHaveLength(Number(trueValue===dto.correct));
            expect(new Set(options).size).toBe(4);
        }
        expect(checked).toBeGreaterThan(0);
    });
});

describe("generateSequencesSeries and generateParametricPolarVector",()=>{
    it("writes its options in the same spelling as its answer",()=>{
        let checked=0;
        for(let generate of [generateSequencesSeries, generateParametricPolarVector]){
            for(let seed=1; seed<=SEEDS*2; seed++){
                let dto=generate("medium", seededRng(seed));
                let stripped=dto.correct.replace(/\s/g,"");
                if ((dto.choices??[]).indexOf(stripped)<0) continue;
                checked++;
                expect((dto.choices??[]).filter(o=>o!==dto.correct)).not.toContain(stripped);
            }
        }
        expect(checked).toBeGreaterThan(0);
    });
    it("offers four options for a p-series, whose answer is only ever two words",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateSequencesSeries("medium", seededRng(seed));
            if (dto.latex.indexOf("converges for?")<0) continue;
            checked++;
            expect(dto.choices).toHaveLength(4);
        }
        expect(checked).toBeGreaterThan(0);
    });
});

describe("generateGraphicalCalculus",()=>{
    it("never offers a division by zero as an option",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateGraphicalCalculus("medium", seededRng(seed));
            if (dto.latex.indexOf("f^{-1})")<0) continue;
            checked++;
            for(let option of dto.choices??[]){
                expect(option).not.toBe("Infinity");
            }
        }
        expect(checked).toBeGreaterThan(0);
    });
});