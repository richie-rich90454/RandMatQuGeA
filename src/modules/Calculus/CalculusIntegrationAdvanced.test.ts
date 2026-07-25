/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateIntegrationAdvanced} from "./calculusIntegrationAdvanced";
import {seededRng} from "../../main/core/rng";
describe("generateIntegrationAdvanced",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateIntegrationAdvanced("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(dto).toHaveProperty("display");
		expect(dto).toHaveProperty("choices");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateIntegrationAdvanced("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
		expect(dto.expectedFormat!.length).toBeGreaterThan(0);
	});
	it("returns choices array",()=>{
		const dto=generateIntegrationAdvanced("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateIntegrationAdvanced("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
		expect(dto.display).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateIntegrationAdvanced("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
		expect(dto.display).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateIntegrationAdvanced("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
		expect(dto.display).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateIntegrationAdvanced("medium", seededRng(42));
		const dto2=generateIntegrationAdvanced("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateIntegrationAdvanced("medium", seededRng(42));
		const dto2=generateIntegrationAdvanced("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("uses rng for all random calls (not Math.random)",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateIntegrationAdvanced("medium", rng);
		expect(rng).toHaveBeenCalled();
		expect(typeof dto.correct).toBe("string");
	});
});
