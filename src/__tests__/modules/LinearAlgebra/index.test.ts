/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import * as la from "../../../modules/LinearAlgebra/index.js";
import {seededRng} from "../../../main/core/Rng";
describe("LinearAlgebra index exports",()=>{
	it("exports generateMatrix",()=>{
		expect(typeof la.generateMatrix).toBe("function");
	});
	it("exports generateVector",()=>{
		expect(typeof la.generateVector).toBe("function");
	});
	it("exports generateSystem3x3",()=>{
		expect(typeof la.generateSystem3x3).toBe("function");
	});
	it("exports generateRowEchelon3x3",()=>{
		expect(typeof la.generateRowEchelon3x3).toBe("function");
	});
	it("exports generatePartialFractions",()=>{
		expect(typeof la.generatePartialFractions).toBe("function");
	});
	it("exports generateLinearProgramming",()=>{
		expect(typeof la.generateLinearProgramming).toBe("function");
	});
	it("exports generateVector3D",()=>{
		expect(typeof la.generateVector3D).toBe("function");
	});
	it("exports generateLine3D",()=>{
		expect(typeof la.generateLine3D).toBe("function");
	});
	it("exports generatePlane3D",()=>{
		expect(typeof la.generatePlane3D).toBe("function");
	});
	it("exports getRange",()=>{
		expect(typeof la.getRange).toBe("function");
	});
	it("exports matrixToString",()=>{
		expect(typeof la.matrixToString).toBe("function");
	});
});
describe("generateMatrix via index returns DTO",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=la.generateMatrix("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=la.generateMatrix("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=la.generateMatrix("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=la.generateMatrix("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=la.generateMatrix("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=la.generateMatrix("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=la.generateMatrix("medium", seededRng(42));
		const dto2=la.generateMatrix("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("does not mutate window globals",()=>{
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		la.generateMatrix("medium", seededRng(42));
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
});
describe("generateVector via index returns DTO",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=la.generateVector("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=la.generateVector("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=la.generateVector("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("does not mutate window globals",()=>{
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		la.generateVector("medium", seededRng(42));
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
});
