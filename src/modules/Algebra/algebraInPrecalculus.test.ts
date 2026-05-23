/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as precalc from"./algebraInPrecalculus.js";
describe("algebraInPrecalculus exports",()=>{
    it("should export generateRealNumberOperations",()=>{
        expect(typeof precalc.generateRealNumberOperations).toBe("function");
    });
    it("should export generateCartesianConcepts",()=>{
        expect(typeof precalc.generateCartesianConcepts).toBe("function");
    });
    it("should export generateCircleEquations",()=>{
        expect(typeof precalc.generateCircleEquations).toBe("function");
    });
    it("should export generateLinearEquationSpecial",()=>{
        expect(typeof precalc.generateLinearEquationSpecial).toBe("function");
    });
    it("should export generateRationalEquation",()=>{
        expect(typeof precalc.generateRationalEquation).toBe("function");
    });
    it("should export generatePolynomialInequality",()=>{
        expect(typeof precalc.generatePolynomialInequality).toBe("function");
    });
    it("should export generateFunctionProperties",()=>{
        expect(typeof precalc.generateFunctionProperties).toBe("function");
    });
    it("should export generateBasicFunctions",()=>{
        expect(typeof precalc.generateBasicFunctions).toBe("function");
    });
    it("should export generateFunctionOperations",()=>{
        expect(typeof precalc.generateFunctionOperations).toBe("function");
    });
    it("should export generateInverseFunctions",()=>{
        expect(typeof precalc.generateInverseFunctions).toBe("function");
    });
    it("should export generateTransformations",()=>{
        expect(typeof precalc.generateTransformations).toBe("function");
    });
    it("should export generatePowerFunctionModeling",()=>{
        expect(typeof precalc.generatePowerFunctionModeling).toBe("function");
    });
    it("should export generatePolynomialEndBehavior",()=>{
        expect(typeof precalc.generatePolynomialEndBehavior).toBe("function");
    });
    it("should export generateSyntheticDivision",()=>{
        expect(typeof precalc.generateSyntheticDivision).toBe("function");
    });
    it("should export generateComplexZeros",()=>{
        expect(typeof precalc.generateComplexZeros).toBe("function");
    });
    it("should export generateRationalGraphAnalysis",()=>{
        expect(typeof precalc.generateRationalGraphAnalysis).toBe("function");
    });
    it("should export generateLogisticFunctions",()=>{
        expect(typeof precalc.generateLogisticFunctions).toBe("function");
    });
    it("should export generateExponentialModeling",()=>{
        expect(typeof precalc.generateExponentialModeling).toBe("function");
    });
    it("should export generateLogarithmicModeling",()=>{
        expect(typeof precalc.generateLogarithmicModeling).toBe("function");
    });
    it("should export generateFinance",()=>{
        expect(typeof precalc.generateFinance).toBe("function");
    });
});
