/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateTransformations} from "../../../../modules/Algebra/precalculus/GenerateTransformations";
import {seededRng} from "../../../../main/core/Rng";
describe("generateTransformations", ()=>{
	it("generates translation question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateTransformations("medium", rng);
		expect(dto.latex).toBe("If the graph of \\( y=x^2 \\) is shifted right by 2 and up by 4, what is the new equation?");
		expect(dto.correct).toBe("y = (x - 2)^2 + 4");
		expect(dto.alternate).toBe("y = (x - 2)^2 + 4");
		expect(dto.display).toBe("y = (x - 2)^2 + 4");
		expect(dto.expectedFormat).toBe("Enter as y = (x-h)^2 + k");
		expect(dto.choices).toContain("y = (x - 2)^2 + 4");
	});
	it("generates reflection question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateTransformations("medium", rng);
		expect(dto.latex).toBe("If the graph of \\( y=\\sqrt{x} \\) is reflected across the x-axis, what is the new equation?");
		expect(dto.correct).toBe("y = -√x");
		expect(dto.alternate).toBe("y = -√x");
		expect(dto.display).toBe("y = -√x");
		expect(dto.expectedFormat).toBe("Enter equation");
		expect(dto.choices).toContain("y = -√x");
	});
	it("generates stretch question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.6);
		const dto=generateTransformations("medium", rng);
		expect(dto.latex).toBe("If the graph of \\( y=|x| \\) is stretched vertically by a factor of 2, what is the new equation?");
		expect(dto.correct).toBe("y = 2|x|");
		expect(dto.alternate).toBe("y = 2|x|");
		expect(dto.display).toBe("y = 2|x|");
		expect(dto.expectedFormat).toBe("Enter equation");
		expect(dto.choices).toContain("y = 2|x|");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateTransformations("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateTransformations("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1);
		const dto=generateTransformations("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateTransformations("medium", seededRng(42));
		const dto2=generateTransformations("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
