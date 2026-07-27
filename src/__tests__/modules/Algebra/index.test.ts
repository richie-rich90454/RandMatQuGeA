/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as Algebra from"../../../modules/Algebra/index.js";
import{seededRng}from"../../../main/core/Rng";
describe("Algebra index barrel exports",()=>{
	it("should re-export generateLinearEquation from algebraEquations",()=>{
		expect(typeof Algebra.generateLinearEquation).toBe("function");
	});
	it("should re-export generateFraction from algebraBasics",()=>{
		expect(typeof Algebra.generateFraction).toBe("function");
	});
	it("should re-export generateLogarithm from algebraAdvanced",()=>{
		expect(typeof Algebra.generateLogarithm).toBe("function");
	});
	it("should re-export generatePolynomial from algebraGraphingPolynomials",()=>{
		expect(typeof Algebra.generatePolynomial).toBe("function");
	});
	it("should re-export generateRealNumberOperations from algebraInPrecalculus",()=>{
		expect(typeof Algebra.generateRealNumberOperations).toBe("function");
	});
	it("should re-export getMaxForDifficulty from algebraUtils",()=>{
		expect(typeof Algebra.getMaxForDifficulty).toBe("function");
	});
	it("should re-export factorial from algebraUtils",()=>{
		expect(typeof Algebra.factorial).toBe("function");
	});
});
describe("generateLinearEquation via barrel",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=Algebra.generateLinearEquation("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=Algebra.generateLinearEquation("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=Algebra.generateLinearEquation("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=Algebra.generateLinearEquation("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=Algebra.generateLinearEquation("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=Algebra.generateLinearEquation("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=Algebra.generateLinearEquation("medium", seededRng(42));
		const dto2=Algebra.generateLinearEquation("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=Algebra.generateLinearEquation("medium", seededRng(42));
		const dto2=Algebra.generateLinearEquation("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});