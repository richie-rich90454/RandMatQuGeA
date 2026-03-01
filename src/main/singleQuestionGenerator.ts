import * as Algebra from "../modules/Algebra/index";
import * as Arithmetic from "../modules/Arithmetic/index";
import * as Calculus from "../modules/Calculus/index";
import * as DiscreteMathematics from "../modules/DiscreteMathematics/index";
import * as LinearAlgebra from "../modules/LinearAlgebra/index";
import * as Trigonometry from "../modules/Trigonometry/index";
import * as Geometry from "../modules/Geometry/index";
import * as dom from "./dom";
export function generateSingleQuestion(topicId: string, difficulty: string): void {
	switch (topicId){
		case "add":
			Arithmetic.generateAddition();
			break;
		case "subtrt":
			Arithmetic.generateSubtraction();
			break;
		case "mult":
			Arithmetic.generateMultiplication();
			break;
		case "divid":
			Arithmetic.generateDivision();
			break;
		case "root":
			Algebra.generateRoot(difficulty);
			break;
		case "log":
			Algebra.generateLogarithm(difficulty);
			break;
		case "exp":
			Algebra.generateExponent(difficulty);
			break;
		case "fact":
			Algebra.generateFactorial(difficulty);
			break;
		case "ser":
			Algebra.generateSeries(difficulty);
			break;
		case "real_ops":
			Algebra.generateRealNumberOperations(difficulty);
			break;
		case "cartesian":
			Algebra.generateCartesianConcepts(difficulty);
			break;
		case "circle_eq":
			Algebra.generateCircleEquations(difficulty);
			break;
		case "linear_special":
			Algebra.generateLinearEquationSpecial(difficulty);
			break;
		case "rational_eq":
			Algebra.generateRationalEquation(difficulty);
			break;
		case "poly_ineq":
			Algebra.generatePolynomialInequality(difficulty);
			break;
		case "func_props":
			Algebra.generateFunctionProperties(difficulty);
			break;
		case "basic_funcs":
			Algebra.generateBasicFunctions();
			break;
		case "func_ops":
			Algebra.generateFunctionOperations(difficulty);
			break;
		case "inverse_funcs":
			Algebra.generateInverseFunctions(difficulty);
			break;
		case "transformations":
			Algebra.generateTransformations(difficulty);
			break;
		case "power_model":
			Algebra.generatePowerFunctionModeling(difficulty);
			break;
		case "poly_end":
			Algebra.generatePolynomialEndBehavior(difficulty);
			break;
		case "synth_div":
			Algebra.generateSyntheticDivision(difficulty);
			break;
		case "complex_zeros":
			Algebra.generateComplexZeros(difficulty);
			break;
		case "rational_analysis":
			Algebra.generateRationalGraphAnalysis(difficulty);
			break;
		case "logistic":
			Algebra.generateLogisticFunctions(difficulty);
			break;
		case "exp_model":
			Algebra.generateExponentialModeling(difficulty);
			break;
		case "log_model":
			Algebra.generateLogarithmicModeling();
			break;
		case "finance":
			Algebra.generateFinance();
			break;
		case "deri":
			Calculus.generateDerivative(difficulty);
			break;
		case "inte":
			Calculus.generateIntegral(difficulty);
			break;
		case "lim":
			Calculus.generateLimit(difficulty);
			break;
		case "relRates":
			Calculus.generateRelatedRates(difficulty);
			break;
		case "mtrx":
			LinearAlgebra.generateMatrix(difficulty);
			break;
		case "vctr":
			LinearAlgebra.generateVector(difficulty);
			break;
		case "system3x3":
			LinearAlgebra.generateSystem3x3(difficulty);
			break;
		case "row_echelon3x3":
			LinearAlgebra.generateRowEchelon3x3(difficulty);
			break;
		case "partial_fractions":
			LinearAlgebra.generatePartialFractions(difficulty);
			break;
		case "linear_programming":
			LinearAlgebra.generateLinearProgramming(difficulty);
			break;
		case "vector3d":
			LinearAlgebra.generateVector3D(difficulty);
			break;
		case "line3d":
			LinearAlgebra.generateLine3D(difficulty);
			break;
		case "plane3d":
			LinearAlgebra.generatePlane3D(difficulty);
			break;
		case "sin":
			Trigonometry.generateSin(difficulty);
			break;
		case "cos":
			Trigonometry.generateCosine(difficulty);
			break;
		case "tan":
			Trigonometry.generateTangent(difficulty);
			break;
		case "cosec":
			Trigonometry.generateCosecant(difficulty);
			break;
		case "sec":
			Trigonometry.generateSecant(difficulty);
			break;
		case "cot":
			Trigonometry.generateCotangent(difficulty);
			break;
		case "trig_graph":
			Trigonometry.generateTrigGraphs(difficulty);
			break;
		case "deg_to_rad":
			Trigonometry.generateDegreesToRadians(difficulty);
			break;
		case "rad_to_deg":
			Trigonometry.generateRadiansToDegrees(difficulty);
			break;
		case "arc_length":
			Trigonometry.generateArcLength(difficulty);
			break;
		case "angular_speed":
			Trigonometry.generateAngularLinearSpeed(difficulty);
			break;
		case "right_triangle_defs":
			Trigonometry.generateRightTriangleDefs(difficulty);
			break;
		case "special_triangle":
			Trigonometry.generateSpecialTriangle(difficulty);
			break;
		case "elev_dep":
			Trigonometry.generateElevationDepression(difficulty);
			break;
		case "reference_angle":
			Trigonometry.generateReferenceAngle(difficulty);
			break;
		case "astc_sign":
			Trigonometry.generateASTCSign(difficulty);
			break;
		case "sum_diff":
			Trigonometry.generateSumDifference(difficulty);
			break;
		case "double_angle":
			Trigonometry.generateDoubleAngle(difficulty);
			break;
		case "half_angle":
			Trigonometry.generateHalfAngle(difficulty);
			break;
		case "polar_to_rect":
			Trigonometry.generatePolarToRectangular(difficulty);
			break;
		case "rect_to_polar":
			Trigonometry.generateRectangularToPolar(difficulty);
			break;
		case "polar_distance":
			Trigonometry.generatePolarDistance(difficulty);
			break;
		case "polar_graph":
			Trigonometry.generatePolarGraphEquation(difficulty);
			break;
		case "parametric_to_cartesian":
			Trigonometry.generateParametricToCartesian(difficulty);
			break;
		case "parametric_motion":
			Trigonometry.generateParametricMotion(difficulty);
			break;
		case "complex_polar":
			Trigonometry.generateComplexPolarForm(difficulty);
			break;
		case "complex_mult_div":
			Trigonometry.generateComplexMultiplyDivide(difficulty);
			break;
		case "demoivre":
			Trigonometry.generateDeMoivre(difficulty);
			break;
		case "complex_roots":
			Trigonometry.generateComplexRoots(difficulty);
			break;
		case "perm":
			DiscreteMathematics.generatePermutation(difficulty);
			break;
		case "comb":
			DiscreteMathematics.generateCombination(difficulty);
			break;
		case "prob":
			DiscreteMathematics.generateProbability(difficulty);
			break;
		case "stats":
			DiscreteMathematics.generateStatistics(difficulty);
			break;
		case "arithmetic_sequence":
			DiscreteMathematics.generateArithmeticSequence(difficulty);
			break;
		case "geometric_sequence":
			DiscreteMathematics.generateGeometricSequence(difficulty);
			break;
		case "sequence_limit":
			DiscreteMathematics.generateSequenceLimit(difficulty);
			break;
		case "infinite_series":
			DiscreteMathematics.generateInfiniteGeometricSeries(difficulty);
			break;
		case "induction":
			DiscreteMathematics.generateMathematicalInduction(difficulty);
			break;
		case "binomial":
			DiscreteMathematics.generateBinomialTheorem(difficulty);
			break;
		case "area_circle":
			Geometry.generateAreaCircle(difficulty);
			break;
		case "pythag":
			Geometry.generatePythagorean(difficulty);
			break;
		case "volume_sphere":
			Geometry.generateVolumeSphere(difficulty);
			break;
		case "parabola":
			Geometry.generateParabola(difficulty);
			break;
		case "ellipse":
			Geometry.generateEllipse(difficulty);
			break;
		case "hyperbola":
			Geometry.generateHyperbola(difficulty);
			break;
		case "polar_conics":
			Geometry.generatePolarConic(difficulty);
			break;
		case "coord3d":
			Geometry.generate3DDistanceMidpoint(difficulty);
			break;
		case "sphere_eq":
			Geometry.generateSphereEquation(difficulty);
			break;
		case "line_plane_3d":
			Geometry.generateLinePlane3D(difficulty);
			break;
		default:
			if (dom.questionArea) dom.questionArea.innerHTML=`<div class="empty-state"><p>Please select a topic to generate a question</p></div>`;
			return;
	}
}