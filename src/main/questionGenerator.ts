import { topicRegistry, registerTopic } from "./services/topicRegistry";
import { renderer } from "./core/questionRenderer";
import type { RngFn, QuestionDto } from "../types/global";
let moduleCache: Map<string, any>=new Map();
async function loadModule(scope: string): Promise<any>{
    if (moduleCache.has(scope)){
        return moduleCache.get(scope);
    }
    let mod: any=null;
    switch(scope){
        case "algebra":
            mod=await import("../modules/Algebra/index");
            break;
        case "arithmetic":
            mod=await import("../modules/Arithmetic/index");
            break;
        case "calculus":
            mod=await import("../modules/Calculus/index");
            break;
        case "discrete":
            mod=await import("../modules/DiscreteMathematics/index");
            break;
        case "geometry":
            mod=await import("../modules/Geometry/index");
            break;
        case "linearAlgebra":
            mod=await import("../modules/LinearAlgebra/index");
            break;
        case "trigonometry":
            mod=await import("../modules/Trigonometry/index");
            break;
        default:
            mod=await import("../modules/Algebra/index");
    }
    moduleCache.set(scope, mod);
    return mod;
}
registerTopic("add","arithmetic","generateAddition");
registerTopic("subtrt","arithmetic","generateSubtraction");
registerTopic("mult","arithmetic","generateMultiplication");
registerTopic("divid","arithmetic","generateDivision");
registerTopic("root","algebra","generateRoot");
registerTopic("log","algebra","generateLogarithm");
registerTopic("exp","algebra","generateExponent");
registerTopic("fact","algebra","generateFactorial");
registerTopic("ser","algebra","generateSeries");
registerTopic("real_ops","algebra","generateRealNumberOperations");
registerTopic("cartesian","algebra","generateCartesianConcepts");
registerTopic("circle_eq","algebra","generateCircleEquations");
registerTopic("linear_special","algebra","generateLinearEquationSpecial");
registerTopic("rational_eq","algebra","generateRationalEquation");
registerTopic("poly_ineq","algebra","generatePolynomialInequality");
registerTopic("func_props","algebra","generateFunctionProperties");
registerTopic("basic_funcs","algebra","generateBasicFunctions");
registerTopic("func_ops","algebra","generateFunctionOperations");
registerTopic("inverse_funcs","algebra","generateInverseFunctions");
registerTopic("transformations","algebra","generateTransformations");
registerTopic("power_model","algebra","generatePowerFunctionModeling");
registerTopic("poly_end","algebra","generatePolynomialEndBehavior");
registerTopic("synth_div","algebra","generateSyntheticDivision");
registerTopic("complex_zeros","algebra","generateComplexZeros");
registerTopic("rational_analysis","algebra","generateRationalGraphAnalysis");
registerTopic("logistic","algebra","generateLogisticFunctions");
registerTopic("exp_model","algebra","generateExponentialModeling");
registerTopic("log_model","algebra","generateLogarithmicModeling");
registerTopic("finance","algebra","generateFinance");
registerTopic("fraction","algebra","generateFraction");
registerTopic("percent","algebra","generatePercent");
registerTopic("ratio","algebra","generateRatioProportion");
registerTopic("unit_conv","algebra","generateUnitConversion");
registerTopic("expr_eval","algebra","generateExpressionEvaluation");
registerTopic("number_sets","algebra","generateNumberSets");
registerTopic("properties","algebra","generateProperties");
registerTopic("order_ops","algebra","generateOrderOfOperations");
registerTopic("linear_word","algebra","generateLinearWordProblem");
registerTopic("radical_simplify","algebra","generateRadicalSimplify");
registerTopic("radical_eq","algebra","generateRadicalEquation");
registerTopic("rational_exp","algebra","generateRationalExponents");
registerTopic("exp_rules","algebra","generateExponentRules");
registerTopic("sci_notation","algebra","generateScientificNotation");
registerTopic("complex_basic","algebra","generateComplex");
registerTopic("variation","algebra","generateVariation");
registerTopic("deri","calculus","generateDerivative");
registerTopic("inte","calculus","generateIntegral");
registerTopic("lim","calculus","generateLimit");
registerTopic("relRates","calculus","generateRelatedRates");
registerTopic("limits_continuity","calculus","generateLimitsContinuity");
registerTopic("applications_diff","calculus","generateApplicationsDiff");
registerTopic("integration_advanced","calculus","generateIntegrationAdvanced");
registerTopic("graphical_calculus","calculus","generateGraphicalCalculus");
registerTopic("parametric_polar","calculus","generateParametricPolarVector");
registerTopic("sequences_series","calculus","generateSequencesSeries");
registerTopic("mtrx","linearAlgebra","generateMatrix");
registerTopic("vctr","linearAlgebra","generateVector");
registerTopic("system3x3","linearAlgebra","generateSystem3x3");
registerTopic("row_echelon3x3","linearAlgebra","generateRowEchelon3x3");
registerTopic("partial_fractions","linearAlgebra","generatePartialFractions");
registerTopic("linear_programming","linearAlgebra","generateLinearProgramming");
registerTopic("vector3d","linearAlgebra","generateVector3D");
registerTopic("line3d","linearAlgebra","generateLine3D");
registerTopic("plane3d","linearAlgebra","generatePlane3D");
registerTopic("sin","trigonometry","generateSin");
registerTopic("cos","trigonometry","generateCosine");
registerTopic("tan","trigonometry","generateTangent");
registerTopic("cosec","trigonometry","generateCosecant");
registerTopic("sec","trigonometry","generateSecant");
registerTopic("cot","trigonometry","generateCotangent");
registerTopic("trig_graph","trigonometry","generateTrigGraphs");
registerTopic("deg_to_rad","trigonometry","generateDegreesToRadians");
registerTopic("rad_to_deg","trigonometry","generateRadiansToDegrees");
registerTopic("arc_length","trigonometry","generateArcLength");
registerTopic("angular_speed","trigonometry","generateAngularLinearSpeed");
registerTopic("right_triangle_defs","trigonometry","generateRightTriangleDefs");
registerTopic("special_triangle","trigonometry","generateSpecialTriangle");
registerTopic("elev_dep","trigonometry","generateElevationDepression");
registerTopic("reference_angle","trigonometry","generateReferenceAngle");
registerTopic("astc_sign","trigonometry","generateASTCSign");
registerTopic("sum_diff","trigonometry","generateSumDifference");
registerTopic("double_angle","trigonometry","generateDoubleAngle");
registerTopic("half_angle","trigonometry","generateHalfAngle");
registerTopic("polar_to_rect","trigonometry","generatePolarToRectangular");
registerTopic("rect_to_polar","trigonometry","generateRectangularToPolar");
registerTopic("polar_distance","trigonometry","generatePolarDistance");
registerTopic("polar_graph","trigonometry","generatePolarGraphEquation");
registerTopic("parametric_to_cartesian","trigonometry","generateParametricToCartesian");
registerTopic("parametric_motion","trigonometry","generateParametricMotion");
registerTopic("complex_polar","trigonometry","generateComplexPolarForm");
registerTopic("complex_mult_div","trigonometry","generateComplexMultiplyDivide");
registerTopic("demoivre","trigonometry","generateDeMoivre");
registerTopic("complex_roots","trigonometry","generateComplexRoots");
registerTopic("perm","discrete","generatePermutation");
registerTopic("comb","discrete","generateCombination");
registerTopic("prob","discrete","generateProbability");
registerTopic("stats","discrete","generateStatistics");
registerTopic("arithmetic_sequence","discrete","generateArithmeticSequence");
registerTopic("geometric_sequence","discrete","generateGeometricSequence");
registerTopic("sequence_limit","discrete","generateSequenceLimit");
registerTopic("infinite_series","discrete","generateInfiniteGeometricSeries");
registerTopic("induction","discrete","generateMathematicalInduction");
registerTopic("binomial","discrete","generateBinomialTheorem");
registerTopic("area_circle","geometry","generateAreaCircle");
registerTopic("pythag","geometry","generatePythagorean");
registerTopic("volume_sphere","geometry","generateVolumeSphere");
registerTopic("parabola","geometry","generateParabola");
registerTopic("ellipse","geometry","generateEllipse");
registerTopic("hyperbola","geometry","generateHyperbola");
registerTopic("polar_conics","geometry","generatePolarConic");
registerTopic("coord3d","geometry","generate3DDistanceMidpoint");
registerTopic("sphere_eq","geometry","generateSphereEquation");
registerTopic("line_plane_3d","geometry","generateLinePlane3D");
registerTopic("linear_eq","algebra","generateLinearEquation");
registerTopic("quadratic_eq","algebra","generateQuadraticEquation");
registerTopic("linear_ineq","algebra","generateLinearInequality");
registerTopic("quadratic_ineq","algebra","generateQuadraticInequality");
registerTopic("rational_ineq","algebra","generateRationalInequality");
registerTopic("system2x2","algebra","generateSystem2x2");
registerTopic("poly_ops","algebra","generatePolynomial");
registerTopic("poly_div","algebra","generatePolynomialDivision");
registerTopic("factoring","algebra","generateFactoring");
registerTopic("func_concepts","algebra","generateFunctionConcepts");
registerTopic("linear_graph","algebra","generateLinearGraphing");
registerTopic("nonlinear_graph","algebra","generateNonLinearGraphing");
function isQuestionDto(value: unknown): value is QuestionDto{
	return value!==null&&typeof value==="object"&&typeof (value as QuestionDto).latex==="string";
}
export async function generateQuestion(topicId: string, difficulty: string, rng?: RngFn): Promise<QuestionDto | void>{
    const entry=topicRegistry.getTopic(topicId);
    if (!entry){
        throw new Error("Unknown topic: "+topicId);
    }
    const mod=await loadModule(entry.scope);
    const generator=mod[entry.fn];
    if (!generator){
        throw new Error("Generator function not found: "+entry.fn);
    }
    const result=await generator(difficulty, rng);
    if (isQuestionDto(result)){
        renderer.applyQuestionDto(result);
    }
    return result;
}
export async function generateQuestionDto(topicId: string, difficulty: string, rng?: RngFn): Promise<QuestionDto>{
    const entry=topicRegistry.getTopic(topicId);
    if (!entry){
        throw new Error("Unknown topic: "+topicId);
    }
    const mod=await loadModule(entry.scope);
    const generator=mod[entry.fn];
    if (!generator){
        throw new Error("Generator function not found: "+entry.fn);
    }
    const result=await generator(difficulty, rng);
    if (!isQuestionDto(result)){
        throw new Error("Generator did not return a QuestionDto: "+topicId);
    }
    return result;
}