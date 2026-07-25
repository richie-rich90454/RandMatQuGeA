/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateCartesianConcepts} from "./generateCartesianConcepts";
import {seededRng} from "../../../main/core/rng";
describe("generateCartesianConcepts", ()=>{
	it("generates quadrant question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		const dto=generateCartesianConcepts("medium", rng);
		expect(dto.latex).toContain("quadrant");
		expect(dto.correct).toBe("I");
		expect(dto.display).toBe("I");
		expect(dto.expectedFormat).toBe("Enter I, II, III, IV, or 'on an axis'");
	});
	it("generates distance question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.25)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateCartesianConcepts("medium", rng);
		expect(dto.latex).toContain("distance");
		expect(dto.correct).toBe("2.83");
		expect(dto.expectedFormat).toBe("Enter a decimal rounded to two places");
	});
	it("generates midpoint question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateCartesianConcepts("medium", rng);
		expect(dto.latex).toContain("midpoint");
		expect(dto.correct).toBe("(2.00, 3.00)");
		expect(dto.expectedFormat).toBe("Enter as (x, y)");
	});
	it("generates plot question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.75)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateCartesianConcepts("medium", rng);
		expect(dto.latex).toContain("units right");
		expect(dto.correct).toBe("(2, 3)");
		expect(dto.display).toBe("(2, 3)");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		const dto=generateCartesianConcepts("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		const dto=generateCartesianConcepts("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.8);
		const dto=generateCartesianConcepts("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateCartesianConcepts("medium", seededRng(42));
		const dto2=generateCartesianConcepts("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
