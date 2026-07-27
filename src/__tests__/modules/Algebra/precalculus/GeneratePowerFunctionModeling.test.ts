/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generatePowerFunctionModeling} from "../../../../modules/Algebra/precalculus/GeneratePowerFunctionModeling";
import {seededRng} from "../../../../main/core/Rng";
describe("generatePowerFunctionModeling", ()=>{
	it("generates direct variation question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generatePowerFunctionModeling("medium", rng);
		expect(dto.latex).toBe("If y varies directly with x, and y=8 when x=2, find y when x=6.");
		expect(dto.correct).toBe("24");
		expect(dto.alternate).toBe("24");
		expect(dto.display).toBe("24");
		expect(dto.expectedFormat).toBe("Enter a number");
		expect(dto.choices).toContain("24");
	});
	it("generates inverse variation question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generatePowerFunctionModeling("medium", rng);
		expect(dto.latex).toBe("If y varies inversely with x, and y=8 when x=2, find y when x=4.");
		expect(dto.correct).toBe("4.00");
		expect(dto.alternate).toBe("4");
		expect(dto.display).toBe("4.00");
		expect(dto.expectedFormat).toBe("Enter a number");
		expect(dto.choices).toContain("4.00");
	});
	it("generates power variation question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		const dto=generatePowerFunctionModeling("medium", rng);
		expect(dto.latex).toBe("If y varies as the 3rd power of x, and y=32 when x=2, find y when x=6.");
		expect(dto.correct).toBe("864");
		expect(dto.alternate).toBe("864");
		expect(dto.display).toBe("864");
		expect(dto.expectedFormat).toBe("Enter a number");
		expect(dto.choices).toContain("864");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generatePowerFunctionModeling("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generatePowerFunctionModeling("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		const dto=generatePowerFunctionModeling("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generatePowerFunctionModeling("medium", seededRng(42));
		const dto2=generatePowerFunctionModeling("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
