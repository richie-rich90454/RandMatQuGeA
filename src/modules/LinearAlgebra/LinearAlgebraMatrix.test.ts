/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generateMatrix} from "./linearAlgebraMatrix.js";
import {seededRng} from "../../main/core/rng";
describe("generateMatrix",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateMatrix("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateMatrix("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateMatrix("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generateMatrix("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateMatrix("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateMatrix("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateMatrix("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateMatrix("medium", seededRng(42));
		const dto2=generateMatrix("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateMatrix("medium", seededRng(42));
		const dto2=generateMatrix("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("does not mutate window globals",()=>{
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		generateMatrix("medium", seededRng(42));
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
});
