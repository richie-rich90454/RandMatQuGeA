/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateFinance} from "./GenerateFinance";
import {seededRng} from "../../../main/core/Rng";
describe("generateFinance", ()=>{
	it("generates compound question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateFinance("medium", rng);
		expect(dto.latex).toContain("compounded");
		expect(dto.correct).toBe("1020.00");
		expect(dto.display).toBe("1020.00");
		expect(dto.expectedFormat).toBe("Enter decimal (two decimals)");
	});
	it("generates continuous question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.25)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateFinance("medium", rng);
		expect(dto.latex).toContain("continuously");
		expect(dto.correct).toBe("1020.20");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("generates apy question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateFinance("medium", rng);
		expect(dto.latex).toContain("APY");
		expect(dto.correct).toBe("2.00");
		expect(dto.expectedFormat).toBe("Enter percentage (e.g., 5.25)");
	});
	it("generates annuity question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.75)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateFinance("medium", rng);
		expect(dto.latex).toContain("future value");
		expect(dto.correct).toBe("100.00");
		expect(dto.expectedFormat).toBe("Enter decimal");
	});
	it("should handle easy difficulty", ()=>{
		const dto=generateFinance("easy", seededRng(1));
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const dto=generateFinance("medium", seededRng(1));
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const dto=generateFinance("hard", seededRng(1));
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateFinance("medium", seededRng(42));
		const dto2=generateFinance("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
