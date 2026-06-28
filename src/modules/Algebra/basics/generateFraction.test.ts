/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generateFraction} from "./generateFraction";
import {seededRng} from "../../../main/core/rng";
describe("generateFraction",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateFraction("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateFraction("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateFraction("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateFraction("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateFraction("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateFraction("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateFraction("medium", seededRng(42));
		const dto2=generateFraction("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateFraction("medium", seededRng(42));
		const dto2=generateFraction("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
