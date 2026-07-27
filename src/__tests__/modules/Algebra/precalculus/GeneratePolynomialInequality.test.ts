/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generatePolynomialInequality} from "../../../../modules/Algebra/precalculus/GeneratePolynomialInequality";
import {seededRng} from "../../../../main/core/Rng";
describe("generatePolynomialInequality", ()=>{
	it("generates inequality question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.9);
		const dto=generatePolynomialInequality("medium", rng);
		expect(dto.latex).toBe("Solve the inequality: \\( (x + 2)(x - 1)(x - 2)>0 \\). (Enter intervals)");
		expect(dto.correct).toBe("(-2, 1) ∪ (2, ∞)");
		expect(dto.alternate).toBe("(-2, 1) ∪ (2, infinity)");
		expect(dto.display).toBe("(-2, 1) ∪ (2, ∞)");
		expect(dto.expectedFormat).toBe("Enter intervals like (-∞,1) ∪ (3,∞)");
		expect(dto.choices).toContain("(-2, 1) ∪ (2, ∞)");
	});
	it("includes correct answer in choices", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.9);
		const dto=generatePolynomialInequality("medium", rng);
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.9);
		const dto=generatePolynomialInequality("easy", rng);
		expect(dto.latex).not.toBe("");
		expect(dto.correct).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.9);
		const dto=generatePolynomialInequality("medium", rng);
		expect(dto.latex).not.toBe("");
		expect(dto.correct).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.9);
		const dto=generatePolynomialInequality("hard", rng);
		expect(dto.latex).not.toBe("");
		expect(dto.correct).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generatePolynomialInequality("medium", seededRng(42));
		const dto2=generatePolynomialInequality("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
