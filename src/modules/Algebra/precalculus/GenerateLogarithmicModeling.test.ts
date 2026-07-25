/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateLogarithmicModeling} from "./GenerateLogarithmicModeling";
import {seededRng} from "../../../main/core/Rng";
describe("generateLogarithmicModeling", ()=>{
	it("generates richter question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.9);
		const dto=generateLogarithmicModeling("medium", rng);
		expect(dto.latex).toContain("Richter");
		expect(dto.correct).toBe("3.00");
		expect(dto.display).toBe("3.00");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("generates ph question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateLogarithmicModeling("medium", rng);
		expect(dto.latex).toContain("pH");
		expect(dto.correct).toBe("1.00");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("generates decibel question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateLogarithmicModeling("medium", rng);
		expect(dto.latex).toContain("decibels");
		expect(dto.correct).toBe("10.00");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("should handle easy difficulty", ()=>{
		const dto=generateLogarithmicModeling("easy", seededRng(1));
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const dto=generateLogarithmicModeling("medium", seededRng(1));
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const dto=generateLogarithmicModeling("hard", seededRng(1));
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateLogarithmicModeling("medium", seededRng(42));
		const dto2=generateLogarithmicModeling("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
