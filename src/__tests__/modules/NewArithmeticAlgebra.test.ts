/**
 * @vitest-environment jsdom
 * @file The contracts every new arithmetic and algebra generator has to hold.
 * @description Four things are checked here for each of the sixteen generators, and
 * each of them is a defect class rather than a restatement of the implementation:
 *
 * 1. Every declared sub-skill is reachable, and nothing else is. This is the test
 *    that catches a branch that was written but never selected, because a branch no
 *    seed reaches is a branch nobody practises and nobody notices is broken.
 * 2. The option set is four options with the key among them and no two denoting the
 *    same value. Two spellings of one number are one option to a learner and two to
 *    a string comparison, which is how a four-option question silently becomes a
 *    three-option one.
 * 3. The question is well-formed and its prompt renders. A prompt that does not
 *    typeset is worse than a missing question, because the learner sees raw markup
 *    and cannot tell whose problem it is.
 * 4. The multiple-choice validator reports nothing over a wide sweep of seeds and
 *    difficulties. The oracle gate samples eight seeds per difficulty; these
 *    generators are swept at 400 seeds per difficulty, because every defect above is
 *    branch-specific and two real ones hid outside a hundred seeds.
 *
 * The sweep widths are deliberately larger than they look necessary. A 120-seed sweep
 * passed, and a 400-seed sweep found a pair of distractors that differed by a single
 * unit in the last decimal place and a branch whose three feasible options collapsed
 * onto two, neither of which a narrow sample reaches.
 */
import{describe,it,expect}from"vitest";
import{seededRng}from"../../main/core/Rng";
import{generatePlaceValue}from"../../modules/Arithmetic/GeneratePlaceValue";
import{generateNegativeNumbers}from"../../modules/Arithmetic/GenerateNegativeNumbers";
import{generateLongDivision}from"../../modules/Arithmetic/GenerateLongDivision";
import{generatePowersOfTen}from"../../modules/Arithmetic/GeneratePowersOfTen";
import{generateRoundingEstimate}from"../../modules/Arithmetic/GenerateRoundingEstimate";
import{generatePrimeFactorisation}from"../../modules/Arithmetic/GeneratePrimeFactorisation";
import{generateLcmPeriods}from"../../modules/Arithmetic/GenerateLcmPeriods";
import{generateMoneyChange}from"../../modules/Arithmetic/GenerateMoneyChange";
import{generateAbsoluteValueEquation}from"../../modules/Algebra/advanced/GenerateAbsoluteValueEquation";
import{generateAbsoluteValueInequality}from"../../modules/Algebra/advanced/GenerateAbsoluteValueInequality";
import{generateQuadraticWordProblems}from"../../modules/Algebra/GenerateQuadraticWordProblems";
import{generateSystemsOfInequalities}from"../../modules/Algebra/GenerateSystemsOfInequalities";
import{generateLogarithmicEquations}from"../../modules/Algebra/precalculus/GenerateLogarithmicEquations";
import{generateExponentialEquations}from"../../modules/Algebra/precalculus/GenerateExponentialEquations";
import{generatePolynomialTheorems}from"../../modules/Algebra/advanced/GeneratePolynomialTheorems";
import{generatePiecewiseFunctions}from"../../modules/Algebra/precalculus/GeneratePiecewiseFunctions";
import{isWellFormed}from"../oracle/Symbolic";
import{validateQuestionLatex}from"../oracle/Latex";
import{validateMcq}from"../oracle/Mcq";
import{canonicaliseNumeric}from"../oracle/Exact";
import type{QuestionDto}from"../../types/global";

/** A generator and every sub-skill it is declared to have. */
interface Topic{
    /** The topic id, used only to label a failure. */
    id: string;
    /** The generator itself. */
    generate: (difficulty?: string, rng?: ()=>number)=>QuestionDto;
    /** Every sub-skill the generator must be able to reach, and no other. */
    branches: string[];
}

/** Every generator this file gates, with its exact sub-skill list. */
const TOPICS: Topic[]=[
    {id:"place_value", generate:generatePlaceValue, branches:["digit_value","expanded_form","round_to_place","compare_by_place"]},
    {id:"negative_numbers", generate:generateNegativeNumbers, branches:["number_line","opposite_values","add_signed","subtract_signed","multiply_signed","divide_signed"]},
    {id:"long_division", generate:generateLongDivision, branches:["with_remainder","exact_division","estimate_first","check_by_multiplying"]},
    {id:"powers_of_ten", generate:generatePowersOfTen, branches:["multiply_by_power","divide_by_power","order_of_magnitude","decimal_shift"]},
    {id:"rounding_estimate", generate:generateRoundingEstimate, branches:["round_half_up","round_half_even","significant_figures","estimate_a_range"]},
    {id:"prime_factorisation", generate:generatePrimeFactorisation, branches:["factor_a_small_number","build_a_product","count_divisors","total_exponent"]},
    {id:"lcm_periods", generate:generateLcmPeriods, branches:["lcm_of_two","lcm_of_three","common_schedule","lcm_and_gcd_word"]},
    {id:"money_change", generate:generateMoneyChange, branches:["total_a_cost","change_due","unit_price","split_a_bill"]},
    {id:"absolute_value_equation", generate:generateAbsoluteValueEquation, branches:["single_equation","two_solutions","no_solution","check_the_answer"]},
    {id:"absolute_value_inequality", generate:generateAbsoluteValueInequality, branches:["single_inequality","compound_inequality","always_true","interval_answer"]},
    {id:"quadratic_word_problems", generate:generateQuadraticWordProblems, branches:["area_model","product_model","pythagorean_model","growth_and_decay"]},
    {id:"systems_of_inequalities", generate:generateSystemsOfInequalities, branches:["graph_a_half_plane","find_a_feasible_point","no_overlapping_region","corner_count"]},
    {id:"logarithmic_equations", generate:generateLogarithmicEquations, branches:["one_to_one_property","extraneous_root","combine_logarithms","change_of_base"]},
    {id:"exponential_equations", generate:generateExponentialEquations, branches:["same_base","different_base","growth_model","decay_model"]},
    {id:"polynomial_theorems", generate:generatePolynomialTheorems, branches:["remainder_by_theorem","factor_by_theorem","synthetic_check","possible_roots"]},
    {id:"piecewise_functions", generate:generatePiecewiseFunctions, branches:["evaluate_a_branch","find_the_boundary","absolute_value_form","match_the_graph"]}
];

/** The difficulties every topic is driven at. */
const DIFFICULTIES=["easy","medium","hard"];

/** How many seeds the branch-reachability sweep uses per difficulty. */
const BRANCH_SEEDS=600;

/** How many seeds the option and prompt sweeps use per difficulty. */
const SWEEP_SEEDS=250;

/** How many seeds the multiple-choice validator sweep uses per difficulty. */
const MCQ_SEEDS=400;

/**
 * The identity two options are compared by. A numeric option is canonicalised so
 * that "0.5", "0.50" and "1/2" are one option, and anything else is compared as
 * trimmed text so an interval, a point and an equation keep the spelling the
 * question gave them.
 *
 * @param option - The candidate option.
 * @returns The identity to compare by.
 */
function identityOf(option: string): string{
    let trimmed=option.trim();
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(trimmed)||/^[+-]?\d+\s*\/\s*\d+$/.test(trimmed)) return canonicaliseNumeric(trimmed);
    return trimmed.toLowerCase();
}

/**
 * Records every way a generated question broke a contract, against the topic,
 * difficulty and seed that produced it, so a report names the case to reproduce.
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

describe("every new arithmetic and algebra generator reaches every sub-skill it declares",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} reaches exactly its declared branches`,()=>{
            let seen=new Set<string>();
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=BRANCH_SEEDS; seed++){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    seen.add(dto.subskill??"(none)");
                }
            }
            expect(Array.from(seen).sort()).toEqual(topic.branches.slice().sort());
        });
    }
});

describe("every new arithmetic and algebra generator offers four options with one correct",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} offers four distinct options with the key among them`,()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SWEEP_SEEDS; seed++){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    let options=dto.choices??[];
                    if (options.length!==4){
                        record(failures, topic.id, difficulty, seed, "offered "+options.length+" option(s) for "+JSON.stringify(dto.correct)+": "+JSON.stringify(options));
                        continue;
                    }
                    let correctCount=options.filter(option=>identityOf(option)===identityOf(dto.correct)).length;
                    if (correctCount!==1){
                        record(failures, topic.id, difficulty, seed, correctCount+" of "+JSON.stringify(options)+" denote the key "+JSON.stringify(dto.correct));
                    }
                    let seen=new Set<string>();
                    for(let option of options){
                        let identity=identityOf(option);
                        if (seen.has(identity)){
                            record(failures, topic.id, difficulty, seed, JSON.stringify(option)+" appears twice in "+JSON.stringify(options));
                        }
                        seen.add(identity);
                    }
                }
            }
            expect(failures).toEqual([]);
        }, 120000);
    }
});

describe("every new arithmetic and algebra generator produces a well-formed, renderable question",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} is well-formed and its prompt renders as LaTeX`,()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SWEEP_SEEDS; seed++){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    if (!isWellFormed(dto)){
                        record(failures, topic.id, difficulty, seed, "the question is not well-formed: "+JSON.stringify({latex:dto.latex, correct:dto.correct}));
                        continue;
                    }
                    let findings=validateQuestionLatex(dto);
                    if (findings.length>0){
                        record(failures, topic.id, difficulty, seed, findings.map(finding=>finding.code+": "+finding.message).join(" | "));
                    }
                }
            }
            expect(failures).toEqual([]);
        }, 120000);
    }
});

describe("the multiple-choice validator finds nothing in the new generators",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} offers four usable options with one correct at every difficulty`,async()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=MCQ_SEEDS; seed++){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    let findings=await validateMcq(dto);
                    if (findings.length>0){
                        record(failures, topic.id, difficulty, seed, findings.map(finding=>finding.code+": "+finding.message).join(" | ")+" for "+JSON.stringify(dto.choices));
                    }
                }
            }
            expect(failures).toEqual([]);
        }, 600000);
    }
});

describe("the help a learner is shown comes from the generator",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} supplies a two-rung ladder, a concession and a worked solution`,()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SWEEP_SEEDS; seed++){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    let branch=dto.subskill??"(none)";
                    let ladder=dto.hints;
                    if (!ladder||ladder.rungs.length<2){
                        record(failures, topic.id+"/"+branch, difficulty, seed, "the question carries no two-rung hint ladder");
                        continue;
                    }
                    if (ladder.concede.indexOf(dto.correct)<0){
                        record(failures, topic.id+"/"+branch, difficulty, seed, "the concession does not give the answer: "+JSON.stringify(ladder.concede));
                    }
                    let solution=dto.solution;
                    if (!solution||solution.length===0){
                        record(failures, topic.id+"/"+branch, difficulty, seed, "the question carries no worked solution");
                        continue;
                    }
                    let last=solution[solution.length-1] as string;
                    let left=last.replace(/[. ]+$/,"").trim();
                    let right=dto.correct.replace(/[. ]+$/,"").trim();
                    if (left.length<right.length||left.slice(left.length-right.length)!==right){
                        record(failures, topic.id+"/"+branch, difficulty, seed, "the last step "+JSON.stringify(last)+" does not end with the key "+JSON.stringify(dto.correct));
                    }
                }
            }
            expect(failures).toEqual([]);
        }, 120000);
    }
});
