/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateLogisticFunctions} from "./generateLogisticFunctions";
import {seededRng} from "../../../main/core/rng";
describe("generateLogisticFunctions", ()=>{
	it("generates identify question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		const dto=generateLogisticFunctions("medium", rng);
		expect(dto.latex).toContain("Identify the type");
		expect(dto.correct).toBe("logistic");
		expect(dto.expectedFormat).toBe("Enter function type");
	});
	it("generates limit question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		const dto=generateLogisticFunctions("medium", rng);
		expect(dto.latex).toContain("carrying capacity");
		expect(dto.correct).toBe("10");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("generates value question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateLogisticFunctions("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.correct).toBe("2.75");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		const dto=generateLogisticFunctions("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		const dto=generateLogisticFunctions("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		const dto=generateLogisticFunctions("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateLogisticFunctions("medium", seededRng(42));
		const dto2=generateLogisticFunctions("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
