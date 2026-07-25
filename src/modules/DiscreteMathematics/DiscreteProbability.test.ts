/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generateProbability} from "./DiscreteProbability";
import {seededRng} from "../../main/core/Rng";
describe("generateProbability",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateProbability("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateProbability("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateProbability("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateProbability("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateProbability("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateProbability("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateProbability("medium", seededRng(42));
		const dto2=generateProbability("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateProbability("medium", seededRng(42));
		const dto2=generateProbability("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("correct answer should be present in choices",()=>{
		const dto=generateProbability("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
});
