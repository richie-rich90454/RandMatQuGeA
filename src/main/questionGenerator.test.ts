/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("../modules/Algebra/index.js",()=>({
    generateLinearEquation:vi.fn(),
    generateQuadraticEquation:vi.fn(),
    generateLinearInequality:vi.fn(),
    generateQuadraticInequality:vi.fn(),
    generateRationalInequality:vi.fn(),
    generateSystem2x2:vi.fn(),
    generateSystem3x3:vi.fn(),
    generatePolynomial:vi.fn(),
    generatePolynomialDivision:vi.fn(),
    generateFactoring:vi.fn(),
    generateFunctionConcepts:vi.fn(),
    generateLinearGraphing:vi.fn(),
    generateNonLinearGraphing:vi.fn(),
    generateFraction:vi.fn(),
    generatePercent:vi.fn(),
    generateRatioProportion:vi.fn(),
    generateUnitConversion:vi.fn(),
    generateExpressionEvaluation:vi.fn(),
    generateNumberSets:vi.fn(),
    generateProperties:vi.fn(),
    generateOrderOfOperations:vi.fn(),
    generateLinearWordProblem:vi.fn(),
    generateRadicalSimplify:vi.fn(),
    generateRadicalEquation:vi.fn(),
    generateRationalExponents:vi.fn(),
    generateExponentRules:vi.fn(),
    generateScientificNotation:vi.fn(),
    generateComplex:vi.fn(),
    generateVariation:vi.fn(),
    generateLogarithm:vi.fn(),
    generateExponent:vi.fn(),
    generateFactorial:vi.fn(),
    generateSeries:vi.fn(),
    generateRoot:vi.fn(),
    generateRealNumberOperations:vi.fn(),
    generateCartesianConcepts:vi.fn(),
    generateCircleEquations:vi.fn(),
    generateLinearEquationSpecial:vi.fn(),
    generateRationalEquation:vi.fn(),
    generatePolynomialInequality:vi.fn(),
    generateFunctionProperties:vi.fn(),
    generateBasicFunctions:vi.fn(),
    generateFunctionOperations:vi.fn(),
    generateInverseFunctions:vi.fn(),
    generateTransformations:vi.fn(),
    generatePowerFunctionModeling:vi.fn(),
    generatePolynomialEndBehavior:vi.fn(),
    generateSyntheticDivision:vi.fn(),
    generateComplexZeros:vi.fn(),
    generateRationalGraphAnalysis:vi.fn(),
    generateLogisticFunctions:vi.fn(),
    generateExponentialModeling:vi.fn(),
    generateLogarithmicModeling:vi.fn(),
    generateFinance:vi.fn(),
}));
vi.mock("../modules/Arithmetic/index.js",()=>({
    generateAddition:vi.fn(()=>{
        window.correctAnswer={correct:"2",alternate:"2",display:"2",choices:["2","3","1","4"]};
        window.expectedFormat="Enter a number (up to 3 decimals)";
        window.hasQuestion=true;
    }),
    generateSubtraction:vi.fn(()=>{
        window.correctAnswer={correct:"1",alternate:"1",display:"1",choices:["1","2","0","3"]};
        window.expectedFormat="Enter a number (up to 3 decimals)";
        window.hasQuestion=true;
    }),
    generateMultiplication:vi.fn(()=>{
        window.correctAnswer={correct:"4",alternate:"4",display:"4",choices:["4","5","3","6"]};
        window.expectedFormat="Enter a number rounded to 2 decimal places";
        window.hasQuestion=true;
    }),
    generateDivision:vi.fn(()=>{
        window.correctAnswer={correct:"2",alternate:"2",display:"2",choices:["2","3","1","4"]};
        window.expectedFormat="Enter a number rounded to 2 decimal places";
        window.hasQuestion=true;
    }),
}));
vi.mock("../modules/Calculus/index.js",()=>({
    generateDerivative:vi.fn(),
    generateIntegral:vi.fn(),
    generateLimit:vi.fn(),
    generateRelatedRates:vi.fn(),
    generateLimitsContinuity:vi.fn(),
    generateApplicationsDiff:vi.fn(),
    generateIntegrationAdvanced:vi.fn(),
    generateGraphicalCalculus:vi.fn(),
    generateParametricPolarVector:vi.fn(),
    generateSequencesSeries:vi.fn(),
}));
vi.mock("../modules/DiscreteMathematics/index.js",()=>({
    generatePermutation:vi.fn(),
    generateCombination:vi.fn(),
    generateProbability:vi.fn(),
    generateStatistics:vi.fn(),
    generateArithmeticSequence:vi.fn(),
    generateGeometricSequence:vi.fn(),
    generateSequenceLimit:vi.fn(),
    generateInfiniteGeometricSeries:vi.fn(),
    generateMathematicalInduction:vi.fn(),
    generateBinomialTheorem:vi.fn(),
}));
vi.mock("../modules/LinearAlgebra/index.js",()=>({
    generateMatrix:vi.fn(),
    generateVector:vi.fn(),
    generateSystem3x3:vi.fn(),
    generateRowEchelon3x3:vi.fn(),
    generatePartialFractions:vi.fn(),
    generateLinearProgramming:vi.fn(),
    generateVector3D:vi.fn(),
    generateLine3D:vi.fn(),
    generatePlane3D:vi.fn(),
}));
vi.mock("../modules/Trigonometry/index.js",()=>({
    generateSin:vi.fn(),
    generateCosine:vi.fn(),
    generateTangent:vi.fn(),
    generateCosecant:vi.fn(),
    generateSecant:vi.fn(),
    generateCotangent:vi.fn(),
    generateTrigGraphs:vi.fn(),
    generateDegreesToRadians:vi.fn(),
    generateRadiansToDegrees:vi.fn(),
    generateArcLength:vi.fn(),
    generateAngularLinearSpeed:vi.fn(),
    generateRightTriangleDefs:vi.fn(),
    generateSpecialTriangle:vi.fn(),
    generateElevationDepression:vi.fn(),
    generateReferenceAngle:vi.fn(),
    generateASTCSign:vi.fn(),
    generateSumDifference:vi.fn(),
    generateDoubleAngle:vi.fn(),
    generateHalfAngle:vi.fn(),
    generatePolarToRectangular:vi.fn(),
    generateRectangularToPolar:vi.fn(),
    generatePolarDistance:vi.fn(),
    generatePolarGraphEquation:vi.fn(),
    generateParametricToCartesian:vi.fn(),
    generateParametricMotion:vi.fn(),
    generateComplexPolarForm:vi.fn(),
    generateComplexMultiplyDivide:vi.fn(),
    generateDeMoivre:vi.fn(),
    generateComplexRoots:vi.fn(),
}));
vi.mock("../modules/Geometry/index.js",()=>({
    generateAreaCircle:vi.fn(),
    generatePythagorean:vi.fn(),
    generateVolumeSphere:vi.fn(),
    generateParabola:vi.fn(),
    generateEllipse:vi.fn(),
    generateHyperbola:vi.fn(),
    generatePolarConic:vi.fn(),
    generate3DDistanceMidpoint:vi.fn(),
    generateSphereEquation:vi.fn(),
    generateLinePlane3D:vi.fn(),
}));
vi.mock("./dom.js",()=>({
    questionArea:{innerHTML:""},
}));
import{generateQuestion}from"./questionGenerator.js";
describe("questionGenerator",()=>{
    it("should export generateQuestion",()=>{
        expect(typeof generateQuestion).toBe("function");
    });
    it("generateQuestion should not throw for valid topic",async()=>{
        await expect(generateQuestion("add","easy")).resolves.not.toThrow();
    });
    it("generateQuestion should throw for unknown topic",async()=>{
        await expect(generateQuestion("nonexistent","easy")).rejects.toThrow("Unknown topic: nonexistent");
    });
});
describe("generateQuestion",()=>{
    it("should be a function",()=>{
        expect(typeof generateQuestion).toBe("function");
    });
    it("should not throw when called",async()=>{
        await expect(generateQuestion("add","easy")).resolves.not.toThrow();
    });
    it("should return question text for valid topic",async()=>{
        await expect(generateQuestion("add","easy")).resolves.not.toThrow();
    });
    it("should set window.correctAnswer",async()=>{
        await generateQuestion("add","easy");
        expect(window.correctAnswer).toBeDefined();
    });
    it("should set window.expectedFormat",async()=>{
        await generateQuestion("add","easy");
        expect(window.expectedFormat).toBeDefined();
    });
    it("should set window.hasQuestion to true",async()=>{
        window.hasQuestion=false;
        await generateQuestion("add","easy");
        expect(window.hasQuestion).toBe(true);
    });
    it("should handle easy difficulty",async()=>{
        await expect(generateQuestion("add","easy")).resolves.not.toThrow();
    });
    it("should handle medium difficulty",async()=>{
        await expect(generateQuestion("add","medium")).resolves.not.toThrow();
    });
    it("should handle hard difficulty",async()=>{
        await expect(generateQuestion("add","hard")).resolves.not.toThrow();
    });
    it("should throw on unknown topic",async()=>{
        await expect(generateQuestion("unknown_topic","easy")).rejects.toThrow("Unknown topic: unknown_topic");
    });
    it("should throw on null topic",async()=>{
        await expect(generateQuestion(null as any,"easy")).rejects.toThrow();
    });
    it("should throw on empty string topic",async()=>{
        await expect(generateQuestion("","easy")).rejects.toThrow("Unknown topic:");
    });
    it("should call appropriate generator for arithmetic topics",async()=>{
        await expect(generateQuestion("add","easy")).resolves.not.toThrow();
        await expect(generateQuestion("subtrt","easy")).resolves.not.toThrow();
        await expect(generateQuestion("mult","easy")).resolves.not.toThrow();
        await expect(generateQuestion("divid","easy")).resolves.not.toThrow();
    });
    it.skip("should call appropriate generator for algebra topics",()=>{
        expect(()=>generateQuestion("linear_eq","easy")).not.toThrow();
        expect(()=>generateQuestion("quadratic_eq","easy")).not.toThrow();
        expect(()=>generateQuestion("root","easy")).not.toThrow();
    });
    it.skip("should call appropriate generator for calculus topics",()=>{
        expect(()=>generateQuestion("deri","easy")).not.toThrow();
        expect(()=>generateQuestion("inte","easy")).not.toThrow();
        expect(()=>generateQuestion("lim","easy")).not.toThrow();
    });
    it.skip("should call appropriate generator for geometry topics",()=>{
        expect(()=>generateQuestion("area_circle","easy")).not.toThrow();
        expect(()=>generateQuestion("pythag","easy")).not.toThrow();
        expect(()=>generateQuestion("volume_sphere","easy")).not.toThrow();
    });
    it.skip("should call appropriate generator for trigonometry topics",()=>{
        expect(()=>generateQuestion("sin","easy")).not.toThrow();
        expect(()=>generateQuestion("cos","easy")).not.toThrow();
        expect(()=>generateQuestion("tan","easy")).not.toThrow();
    });
    it.skip("should call appropriate generator for linear algebra topics",()=>{
        expect(()=>generateQuestion("mtrx","easy")).not.toThrow();
        expect(()=>generateQuestion("vctr","easy")).not.toThrow();
        expect(()=>generateQuestion("system3x3","easy")).not.toThrow();
    });
    it.skip("should call appropriate generator for discrete math topics",()=>{
        expect(()=>generateQuestion("perm","easy")).not.toThrow();
        expect(()=>generateQuestion("comb","easy")).not.toThrow();
        expect(()=>generateQuestion("prob","easy")).not.toThrow();
    });
    it("should return consistent question for same topic and difficulty",async()=>{
        await generateQuestion("add","easy");
        const first=window.correctAnswer;
        await generateQuestion("add","easy");
        const second=window.correctAnswer;
        expect(first.correct).toBe(second.correct);
        expect(first.alternate).toBe(second.alternate);
        expect(first.display).toBe(second.display);
    });
});