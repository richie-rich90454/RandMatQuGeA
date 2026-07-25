/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generateArithmeticSequence,generateGeometricSequence,generateSequenceLimit,generateInfiniteGeometricSeries,generateMathematicalInduction,generateBinomialTheorem} from "./DiscreteSequenceSeries";
import {seededRng} from "../../main/core/Rng";
describe("generateArithmeticSequence",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateArithmeticSequence("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateArithmeticSequence("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=generateArithmeticSequence("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateArithmeticSequence("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateArithmeticSequence("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateArithmeticSequence("medium", seededRng(42));
		const dto2=generateArithmeticSequence("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateArithmeticSequence("medium", seededRng(42));
		const dto2=generateArithmeticSequence("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateGeometricSequence",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateGeometricSequence("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateGeometricSequence("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=generateGeometricSequence("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateGeometricSequence("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateGeometricSequence("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateGeometricSequence("medium", seededRng(42));
		const dto2=generateGeometricSequence("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateGeometricSequence("medium", seededRng(42));
		const dto2=generateGeometricSequence("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateSequenceLimit",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateSequenceLimit("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateSequenceLimit("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=generateSequenceLimit("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateSequenceLimit("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateSequenceLimit("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSequenceLimit("medium", seededRng(42));
		const dto2=generateSequenceLimit("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateSequenceLimit("medium", seededRng(42));
		const dto2=generateSequenceLimit("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateInfiniteGeometricSeries",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateInfiniteGeometricSeries("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateInfiniteGeometricSeries("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=generateInfiniteGeometricSeries("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateInfiniteGeometricSeries("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateInfiniteGeometricSeries("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateInfiniteGeometricSeries("medium", seededRng(42));
		const dto2=generateInfiniteGeometricSeries("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateInfiniteGeometricSeries("medium", seededRng(42));
		const dto2=generateInfiniteGeometricSeries("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateMathematicalInduction",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateMathematicalInduction("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateMathematicalInduction("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=generateMathematicalInduction("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateMathematicalInduction("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateMathematicalInduction("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateMathematicalInduction("medium", seededRng(42));
		const dto2=generateMathematicalInduction("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateMathematicalInduction("medium", seededRng(42));
		const dto2=generateMathematicalInduction("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateBinomialTheorem",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateBinomialTheorem("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateBinomialTheorem("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=generateBinomialTheorem("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateBinomialTheorem("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateBinomialTheorem("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateBinomialTheorem("medium", seededRng(42));
		const dto2=generateBinomialTheorem("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateBinomialTheorem("medium", seededRng(42));
		const dto2=generateBinomialTheorem("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
