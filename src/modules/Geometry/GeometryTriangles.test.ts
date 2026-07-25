/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generatePythagorean,generateSimilarTriangles,generateTriangleClassification} from "./geometryTriangles.js";
import {seededRng} from "../../main/core/rng";
describe("generatePythagorean",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generatePythagorean("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generatePythagorean("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generatePythagorean("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generatePythagorean("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generatePythagorean("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generatePythagorean("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePythagorean("medium", seededRng(42));
		const dto2=generatePythagorean("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generatePythagorean("medium", seededRng(42));
		const dto2=generatePythagorean("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateSimilarTriangles",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateSimilarTriangles("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateSimilarTriangles("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateSimilarTriangles("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateSimilarTriangles("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateSimilarTriangles("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateSimilarTriangles("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSimilarTriangles("medium", seededRng(42));
		const dto2=generateSimilarTriangles("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateSimilarTriangles("medium", seededRng(42));
		const dto2=generateSimilarTriangles("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateTriangleClassification",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateTriangleClassification("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateTriangleClassification("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateTriangleClassification("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should classify triangle as equilateral, isosceles, or scalene",()=>{
		const dto=generateTriangleClassification("medium", seededRng(42));
		expect(["equilateral","isosceles","scalene"]).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateTriangleClassification("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateTriangleClassification("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateTriangleClassification("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateTriangleClassification("medium", seededRng(42));
		const dto2=generateTriangleClassification("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateTriangleClassification("medium", seededRng(42));
		const dto2=generateTriangleClassification("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
