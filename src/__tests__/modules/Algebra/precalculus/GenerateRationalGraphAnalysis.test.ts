/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateRationalGraphAnalysis} from "../../../../modules/Algebra/precalculus/GenerateRationalGraphAnalysis";
import {seededRng} from "../../../../main/core/Rng";
describe("generateRationalGraphAnalysis", ()=>{
	it("generates domain question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateRationalGraphAnalysis("medium", rng);
		expect(dto.latex).toBe("Find the domain of \\( \\frac{x+2}{x-4} \\). (Enter interval)");
		expect(dto.correct).toBe("(-∞, 4) ∪ (4, ∞)");
		expect(dto.alternate).toBe("(-infinity,4) U (4,infinity)");
		expect(dto.display).toBe("(-∞, 4) ∪ (4, ∞)");
		expect(dto.expectedFormat).toBe("Enter intervals");
		expect(dto.choices).toContain("(-∞, 4) ∪ (4, ∞)");
	});
	it("generates asymptotes question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateRationalGraphAnalysis("medium", rng);
		expect(dto.latex).toBe("Find the vertical and horizontal asymptotes of \\( \\frac{2x+4}{x-1} \\).");
		expect(dto.correct).toBe("VA: x=1, HA: y=2");
		expect(dto.alternate).toBe("VA: x=1, HA: y=2");
		expect(dto.display).toBe("VA: x=1, HA: y=2");
		expect(dto.expectedFormat).toBe("Enter as 'VA: x=..., HA: y=...'");
		expect(dto.choices).toContain("VA: x=1, HA: y=2");
	});
	it("generates holes question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateRationalGraphAnalysis("medium", rng);
		expect(dto.latex).toBe("Does the graph of \\( \\frac{(x-2)(x+4)}{x-2} \\) have a hole? If so, at what x-value?");
		expect(dto.correct).toBe("x = 2");
		expect(dto.alternate).toBe("2");
		expect(dto.display).toBe("x = 2");
		expect(dto.expectedFormat).toBe("Enter x = value or 'none'");
		expect(dto.choices).toContain("x = 2");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateRationalGraphAnalysis("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateRationalGraphAnalysis("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateRationalGraphAnalysis("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateRationalGraphAnalysis("medium", seededRng(42));
		const dto2=generateRationalGraphAnalysis("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
