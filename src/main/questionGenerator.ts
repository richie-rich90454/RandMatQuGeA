import * as dom from "./dom";
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
const topicRegistry: Record<string, {scope: string, fn: string}>={
    add: {scope: "arithmetic", fn: "generateAddition"},
    subtrt: {scope: "arithmetic", fn: "generateSubtraction"},
    mult: {scope: "arithmetic", fn: "generateMultiplication"},
    divid: {scope: "arithmetic", fn: "generateDivision"},
    root: {scope: "algebra", fn: "generateRoot"},
    log: {scope: "algebra", fn: "generateLogarithm"},
    exp: {scope: "algebra", fn: "generateExponent"},
    fact: {scope: "algebra", fn: "generateFactorial"},
    ser: {scope: "algebra", fn: "generateSeries"},
    real_ops: {scope: "algebra", fn: "generateRealNumberOperations"},
    cartesian: {scope: "algebra", fn: "generateCartesianConcepts"},
    circle_eq: {scope: "algebra", fn: "generateCircleEquations"},
    linear_special: {scope: "algebra", fn: "generateLinearEquationSpecial"},
    rational_eq: {scope: "algebra", fn: "generateRationalEquation"},
    poly_ineq: {scope: "algebra", fn: "generatePolynomialInequality"},
    func_props: {scope: "algebra", fn: "generateFunctionProperties"},
    basic_funcs: {scope: "algebra", fn: "generateBasicFunctions"},
    func_ops: {scope: "algebra", fn: "generateFunctionOperations"},
    inverse_funcs: {scope: "algebra", fn: "generateInverseFunctions"},
    transformations: {scope: "algebra", fn: "generateTransformations"},
    power_model: {scope: "algebra", fn: "generatePowerFunctionModeling"},
    poly_end: {scope: "algebra", fn: "generatePolynomialEndBehavior"},
    synth_div: {scope: "algebra", fn: "generateSyntheticDivision"},
    complex_zeros: {scope: "algebra", fn: "generateComplexZeros"},
    rational_analysis: {scope: "algebra", fn: "generateRationalGraphAnalysis"},
    logistic: {scope: "algebra", fn: "generateLogisticFunctions"},
    exp_model: {scope: "algebra", fn: "generateExponentialModeling"},
    log_model: {scope: "algebra", fn: "generateLogarithmicModeling"},
    finance: {scope: "algebra", fn: "generateFinance"},
    fraction: {scope: "algebra", fn: "generateFraction"},
    percent: {scope: "algebra", fn: "generatePercent"},
    ratio: {scope: "algebra", fn: "generateRatioProportion"},
    unit_conv: {scope: "algebra", fn: "generateUnitConversion"},
    expr_eval: {scope: "algebra", fn: "generateExpressionEvaluation"},
    number_sets: {scope: "algebra", fn: "generateNumberSets"},
    properties: {scope: "algebra", fn: "generateProperties"},
    order_ops: {scope: "algebra", fn: "generateOrderOfOperations"},
    linear_word: {scope: "algebra", fn: "generateLinearWordProblem"},
    radical_simplify: {scope: "algebra", fn: "generateRadicalSimplify"},
    radical_eq: {scope: "algebra", fn: "generateRadicalEquation"},
    rational_exp: {scope: "algebra", fn: "generateRationalExponents"},
    exp_rules: {scope: "algebra", fn: "generateExponentRules"},
    sci_notation: {scope: "algebra", fn: "generateScientificNotation"},
    complex_basic: {scope: "algebra", fn: "generateComplex"},
    variation: {scope: "algebra", fn: "generateVariation"},
    deri: {scope: "calculus", fn: "generateDerivative"},
    inte: {scope: "calculus", fn: "generateIntegral"},
    lim: {scope: "calculus", fn: "generateLimit"},
    relRates: {scope: "calculus", fn: "generateRelatedRates"},
    limits_continuity: {scope: "calculus", fn: "generateLimitsContinuity"},
    applications_diff: {scope: "calculus", fn: "generateApplicationsDiff"},
    integration_advanced: {scope: "calculus", fn: "generateIntegrationAdvanced"},
    graphical_calculus: {scope: "calculus", fn: "generateGraphicalCalculus"},
    parametric_polar: {scope: "calculus", fn: "generateParametricPolarVector"},
    sequences_series: {scope: "calculus", fn: "generateSequencesSeries"},
    mtrx: {scope: "linearAlgebra", fn: "generateMatrix"},
    vctr: {scope: "linearAlgebra", fn: "generateVector"},
    system3x3: {scope: "linearAlgebra", fn: "generateSystem3x3"},
    row_echelon3x3: {scope: "linearAlgebra", fn: "generateRowEchelon3x3"},
    partial_fractions: {scope: "linearAlgebra", fn: "generatePartialFractions"},
    linear_programming: {scope: "linearAlgebra", fn: "generateLinearProgramming"},
    vector3d: {scope: "linearAlgebra", fn: "generateVector3D"},
    line3d: {scope: "linearAlgebra", fn: "generateLine3D"},
    plane3d: {scope: "linearAlgebra", fn: "generatePlane3D"},
    sin: {scope: "trigonometry", fn: "generateSin"},
    cos: {scope: "trigonometry", fn: "generateCosine"},
    tan: {scope: "trigonometry", fn: "generateTangent"},
    cosec: {scope: "trigonometry", fn: "generateCosecant"},
    sec: {scope: "trigonometry", fn: "generateSecant"},
    cot: {scope: "trigonometry", fn: "generateCotangent"},
    trig_graph: {scope: "trigonometry", fn: "generateTrigGraphs"},
    deg_to_rad: {scope: "trigonometry", fn: "generateDegreesToRadians"},
    rad_to_deg: {scope: "trigonometry", fn: "generateRadiansToDegrees"},
    arc_length: {scope: "trigonometry", fn: "generateArcLength"},
    angular_speed: {scope: "trigonometry", fn: "generateAngularLinearSpeed"},
    right_triangle_defs: {scope: "trigonometry", fn: "generateRightTriangleDefs"},
    special_triangle: {scope: "trigonometry", fn: "generateSpecialTriangle"},
    elev_dep: {scope: "trigonometry", fn: "generateElevationDepression"},
    reference_angle: {scope: "trigonometry", fn: "generateReferenceAngle"},
    astc_sign: {scope: "trigonometry", fn: "generateASTCSign"},
    sum_diff: {scope: "trigonometry", fn: "generateSumDifference"},
    double_angle: {scope: "trigonometry", fn: "generateDoubleAngle"},
    half_angle: {scope: "trigonometry", fn: "generateHalfAngle"},
    polar_to_rect: {scope: "trigonometry", fn: "generatePolarToRectangular"},
    rect_to_polar: {scope: "trigonometry", fn: "generateRectangularToPolar"},
    polar_distance: {scope: "trigonometry", fn: "generatePolarDistance"},
    polar_graph: {scope: "trigonometry", fn: "generatePolarGraphEquation"},
    parametric_to_cartesian: {scope: "trigonometry", fn: "generateParametricToCartesian"},
    parametric_motion: {scope: "trigonometry", fn: "generateParametricMotion"},
    complex_polar: {scope: "trigonometry", fn: "generateComplexPolarForm"},
    complex_mult_div: {scope: "trigonometry", fn: "generateComplexMultiplyDivide"},
    demoivre: {scope: "trigonometry", fn: "generateDeMoivre"},
    complex_roots: {scope: "trigonometry", fn: "generateComplexRoots"},
    perm: {scope: "discrete", fn: "generatePermutation"},
    comb: {scope: "discrete", fn: "generateCombination"},
    prob: {scope: "discrete", fn: "generateProbability"},
    stats: {scope: "discrete", fn: "generateStatistics"},
    arithmetic_sequence: {scope: "discrete", fn: "generateArithmeticSequence"},
    geometric_sequence: {scope: "discrete", fn: "generateGeometricSequence"},
    sequence_limit: {scope: "discrete", fn: "generateSequenceLimit"},
    infinite_series: {scope: "discrete", fn: "generateInfiniteGeometricSeries"},
    induction: {scope: "discrete", fn: "generateMathematicalInduction"},
    binomial: {scope: "discrete", fn: "generateBinomialTheorem"},
    area_circle: {scope: "geometry", fn: "generateAreaCircle"},
    pythag: {scope: "geometry", fn: "generatePythagorean"},
    volume_sphere: {scope: "geometry", fn: "generateVolumeSphere"},
    parabola: {scope: "geometry", fn: "generateParabola"},
    ellipse: {scope: "geometry", fn: "generateEllipse"},
    hyperbola: {scope: "geometry", fn: "generateHyperbola"},
    polar_conics: {scope: "geometry", fn: "generatePolarConic"},
    coord3d: {scope: "geometry", fn: "generate3DDistanceMidpoint"},
    sphere_eq: {scope: "geometry", fn: "generateSphereEquation"},
    line_plane_3d: {scope: "geometry", fn: "generateLinePlane3D"},
    linear_eq: {scope: "algebra", fn: "generateLinearEquation"},
    quadratic_eq: {scope: "algebra", fn: "generateQuadraticEquation"},
    linear_ineq: {scope: "algebra", fn: "generateLinearInequality"},
    quadratic_ineq: {scope: "algebra", fn: "generateQuadraticInequality"},
    rational_ineq: {scope: "algebra", fn: "generateRationalInequality"},
    system2x2: {scope: "algebra", fn: "generateSystem2x2"},
    poly_ops: {scope: "algebra", fn: "generatePolynomial"},
    poly_div: {scope: "algebra", fn: "generatePolynomialDivision"},
    factoring: {scope: "algebra", fn: "generateFactoring"},
    func_concepts: {scope: "algebra", fn: "generateFunctionConcepts"},
    linear_graph: {scope: "algebra", fn: "generateLinearGraphing"},
    nonlinear_graph: {scope: "algebra", fn: "generateNonLinearGraphing"},
};
export async function generateQuestion(topicId: string, difficulty: string): Promise<void>{
    const entry=topicRegistry[topicId];
    if (entry){
        const mod=await loadModule(entry.scope);
        const generator=mod[entry.fn];
        if (generator){
            generator(difficulty);
        }
    }
    else{
        if (dom.questionArea) dom.questionArea.innerHTML=`<div class="empty-state"><p>Unknown topic</p></div>`;
    }
}