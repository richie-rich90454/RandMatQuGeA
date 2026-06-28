/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateInverseFunctions} from "./generateInverseFunctions";
import {seededRng} from "../../../main/core/rng";
describe("generateInverseFunctions", ()=>{
	it("generates find question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateInverseFunctions("medium", rng);
		expect(dto.latex).toContain("inverse");
		expect(dto.correct).toBe("f^{-1}(x) = \\frac{x - 2}{1}");
		expect(dto.alternate).toBe("(x-2)/1");
		expect(dto.expectedFormat).toBe("Enter as (x-b)/a");
	});
	it("generates verify question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateInverseFunctions("medium", rng);
		expect(dto.latex).toContain("inverses");
		expect(dto.correct).toBe("true");
		expect(dto.expectedFormat).toBe("Enter 'true' or 'false'");
	});
	it("generates onetoone question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateInverseFunctions("medium", rng);
		expect(dto.latex).toContain("one-to-one");
		expect(dto.correct).toBe("no");
		expect(dto.expectedFormat).toBe("Enter 'yes' or 'no'");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateInverseFunctions("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateInverseFunctions("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2);
		const dto=generateInverseFunctions("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateInverseFunctions("medium", seededRng(42));
		const dto2=generateInverseFunctions("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
