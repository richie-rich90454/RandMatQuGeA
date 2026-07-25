/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as precalc from"./AlgebraInPrecalculus.js";
import{seededRng}from"../../main/core/Rng";
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
describe("generateRealNumberOperations",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=precalc.generateRealNumberOperations("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=precalc.generateRealNumberOperations("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=precalc.generateRealNumberOperations("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=precalc.generateRealNumberOperations("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=precalc.generateRealNumberOperations("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=precalc.generateRealNumberOperations("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=precalc.generateRealNumberOperations("medium", seededRng(42));
		const dto2=precalc.generateRealNumberOperations("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=precalc.generateRealNumberOperations("medium", seededRng(42));
		const dto2=precalc.generateRealNumberOperations("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});