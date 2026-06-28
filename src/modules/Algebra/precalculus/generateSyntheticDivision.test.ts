/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateSyntheticDivision} from "./generateSyntheticDivision";
import {seededRng} from "../../../main/core/rng";
describe("generateSyntheticDivision", ()=>{
	it("generates divide question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generateSyntheticDivision("medium", rng);
		expect(dto.latex).toBe("Use synthetic division to divide \\( 2x^3 + 4x^2 + 1x + 3 \\) by \\( x - 2 \\). (Enter quotient)");
		expect(dto.correct).toBe("2x^2 + 8x + 17");
		expect(dto.alternate).toBe("2x^2 + 8x + 17");
		expect(dto.display).toBe("2x^2 + 8x + 17");
		expect(dto.expectedFormat).toBe("Enter polynomial");
		expect(dto.choices).toContain("2x^2 + 8x + 17");
	});
	it("generates remainder theorem question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generateSyntheticDivision("medium", rng);
		expect(dto.latex).toBe("Use the Remainder Theorem to find the remainder when \\( 2x^2 + 4x + 1 \\) is divided by \\( x - 3 \\).");
		expect(dto.correct).toBe("31");
		expect(dto.alternate).toBe("31");
		expect(dto.display).toBe("31");
		expect(dto.expectedFormat).toBe("Enter a number");
		expect(dto.choices).toContain("31");
	});
	it("generates factor question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generateSyntheticDivision("medium", rng);
		expect(dto.latex).toBe("Is \\( x - 2 \\) a factor of \\( x^3 - 2x^2 + 4x - 8 \\)? (yes/no)");
		expect(dto.correct).toBe("yes");
		expect(dto.alternate).toBe("yes");
		expect(dto.display).toBe("yes");
		expect(dto.expectedFormat).toBe("Enter 'yes' or 'no'");
		expect(dto.choices).toContain("yes");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generateSyntheticDivision("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generateSyntheticDivision("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generateSyntheticDivision("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateSyntheticDivision("medium", seededRng(42));
		const dto2=generateSyntheticDivision("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
