/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generatePolynomialEndBehavior} from "./GeneratePolynomialEndBehavior";
import {seededRng} from "../../../main/core/Rng";
describe("generatePolynomialEndBehavior", ()=>{
	it("generates endbehavior question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		const dto=generatePolynomialEndBehavior("medium", rng);
		expect(dto.latex).toContain("end behavior");
		expect(dto.correct).toBe("both ends up");
		expect(dto.expectedFormat).toBe("Enter description like 'both ends up'");
	});
	it("generates multiplicity question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5);
		const dto=generatePolynomialEndBehavior("medium", rng);
		expect(dto.latex).toContain("multiplicity");
		expect(dto.correct).toBe("2");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("generates ivt question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.6);
		const dto=generatePolynomialEndBehavior("medium", rng);
		expect(dto.latex).toContain("Intermediate Value Theorem");
		expect(dto.correct).toBe("yes");
		expect(dto.expectedFormat).toBe("Enter 'yes' or 'no'");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		const dto=generatePolynomialEndBehavior("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		const dto=generatePolynomialEndBehavior("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.4);
		const dto=generatePolynomialEndBehavior("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generatePolynomialEndBehavior("medium", seededRng(42));
		const dto2=generatePolynomialEndBehavior("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
