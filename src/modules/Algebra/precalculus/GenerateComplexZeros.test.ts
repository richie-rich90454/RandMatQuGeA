/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateComplexZeros} from "./GenerateComplexZeros";
import {seededRng} from "../../../main/core/Rng";
describe("generateComplexZeros", ()=>{
	it("generates fundamental theorem question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateComplexZeros("medium", rng);
		expect(dto.latex).toContain("Fundamental Theorem");
		expect(dto.correct).toBe("4");
		expect(dto.display).toBe("4");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("generates conjugate pair question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		const dto=generateComplexZeros("medium", rng);
		expect(dto.latex).toContain("real coefficients");
		expect(dto.correct).toBe("1 - 2i");
		expect(dto.display).toBe("1 - 2i");
		expect(dto.expectedFormat).toBe("Enter as a+bi");
	});
	it("generates factor question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		const dto=generateComplexZeros("medium", rng);
		expect(dto.latex).toContain("Factor");
		expect(dto.correct).toBe("(x - 1)(x - 2)");
		expect(dto.display).toBe("(x - 1)(x - 2)");
		expect(dto.expectedFormat).toBe("Enter as (x - a)(x - b)");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateComplexZeros("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateComplexZeros("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		const dto=generateComplexZeros("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateComplexZeros("medium", seededRng(42));
		const dto2=generateComplexZeros("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
