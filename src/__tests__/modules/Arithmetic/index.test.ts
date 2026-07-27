/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {getRangeForDifficulty,getMaxForDifficulty,gcd,isPrime,generateAddition,generateSubtraction,generateMultiplication,generateDivision,generateWholeNumberPlaceValue,generateNumberLineOrdering,generateDivisibility,generateGCFLCM} from "../../../modules/Arithmetic/index.js";
import {seededRng} from "../../../main/core/Rng";
describe("barrel exports",()=>{
	it("exports getRangeForDifficulty",()=>{
		expect(typeof getRangeForDifficulty).toBe("function");
	});
	it("exports getMaxForDifficulty",()=>{
		expect(typeof getMaxForDifficulty).toBe("function");
	});
	it("exports gcd",()=>{
		expect(typeof gcd).toBe("function");
	});
	it("exports isPrime",()=>{
		expect(typeof isPrime).toBe("function");
	});
	it("exports generateAddition",()=>{
		expect(typeof generateAddition).toBe("function");
	});
	it("exports generateSubtraction",()=>{
		expect(typeof generateSubtraction).toBe("function");
	});
	it("exports generateMultiplication",()=>{
		expect(typeof generateMultiplication).toBe("function");
	});
	it("exports generateDivision",()=>{
		expect(typeof generateDivision).toBe("function");
	});
	it("exports generateWholeNumberPlaceValue",()=>{
		expect(typeof generateWholeNumberPlaceValue).toBe("function");
	});
	it("exports generateNumberLineOrdering",()=>{
		expect(typeof generateNumberLineOrdering).toBe("function");
	});
	it("exports generateDivisibility",()=>{
		expect(typeof generateDivisibility).toBe("function");
	});
	it("exports generateGCFLCM",()=>{
		expect(typeof generateGCFLCM).toBe("function");
	});
	it("getRangeForDifficulty returns correct range",()=>{
		let result=getRangeForDifficulty("easy");
		expect(result.min).toBe(1);
		expect(result.max).toBe(50);
	});
	it("getMaxForDifficulty returns correct max",()=>{
		let result=getMaxForDifficulty("hard",50);
		expect(result).toBe(100);
	});
	it("gcd computes correctly",()=>{
		expect(gcd(12,8)).toBe(4);
	});
	it("isPrime works",()=>{
		expect(isPrime(7)).toBe(true);
		expect(isPrime(4)).toBe(false);
	});
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateAddition("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateAddition("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateAddition("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateAddition("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateAddition("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateAddition("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateAddition("medium", seededRng(42));
		const dto2=generateAddition("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateAddition("medium", seededRng(42));
		const dto2=generateAddition("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});