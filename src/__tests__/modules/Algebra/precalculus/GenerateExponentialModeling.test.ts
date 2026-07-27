/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateExponentialModeling} from "../../../../modules/Algebra/precalculus/GenerateExponentialModeling";
import {seededRng} from "../../../../main/core/Rng";
describe("generateExponentialModeling", ()=>{
	it("generates growth question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateExponentialModeling("medium", rng);
		expect(dto.latex).toContain("grows continuously");
		expect(dto.correct).toBe("69");
		expect(dto.display).toBe("69");
		expect(dto.expectedFormat).toBe("Enter whole number");
	});
	it("generates decay question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.25)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateExponentialModeling("medium", rng);
		expect(dto.latex).toContain("decays");
		expect(dto.correct).toBe("52.16");
		expect(dto.display).toBe("52.16");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("generates half-life question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateExponentialModeling("medium", rng);
		expect(dto.latex).toContain("half-life");
		expect(dto.expectedFormat).toBe("Enter decimal");
		expect(dto.choices).toContain(dto.correct);
	});
	it("generates cooling question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.75)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4)
			.mockReturnValueOnce(0.5);
		const dto=generateExponentialModeling("medium", rng);
		expect(dto.latex).toContain("Cooling");
		expect(dto.expectedFormat).toBe("Enter decimal");
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateExponentialModeling("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateExponentialModeling("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateExponentialModeling("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateExponentialModeling("medium", seededRng(42));
		const dto2=generateExponentialModeling("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
