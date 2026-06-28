/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generatePercent} from "./generatePercent";
import {seededRng} from "../../../main/core/rng";
describe("generatePercent",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generatePercent("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generatePercent("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generatePercent("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generatePercent("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generatePercent("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generatePercent("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePercent("medium", seededRng(42));
		const dto2=generatePercent("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generatePercent("medium", seededRng(42));
		const dto2=generatePercent("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
