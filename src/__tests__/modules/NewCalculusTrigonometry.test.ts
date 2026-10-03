/**
 * @vitest-environment jsdom
 * @file The gate for the seventeen calculus and trigonometry generators added to the
 * curriculum: branch reachability, the four-option contract, and the three oracles.
 * @description Every generator in this file is sampled across many seeds and every
 * difficulty, because the defects these assertions exist to catch are branch
 * specific: a branch that never fires, an option set that offers three, a key that
 * is not offered at all, a prompt that does not typeset, or a distractor that is
 * also mathematically correct.
 *
 * The branch test is the guard that makes the rest non-vacuous. It asserts that the
 * set of sub-skills observed is exactly the declared list, so a generator that
 * stopped producing a branch fails rather than quietly passing a shorter sweep.
 *
 * Two checks go beyond the oracles, because they are the mathematics these topics
 * are actually about. The ambiguous-case count is recomputed from the printed
 * measurements and compared with the printed key, and every vector-field
 * classification is recomputed by differentiating the printed field.
 */
import{describe, expect, it}from"vitest";
import{generateOptimization}from"../../modules/Calculus/GenerateOptimization";
import{generateLHospital}from"../../modules/Calculus/GenerateLHospital";
import{generateTaylor}from"../../modules/Calculus/GenerateTaylor";
import{generateFundamentalTheorem}from"../../modules/Calculus/GenerateFundamentalTheorem";
import{generateMeanValueTheorem}from"../../modules/Calculus/GenerateMeanValueTheorem";
import{generateImproperIntegrals}from"../../modules/Calculus/GenerateImproperIntegrals";
import{generatePartialDerivatives}from"../../modules/Calculus/GeneratePartialDerivatives";
import{generateDivergenceCurl}from"../../modules/Calculus/GenerateDivergenceCurl";
import{generateParametricCurves}from"../../modules/Calculus/GenerateParametricCurves";
import{generateSolvingTrigEquations}from"../../modules/Trigonometry/GenerateTrigEquations";
import{generateGeneralSolutions}from"../../modules/Trigonometry/GenerateGeneralSolutions";
import{generateExactValues}from"../../modules/Trigonometry/GenerateExactValues";
import{generateTrigIdentities}from"../../modules/Trigonometry/GenerateTrigIdentities";
import{generateLawOfSines}from"../../modules/Trigonometry/GenerateLawOfSines";
import{generateLawOfCosines}from"../../modules/Trigonometry/GenerateLawOfCosines";
import{generateAmbiguousCase}from"../../modules/Trigonometry/GenerateAmbiguousCase";
import{generateInverseTrigonometry}from"../../modules/Trigonometry/GenerateInverseTrig";
import{seededRng}from"../../main/core/Rng";
import{validateQuestionLatex}from"../oracle/Latex";
import{isWellFormed}from"../oracle/Symbolic";
import{validateMcq}from"../oracle/Mcq";
import type{QuestionDto}from"../../types/global";

/** The seventeen generators, each with the exact sub-skill branch strings it must produce. */
const TOPICS:[string, (difficulty?: string, rng?: () => number)=>QuestionDto, string[]][]=[
    ["generateOptimization", generateOptimization, ["critical_points", "closed_interval", "endpoint_comparison", "interpret_the_maximum"]],
    ["generateLHospital", generateLHospital, ["zero_over_zero", "infinity_over_infinity", "apply_the_rule_twice", "when_the_rule_fails"]],
    ["generateTaylor", generateTaylor, ["maclaurin_for_exponential", "maclaurin_for_sine", "maclaurin_for_cosine", "approximate_a_value"]],
    ["generateFundamentalTheorem", generateFundamentalTheorem, ["accumulation_function", "average_value", "evaluate_by_antiderivative", "net_change"]],
    ["generateMeanValueTheorem", generateMeanValueTheorem, ["mean_value_for_derivatives", "rolle_theorem", "mean_value_for_integrals", "find_the_point_c"]],
    ["generateImproperIntegrals", generateImproperIntegrals, ["infinite_upper_bound", "infinite_function", "decide_convergence", "compare_a_series"]],
    ["generatePartialDerivatives", generatePartialDerivatives, ["partial_wrt_x", "partial_wrt_y", "the_gradient", "tangent_plane"]],
    ["generateDivergenceCurl", generateDivergenceCurl, ["divergence_in_2d", "divergence_in_3d", "curl_in_3d", "vector_field_type"]],
    ["generateParametricCurves", generateParametricCurves, ["dy_dx", "arc_length_of_a_curve", "curvature", "horizontal_tangent"]],
    ["generateSolvingTrigEquations", generateSolvingTrigEquations, ["linear_in_the_angle", "double_angle", "factored_form", "check_for_extraneous"]],
    ["generateGeneralSolutions", generateGeneralSolutions, ["coterminal_angles", "the_period", "all_solutions", "in_radians"]],
    ["generateExactValues", generateExactValues, ["the_45_degree_family", "quadrant_signs", "half_angles", "building_from_familiar_angles"]],
    ["generateTrigIdentities", generateTrigIdentities, ["recognise_the_pythagorean_family", "prove_a_basic_one", "simplify_an_expression", "reciprocal_conversion"]],
    ["generateLawOfSines", generateLawOfSines, ["find_a_side", "find_an_angle", "an_application", "choose_the_theorem"]],
    ["generateLawOfCosines", generateLawOfCosines, ["find_the_side", "find_the_angle", "an_application", "compare_with_pythagoras"]],
    ["generateAmbiguousCase", generateAmbiguousCase, ["two_possible_triangles", "one_possible_triangle", "no_possible_triangle", "verify_a_solution"]],
    ["generateInverseTrigonometry", generateInverseTrigonometry, ["the_principal_value", "evaluate_exactly", "a_composition", "domain_and_range"]]
];

/** The difficulties every generator is driven at. */
const DIFFICULTIES=["easy", "medium", "hard"];

/** How many seeds the option-set, hint and branch sweeps run at, per difficulty. */
const SWEEP=120;

/** How many seeds the multiple-choice oracle runs at, per difficulty. */
const ORACLE_SEEDS=100;

/**
 * Samples one generator across every difficulty and seed.
 *
 * @param generate - The generator to sample.
 * @param seeds - How many seeds per difficulty.
 * @returns Every question produced.
 */
function sample(generate: (difficulty?: string, rng?: () => number)=>QuestionDto, seeds: number): QuestionDto[]{
    let out:QuestionDto[]=[];
    for(let difficulty of DIFFICULTIES){
        for(let seed=1; seed<=seeds; seed++) out.push(generate(difficulty, seededRng(seed)));
    }
    return out;
}

describe("the new calculus and trigonometry generators", () => {
    for(let [name, generate, branches] of TOPICS){
        it(`${name} reaches exactly its declared sub-skills`, () => {
            let seen=new Set<string>();
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SWEEP; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    expect(typeof dto.subskill).toBe("string");
                    seen.add(dto.subskill as string);
                }
            }
            expect(Array.from(seen).sort()).toEqual(branches.slice().sort());
        });

        it(`${name} offers four distinct options with the key among them`, () => {
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SWEEP; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    let choices=dto.choices||[];
                    if (choices.length!==4){
                        failures.push(`${difficulty}/seed${seed}: ${choices.length} option(s) for ${JSON.stringify(dto.correct)}`);
                        continue;
                    }
                    let keyCount=choices.filter(option => option===dto.correct).length;
                    if (keyCount!==1) failures.push(`${difficulty}/seed${seed}: the key ${JSON.stringify(dto.correct)} appears ${keyCount} time(s) in ${JSON.stringify(choices)}`);
                    let identity=new Map<string, string>();
                    for(let option of choices){
                        let value=Number.isFinite(Number(option.trim()))?String(Number(option.trim())):option.trim().toLowerCase();
                        if (identity.has(value)) failures.push(`${difficulty}/seed${seed}: ${JSON.stringify(option)} is the same value as ${JSON.stringify(identity.get(value))} in ${JSON.stringify(choices)}`);
                        else identity.set(value, option);
                    }
                    for(let option of choices){
                        if (/NaN|Infinity|null|\?\?/.test(option)||option.trim()==="") failures.push(`${difficulty}/seed${seed}: unusable option ${JSON.stringify(option)}`);
                    }
                }
            }
            expect(failures).toEqual([]);
        }, 120000);

        it(`${name} is well formed and its prompt renders`, () => {
            let failures:string[]=[];
            for(let dto of sample(generate, SWEEP)){
                if (!isWellFormed(dto)) failures.push(`not well formed: ${JSON.stringify({latex: dto.latex, correct: dto.correct})}`);
                let findings=validateQuestionLatex(dto);
                if (findings.length>0) failures.push(`latex: ${findings.map(f => f.code+": "+f.message).join(" | ")} for ${JSON.stringify(dto.latex)}`);
            }
            expect(failures).toEqual([]);
        }, 120000);

        it(`${name} passes the multiple-choice oracle`, async () => {
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=ORACLE_SEEDS; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    for(let finding of await validateMcq(dto)) failures.push(`${difficulty}/seed${seed}: ${finding.code}: ${finding.message}`);
                }
            }
            expect(failures).toEqual([]);
        }, 300000);

        it(`${name} carries two hint rungs, a concession and a worked solution`, () => {
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=40; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    if (!dto.hints||dto.hints.rungs.length<2) failures.push(`${difficulty}/seed${seed}: fewer than two hint rungs`);
                    if (dto.hints&&dto.hints.concede.indexOf(dto.correct)<0) failures.push(`${difficulty}/seed${seed}: the concession does not give the key ${JSON.stringify(dto.correct)}`);
                    if (!dto.solution||dto.solution.length<2) failures.push(`${difficulty}/seed${seed}: no worked solution`);
                    if (typeof dto.expectedFormat!=="string"||dto.expectedFormat==="") failures.push(`${difficulty}/seed${seed}: no expected format`);
                }
            }
            expect(failures).toEqual([]);
        });
    }
});

describe("difficulty changes what the new generators ask", () => {
    for(let [name, generate] of TOPICS){
        it(`${name} asks at least one question at hard that it never asks at easy`, () => {
            let easy=new Set<string>();
            let hard=new Set<string>();
            for(let seed=1; seed<=60; seed++){
                easy.add(generate("easy", seededRng(seed)).latex);
                hard.add(generate("hard", seededRng(seed)).latex);
            }
            let onlyHard=Array.from(hard).filter(prompt => !easy.has(prompt));
            expect(onlyHard.length).toBeGreaterThan(0);
        });
    }
});

/**
 * Recomputes how many triangles a printed SSA measurement set really produces, by
 * forming both candidate angles from the sine rule and keeping the ones that leave
 * a positive third angle. The generator does the same computation internally, so
 * this compares the printed key with the printed numbers rather than trusting the
 * generator.
 *
 * @param latex - The prompt, from which the three measurements are read.
 * @param correct - The printed key.
 * @returns The recomputed count, or null when the prompt is not an SSA count or the
 *          two disagree.
 */
function recountTriangles(latex: string, correct: string): number|null{
    let match=latex.match(/You are given \\\( a = (\d+) \\\), \\\( b = (\d+) \\\) and \\\( A = (\d+)/);
    if (!match) return null;
    let a=Number(match[1]);
    let b=Number(match[2]);
    let A=Number(match[3]);
    let sine=b*Math.sin(A*Math.PI/180)/a;
    if (!(sine>0)||sine>1) return 0;
    let acute=Math.asin(sine)*180/Math.PI;
    let count=0;
    for(let candidate of [acute, 180-acute]){
        if (candidate>0&&180-A-candidate>1e-9) count++;
    }
    return count===Number(correct.trim())?count:null;
}

describe("the ambiguous case grades what the printed measurements produce", () => {
    it("every printed count matches the sine rule applied to the printed sides and angle", () => {
        let failures:string[]=[];
        let checked=0;
        for(let difficulty of DIFFICULTIES){
            for(let seed=1; seed<=200; seed++){
                let dto=generateAmbiguousCase(difficulty, seededRng(seed));
                if (dto.subskill==="verify_a_solution") continue;
                let count=recountTriangles(dto.latex, dto.correct);
                if (count===null) failures.push(`${difficulty}/seed${seed}: ${JSON.stringify(dto.latex)} graded ${JSON.stringify(dto.correct)}`);
                else checked++;
            }
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(300);
    });

    it("each of the three count branches is reachable and keyed by its own count", () => {
        let keys=new Map<string, Set<string>>();
        for(let difficulty of DIFFICULTIES){
            for(let seed=1; seed<=200; seed++){
                let dto=generateAmbiguousCase(difficulty, seededRng(seed));
                let branch=dto.subskill as string;
                if (!keys.has(branch)) keys.set(branch, new Set<string>());
                (keys.get(branch) as Set<string>).add(dto.correct.trim());
            }
        }
        expect(Array.from(keys.get("two_possible_triangles")||[])).toEqual(["2"]);
        expect(Array.from(keys.get("one_possible_triangle")||[])).toEqual(["1"]);
        expect(Array.from(keys.get("no_possible_triangle")||[])).toEqual(["0"]);
    });
});

/**
 * Reads one printed component of a planar field as a linear expression in x and y.
 *
 * @param text - The component, without the angle brackets.
 * @returns The coefficients of x and y.
 */
function readLinear(text: string): {cx: number, cy: number}{
    let clean=text.replace(/\\[^a-zA-Z]/g, "").replace(/[^0-9a-zA-Z+-]/g, "");
    let leading=clean.match(/^(-?\d*)x/);
    let trailing=clean.match(/(-?\d*)y/);
    let magnitude=(raw: string|undefined): number => {
        if (raw===undefined) return 0;
        if (raw==="") return 1;
        return Number(raw);
    };
    return {cx: leading?magnitude(leading[1]):0, cy: trailing?magnitude(trailing[1]):0};
}

describe("the printed curve produces the printed arc length", () => {
    it("every arc length equals the speed times the width of the printed parameter interval", () => {
        let failures:string[]=[];
        let checked=0;
        for(let difficulty of DIFFICULTIES){
            for(let seed=1; seed<=300; seed++){
                let dto=generateParametricCurves(difficulty, seededRng(seed));
                if (dto.subskill!=="arc_length_of_a_curve") continue;
                let match=dto.latex.match(/x = (-?\d+)t .*?y = (-?\d+)t .*?for .*?(-?\d+) \\le t \\le (-?\d+)/);
                if (!match){
                    failures.push(`${difficulty}/seed${seed}: the curve could not be read from ${JSON.stringify(dto.latex)}`);
                    continue;
                }
                let speed=Math.sqrt(Math.pow(Number(match[1]), 2)+Math.pow(Number(match[2]), 2));
                let width=Number(match[4])-Number(match[3]);
                let expected=speed*width;
                if (Number(dto.correct)!==expected) failures.push(`${difficulty}/seed${seed}: graded ${dto.correct} but ${JSON.stringify(dto.latex)} has length ${expected}`);
                else checked++;
            }
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(60);
    });
});

describe("the vector-field classification matches the printed field", () => {
    it("every printed class agrees with the divergence and curl of the printed field", () => {
        let failures:string[]=[];
        let checked=0;
        let graded=new Set<string>();
        for(let difficulty of DIFFICULTIES){
            for(let seed=1; seed<=400; seed++){
                let dto=generateDivergenceCurl(difficulty, seededRng(seed));
                if (dto.subskill!=="vector_field_type") continue;
                let match=dto.latex.match(/Let \\\( \\mathbf\{F\}\(x,y\) = \\langle (.+?) \\rangle/);
                if (!match){
                    failures.push(`${difficulty}/seed${seed}: the field could not be read from ${JSON.stringify(dto.latex)}`);
                    continue;
                }
                let parts=match[1].split(",");
                if (parts.length!==2){
                    failures.push(`${difficulty}/seed${seed}: the field has ${parts.length} components in ${JSON.stringify(dto.latex)}`);
                    continue;
                }
                let p=readLinear(parts[0]);
                let q=readLinear(parts[1]);
                let divergence=p.cx+q.cy;
                let curl=q.cx-p.cy;
                let expected=["divergence is zero and curl is zero", "divergence is zero and curl is not zero", "divergence is not zero and curl is zero", "divergence is not zero and curl is not zero"][(divergence===0?0:2)+(curl===0?0:1)];
                if (dto.correct!==expected) failures.push(`${difficulty}/seed${seed}: graded ${JSON.stringify(dto.correct)} but ${JSON.stringify(dto.latex)} computes as ${JSON.stringify(expected)}`);
                else{
                    checked++;
                    graded.add(dto.correct);
                }
            }
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(250);
        expect(Array.from(graded).sort()).toEqual([
            "divergence is not zero and curl is not zero",
            "divergence is not zero and curl is zero",
            "divergence is zero and curl is not zero",
            "divergence is zero and curl is zero"
        ]);
    });
});