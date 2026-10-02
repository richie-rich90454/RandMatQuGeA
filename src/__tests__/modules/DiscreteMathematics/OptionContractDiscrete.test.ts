/**
 * @vitest-environment jsdom
 * @file The option-set contract for the DiscreteMathematics generators.
 * @description Every multiple-choice question has to offer four options with
 * exactly one of them correct, and the generator's own array has to satisfy that
 * before the app's builder ever sees it. These tests drive the generators across
 * every difficulty and a wide range of seeds, because the defects they cover were
 * all branch-specific: a branch that asked a yes/no question, a branch whose
 * candidates all collapsed onto the answer, and a branch that offered a count the
 * learner could not have written.
 */
import{describe,it,expect}from"vitest";
import{generatePermutation,generateCombination}from"../../../modules/DiscreteMathematics/DiscretePermutationsCombinations";
import{generateProbability}from"../../../modules/DiscreteMathematics/DiscreteProbability";
import{generateStatistics}from"../../../modules/DiscreteMathematics/DiscreteStatistics";
import{generateDivisibility}from"../../../modules/DiscreteMathematics/GenerateDivisibility";
import{generateModular}from"../../../modules/DiscreteMathematics/GenerateModular";
import{generateGcdLcm}from"../../../modules/DiscreteMathematics/GenerateGcdLcm";
import{generateDataAnalysis}from"../../../modules/DiscreteMathematics/GenerateDataAnalysis";
import{seededRng}from"../../../main/core/Rng";
import{validateMcq, MCQ_CODES}from"../../oracle/Mcq";
import{equivalentExpressions}from"../../oracle/Symbolic";
import type{QuestionDto}from"../../../types/global";

/** Every topic the DiscreteMathematics subject registers that supplies options. */
const GENERATORS: [string, (difficulty?: string, rng?: ()=>number)=>QuestionDto][]=[
    ["perm", generatePermutation],
    ["comb", generateCombination],
    ["prob", generateProbability],
    ["stats", generateStatistics],
    ["divisibility", generateDivisibility],
    ["modular", generateModular],
    ["gcd_lcm", generateGcdLcm],
    ["data_analysis", generateDataAnalysis]
];

/** The difficulties every topic is driven at. */
const DIFFICULTIES=["easy","medium","hard"];

/** How many seeds each branch is driven from. */
const SEEDS=40;

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

describe("the DiscreteMathematics generators' own option sets",()=>{
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

describe("generateDivisibility",()=>{
    it("asks which of four numbers the rule accepts rather than a yes/no question",()=>{
        let asked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateDivisibility("medium", seededRng(seed));
            if (dto.latex.indexOf("Which of these")<0) continue;
            asked++;
            expect(dto.latex).toMatch(/Which of these is divisible by \d+/);
            let options=dto.choices??[];
            expect(options).toHaveLength(4);
            expect(new Set(options).size).toBe(4);
        }
        expect(asked).toBeGreaterThan(0);
    });
    it("offers exactly one number the stated divisor divides",()=>{
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateDivisibility("medium", seededRng(seed));
            if (dto.latex.indexOf("Which of these")<0) continue;
            let divisor=Number(dto.latex.match(/divisible by (\d+)/)?.[1]);
            expect(Number.isFinite(divisor)).toBe(true);
            // The four numbers have to be the ones printed, or the question is not
            // answerable outside multiple-choice mode.
            let printed=dto.latex.split("? ")[1]?.replace(/\.$/,"").split(", ").map(Number).sort((a,b)=>a-b);
            expect(printed).toEqual((dto.choices??[]).map(Number).sort((a,b)=>a-b));
            let divisible=(dto.choices??[]).filter(o=>Number(o)%divisor===0);
            expect(divisible).toEqual([dto.correct]);
        }
    });
});

describe("generateModular",()=>{
    it("offers four distinct residue classes when it asks which value is congruent",()=>{
        let asked=0;
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateModular("easy", seededRng(seed));
            if (dto.latex.indexOf("Which of these is congruent")<0) continue;
            asked++;
            let modulus=Number(dto.latex.match(/modulo \\\(\s*(\d+)/)?.[1]);
            expect(Number.isFinite(modulus)).toBe(true);
            let classes=(dto.choices??[]).map(o=>Number(o)%modulus);
            // Two options in the same residue class would be two correct answers.
            expect(new Set(classes).size).toBe(4);
        }
        expect(asked).toBeGreaterThan(0);
    });
    it("offers the k that satisfies the printed equation among its options",()=>{
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateModular("medium", seededRng(seed));
            if (dto.latex.indexOf("largest whole number")<0) continue;
            let printed=dto.latex.match(/(\d+)k = (\d+)/);
            expect(printed).not.toBeNull();
            let divisor=Number(printed![1]);
            let value=Number(printed![2]);
            expect(divisor*Number(dto.correct)).toBe(value);
            expect(dto.choices).toContain(dto.correct);
        }
    });
});

describe("generateProbability",()=>{
    it("never prints a probability that rounds to zero at the precision it grades",()=>{
        let failures:string[]=[];
        for(let seed=1; seed<=SEEDS*4; seed++){
            for(let difficulty of DIFFICULTIES){
                let dto=generateProbability(difficulty, seededRng(seed));
                if ((dto.expectedFormat??"").indexOf("decimal")<0) continue;
                if (Number(dto.correct)>0&&Number(dto.correct)<0.01) failures.push(difficulty+"/seed"+seed+": "+dto.correct);
            }
        }
        expect(failures).toEqual([]);
    });
});

describe("generatePermutation and generateCombination",()=>{
    it("never asks about a single item, where every candidate formula agrees",()=>{
        for(let generate of [generatePermutation, generateCombination]){
            for(let seed=1; seed<=SEEDS*4; seed++){
                let dto=generate("medium", seededRng(seed));
                // The complement branch prints C(n, n-r) = C(n, r), so the second
                // index there is not the number chosen and there is nothing to check.
                if (dto.latex.indexOf("Show that")===0) continue;
                let chosen=dto.latex.match(/[, ](\d+)\)/);
                if (!chosen) continue;
                expect(Number(chosen[1])).toBeGreaterThan(1);
            }
        }
    });
    it("keeps a large count as a whole number rather than in exponential notation",()=>{
        for(let seed=1; seed<=SEEDS*4; seed++){
            let dto=generateCombination("hard", seededRng(seed));
            for(let option of dto.choices??[]){
                expect(option).toMatch(/^\d+$/);
            }
        }
    });
});

describe("generateStatistics",()=>{
    it("never offers the mode in a second spelling",async()=>{
        let failures:string[]=[];
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateStatistics("medium", seededRng(seed));
            if (dto.latex.indexOf("mode")<0) continue;
            let wrong=(dto.choices??[]).filter(o=>o!==dto.correct);
            for(let option of wrong){
                if (await equivalentExpressions(option, dto.correct)==="equal") failures.push("seed"+seed+": "+option+" is also the mode "+dto.correct);
            }
        }
        expect(failures).toEqual([]);
    }, 60000);
});