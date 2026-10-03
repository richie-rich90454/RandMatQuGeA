/**
 * @vitest-environment jsdom
 * @file The contract every Geometry and Linear Algebra generator added in this pass
 * must satisfy, checked against the generators themselves rather than the registry.
 * @description Four things are asserted for each of the twenty-one topics: that every
 * declared sub-skill branch is reachable, that the option set is four options with
 * the key among them and nothing repeated by value, that the prompt is a
 * well-formed question whose LaTeX renders, and that the multiple-choice validator
 * finds nothing across a wide sweep of seeds and all three difficulties.
 *
 * The sweep is deliberately wider than the oracle's eight seeds per difficulty,
 * because every branch-specific defect this file is here to catch lives in a
 * particular branch at a particular seed rather than in the topic as a whole.
 */
import{describe,it,expect}from"vitest";
import{seededRng}from"../../main/core/Rng";
import{canonicaliseNumeric}from"../oracle/Exact";
import{validateMcq}from"../oracle/Mcq";
import{validateQuestionLatex}from"../oracle/Latex";
import{isWellFormed, isFiniteNumericAnswer}from"../oracle/Symbolic";
import type{QuestionDto}from"../../types/global";
import{generateTriangleCongruence}from"../../modules/Geometry/GenerateTriangleCongruence";
import{generateTriangleInequality}from"../../modules/Geometry/GenerateTriangleInequality";
import{generateTriangleArea}from"../../modules/Geometry/GenerateTriangleArea";
import{generateQuadrilateralArea}from"../../modules/Geometry/GenerateQuadrilateralArea";
import{generatePolygonAngles}from"../../modules/Geometry/GeneratePolygonAngles";
import{generateSurfaceArea}from"../../modules/Geometry/GenerateSurfaceArea";
import{generateCompositeFigures}from"../../modules/Geometry/GenerateCompositeFigures";
import{generateRegularPolygons}from"../../modules/Geometry/GenerateRegularPolygons";
import{generateMidsegments}from"../../modules/Geometry/GenerateMidsegments";
import{generateAngleBisector}from"../../modules/Geometry/GenerateAngleBisector";
import{generateVolumeSolids}from"../../modules/Geometry/GenerateVolumeSolids";
import{generateDeterminants}from"../../modules/LinearAlgebra/GenerateDeterminants";
import{generateCramersRule}from"../../modules/LinearAlgebra/GenerateCramersRule";
import{generateRank}from"../../modules/LinearAlgebra/GenerateRank";
import{generateNullSpace}from"../../modules/LinearAlgebra/GenerateNullSpace";
import{generateLuDecomposition}from"../../modules/LinearAlgebra/GenerateLuDecomposition";
import{generateMatrixTransformations}from"../../modules/LinearAlgebra/GenerateMatrixTransformations";
import{generateBasisCoordinates}from"../../modules/LinearAlgebra/GenerateBasisCoordinates";
import{generateLinearIndependence}from"../../modules/LinearAlgebra/GenerateLinearIndependence";
import{generateLeastSquares}from"../../modules/LinearAlgebra/GenerateLeastSquares";
import{generateSymmetricMatrices}from"../../modules/LinearAlgebra/GenerateSymmetricMatrices";

/** Every topic under test, with the exact sub-skill branches it declares. */
const GENERATORS: [string, string[], (difficulty?: string, rng?: ()=>number)=>QuestionDto][]=[
    ["triangle_congruence", ["sss", "sas", "asa", "aas", "hypotenuse_leg", "not_congruent"], generateTriangleCongruence],
    ["triangle_inequality", ["check_a_triple", "the_longest_side", "the_strict_inequality", "can_it_be_built"], generateTriangleInequality],
    ["triangle_area", ["base_and_height", "herons_formula", "missing_side", "a_composite_triangle"], generateTriangleArea],
    ["quadrilateral_area", ["rectangle", "parallelogram", "rhombus", "trapezoid"], generateQuadrilateralArea],
    ["polygon_angles", ["sum_of_interior_angles", "one_interior_angle", "exterior_turn_angle", "a_regular_polygon"], generatePolygonAngles],
    ["surface_area", ["right_prism", "cylinder", "cone", "sphere_and_hemisphere", "pyramid"], generateSurfaceArea],
    ["composite_figures", ["rectangle_plus_rectangle", "rectangle_plus_triangle", "rectangle_minus_a_hole", "a_shaded_border"], generateCompositeFigures],
    ["regular_polygons", ["apothem", "perimeter", "area", "sides_from_an_angle"], generateRegularPolygons],
    ["midsegments", ["midsegment_length", "the_parallel_line", "perimeter_ratio", "the_medial_triangle"], generateMidsegments],
    ["angle_bisector", ["bisector_length", "how_it_splits_the_opposite_side", "perpendicular_bisector", "equidistant_points"], generateAngleBisector],
    ["volume_solids", ["rectangular_prism", "triangular_prism", "cylinder", "cone_and_pyramid", "composite_solid"], generateVolumeSolids],
    ["determinants", ["two_by_two", "three_by_three", "cofactor_expansion", "properties_that_give_zero"], generateDeterminants],
    ["cramers_rule", ["two_by_two", "three_by_three", "when_the_determinant_is_zero", "compare_with_row_echelon"], generateCramersRule],
    ["rank", ["find_the_rank", "pivot_columns", "rank_from_row_echelon", "independent_columns"], generateRank],
    ["null_space", ["a_null_vector", "basis_of_the_null_space", "rank_nullity", "the_homogeneous_system"], generateNullSpace],
    ["lu_decomposition", ["without_pivoting", "with_row_swaps", "determinant_from_the_factors", "solve_using_the_factors"], generateLuDecomposition],
    ["matrix_transformations", ["image_of_a_vector", "image_of_a_basis", "rotation_matrix", "scaling_and_reflection"], generateMatrixTransformations],
    ["basis_coordinates", ["is_it_a_basis", "coordinates_in_a_basis", "change_of_basis", "the_standard_basis"], generateBasisCoordinates],
    ["linear_independence", ["linear_combination", "dependent_set", "the_basis_test", "dimension"], generateLinearIndependence],
    ["least_squares", ["projection_of_a_point", "the_normal_equations", "best_fit_line", "the_residual"], generateLeastSquares],
    ["symmetric_matrices", ["check_symmetry", "repeated_eigenvalues", "orthogonal_diagonalisation", "quadratic_form"], generateSymmetricMatrices]
];

/** The difficulties every topic is swept at. */
const DIFFICULTIES=["easy", "medium", "hard"];

/** How many seeds the branch-reachability and option-set sweeps run over. */
const REACH_SEEDS=300;

/** How many seeds per difficulty the multiple-choice sweep runs over. */
const MCQ_SEEDS=120;

/**
 * The identity an option is compared by, so that two spellings of one number are one
 * option and a genuine repeat is caught.
 *
 * @param option - The option text.
 * @returns The value key.
 */
function optionIdentity(option: string): string{
    return canonicaliseNumeric(option.trim().toLowerCase());
}

/**
 * Collects the questions a generator produces, so that a sweep can assert about all
 * of them at once and report the seed that produced a failure.
 *
 * @param generate - The generator to drive.
 * @param seeds - How many seeds to draw.
 * @returns Every question produced, with the seed and difficulty that produced it.
 */
function sweep(generate: (difficulty?: string, rng?: ()=>number)=>QuestionDto, seeds: number): {difficulty: string, seed: number, dto: QuestionDto}[]{
    let out: {difficulty: string, seed: number, dto: QuestionDto}[]=[];
    for(let difficulty of DIFFICULTIES){
        for(let seed=1; seed<=seeds; seed++){
            out.push({difficulty, seed, dto: generate(difficulty, seededRng(seed))});
        }
    }
    return out;
}

describe("branch coverage",()=>{
    for(let [topic, branches, generate] of GENERATORS){
        it(`${topic} reaches exactly its declared sub-skills`,()=>{
            let seen=new Set<string>();
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=REACH_SEEDS; seed++){
                    seen.add(generate(difficulty, seededRng(seed)).subskill||"(none)");
                }
            }
            expect(Array.from(seen).sort()).toEqual(branches.slice().sort());
        });
    }
});

describe("option sets",()=>{
    for(let [topic, , generate] of GENERATORS){
        it(`${topic} offers four options, the key among them, and nothing repeated`,()=>{
            let failures:string[]=[];
            for(let {difficulty, seed, dto} of sweep(generate, REACH_SEEDS)){
                let choices=dto.choices||[];
                if (choices.length!==4){
                    failures.push(`${topic}/${difficulty}/seed${seed}: ${choices.length} option(s) for ${JSON.stringify(dto.correct)}`);
                    continue;
                }
                let keys=choices.filter(option=>option===dto.correct);
                if (keys.length!==1){
                    failures.push(`${topic}/${difficulty}/seed${seed}: ${keys.length} of the options are the key ${JSON.stringify(dto.correct)}`);
                }
                let seen=new Map<string, string>();
                for(let option of choices){
                    let identity=optionIdentity(option);
                    let earlier=seen.get(identity);
                    if (earlier!==undefined){
                        failures.push(`${topic}/${difficulty}/seed${seed}: ${JSON.stringify(option)} repeats ${JSON.stringify(earlier)} by value`);
                    }
                    seen.set(identity, option);
                }
            }
            expect(failures).toEqual([]);
        }, 60000);
    }
});

describe("prompts",()=>{
    for(let [topic, , generate] of GENERATORS){
        it(`${topic} is well formed and its prompt renders as valid LaTeX`,()=>{
            let failures:string[]=[];
            for(let {difficulty, seed, dto} of sweep(generate, REACH_SEEDS)){
                if (!isWellFormed(dto)){
                    failures.push(`${topic}/${difficulty}/seed${seed}: ${JSON.stringify({latex: dto.latex, correct: dto.correct})}`);
                    continue;
                }
                for(let finding of validateQuestionLatex(dto)){
                    failures.push(`${topic}/${difficulty}/seed${seed}: ${finding.code}: ${finding.message}`);
                }
            }
            expect(failures).toEqual([]);
        }, 60000);
    }
});

describe("multiple choice",()=>{
    for(let [topic, , generate] of GENERATORS){
        it(`${topic} passes the option-set validator at every difficulty`,async()=>{
            let failures:string[]=[];
            for(let {difficulty, seed, dto} of sweep(generate, MCQ_SEEDS)){
                for(let finding of await validateMcq(dto)){
                    failures.push(`${topic}/${difficulty}/seed${seed}: ${finding.code}: ${finding.message}`);
                }
            }
            expect(failures).toEqual([]);
        }, 600000);
    }
});

describe("help",()=>{
    for(let [topic, branches, generate] of GENERATORS){
        it(`${topic} gives every branch its own first hint and a worked solution`,()=>{
            let failures:string[]=[];
            let openers=new Map<string, Set<string>>();
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=60; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    let branch=dto.subskill||"(none)";
                    let rungs=dto.hints?.rungs||[];
                    if (rungs.length<2){
                        failures.push(`${topic}/${branch}/${difficulty}/seed${seed}: the question carries fewer than two rungs`);
                        continue;
                    }
                    if ((dto.hints?.concede||"").indexOf(dto.correct)<0){
                        failures.push(`${topic}/${branch}/${difficulty}/seed${seed}: the concession does not give the answer`);
                    }
                    // A rung is allowed to name the procedure, and a procedure for a numeric branch
// names numbers. Only a word answer is checked here, because only there can the
// first rung quote the answer verbatim.
if (!isFiniteNumericAnswer(dto.correct)&&(rungs[0] as string).indexOf(dto.correct)>=0){
                        failures.push(`${topic}/${branch}/${difficulty}/seed${seed}: the first rung gives the answer ${JSON.stringify(dto.correct)} away`);
                    }
                    let steps=dto.solution||[];
                    if (steps.length===0){
                        failures.push(`${topic}/${branch}/${difficulty}/seed${seed}: the question carries no worked solution`);
                        continue;
                    }
                    let last=(steps[steps.length-1] as string).replace(/\.$/, "").trim();
                    if (last.indexOf(dto.correct)<0){
                        failures.push(`${topic}/${branch}/${difficulty}/seed${seed}: the last step ${JSON.stringify(last)} does not name the key ${JSON.stringify(dto.correct)}`);
                    }
                    let byBranch=openers.get(branch);
                    if (!byBranch){
                        byBranch=new Set<string>();
                        openers.set(branch, byBranch);
                    }
                    byBranch.add(rungs[0] as string);
                }
            }
            expect(failures).toEqual([]);
            expect(Array.from(openers.keys()).sort()).toEqual(branches.slice().sort());
            let names=Array.from(openers.keys());
            for(let i=0; i<names.length; i++){
                for(let j=i+1; j<names.length; j++){
                    let left=openers.get(names[i] as string) as Set<string>;
                    let right=openers.get(names[j] as string) as Set<string>;
                    let shared=Array.from(left).filter(opener=>right.has(opener));
                    expect(shared).toEqual([]);
                }
            }
        }, 60000);
    }
});