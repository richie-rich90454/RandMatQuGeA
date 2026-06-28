/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import * as dm from "./index";
import {seededRng} from "../../main/core/rng";
describe("DiscreteMathematics index exports",()=>{
	it("exports generatePermutation",()=>{
		expect(typeof dm.generatePermutation).toBe("function");
	});
	it("exports generateCombination",()=>{
		expect(typeof dm.generateCombination).toBe("function");
	});
	it("exports generateProbability",()=>{
		expect(typeof dm.generateProbability).toBe("function");
	});
	it("exports generateStatistics",()=>{
		expect(typeof dm.generateStatistics).toBe("function");
	});
	it("exports factorial",()=>{
		expect(typeof dm.factorial).toBe("function");
	});
});
describe("DiscreteMathematics index — DTO return",()=>{
	it("generatePermutation should return QuestionDto with correct/alternate",()=>{
		const dto=dm.generatePermutation("medium", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("generatePermutation should return QuestionDto with expectedFormat",()=>{
		const dto=dm.generatePermutation("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("generateCombination should return QuestionDto with correct/alternate",()=>{
		const dto=dm.generateCombination("medium", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.correct).toBe("string");
	});
	it("generateProbability should return QuestionDto with correct/alternate",()=>{
		const dto=dm.generateProbability("medium", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.correct).toBe("string");
	});
	it("generateStatistics should return QuestionDto with correct/alternate",()=>{
		const dto=dm.generateStatistics("medium", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.correct).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const dto=dm.generatePermutation("easy", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const dto=dm.generateCombination("medium", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const dto=dm.generateProbability("hard", seededRng(42));
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
	});
	it("should return deterministic output for same seed",()=>{
		const dto1=dm.generateStatistics("medium", seededRng(42));
		const dto2=dm.generateStatistics("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
