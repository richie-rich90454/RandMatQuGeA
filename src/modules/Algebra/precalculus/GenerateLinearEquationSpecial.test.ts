/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateLinearEquationSpecial} from "./generateLinearEquationSpecial";
import {seededRng} from "../../../main/core/rng";
describe("generateLinearEquationSpecial", ()=>{
	it("generates identity question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateLinearEquationSpecial("medium", rng);
		expect(dto.latex).toContain("identity, contradiction, or conditional");
		expect(dto.correct).toBe("identity");
		expect(dto.alternate).toBe("identity");
		expect(dto.display).toBe("identity");
		expect(dto.expectedFormat).toBe("Enter 'identity', 'contradiction', or the solution");
	});
	it("generates contradiction question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateLinearEquationSpecial("medium", rng);
		expect(dto.latex).toContain("identity, contradiction, or conditional");
		expect(dto.correct).toBe("contradiction");
		expect(dto.display).toBe("contradiction");
		expect(dto.expectedFormat).toBe("Enter 'identity', 'contradiction', or the solution");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateLinearEquationSpecial("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateLinearEquationSpecial("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateLinearEquationSpecial("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateLinearEquationSpecial("medium", seededRng(42));
		const dto2=generateLinearEquationSpecial("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
