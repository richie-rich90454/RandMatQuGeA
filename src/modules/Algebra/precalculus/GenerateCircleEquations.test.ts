/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateCircleEquations} from "./GenerateCircleEquations";
import {seededRng} from "../../../main/core/Rng";
describe("generateCircleEquations", ()=>{
	it("generates standard form question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateCircleEquations("medium", rng);
		expect(dto.latex).toContain("circle");
		expect(dto.expectedFormat).toBe("Enter as (x-h)^2 + (y-k)^2 = r^2");
	});
	it("generates center_radius question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateCircleEquations("medium", rng);
		expect(dto.latex).toContain("center");
		expect(dto.expectedFormat).toBe("Enter as 'center (h,k), radius r'");
	});
	it("generates complete_square question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateCircleEquations("medium", rng);
		expect(dto.latex).toContain("Complete the square");
		expect(dto.correct).toBe("center (2, 4), radius 3");
		expect(dto.display).toBe("center (2, 4), radius 3");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateCircleEquations("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateCircleEquations("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateCircleEquations("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateCircleEquations("medium", seededRng(42));
		const dto2=generateCircleEquations("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
