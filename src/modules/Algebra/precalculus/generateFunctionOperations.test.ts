/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateFunctionOperations} from "./generateFunctionOperations";
import {seededRng} from "../../../main/core/rng";
describe("generateFunctionOperations", ()=>{
	it("generates composition question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateFunctionOperations("medium", rng);
		expect(dto.latex).toContain("f \\circ g");
		expect(dto.correct).toBe("11");
		expect(dto.display).toBe("11");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("generates sum question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateFunctionOperations("medium", rng);
		expect(dto.latex).toContain("(f+g)(x)");
		expect(dto.correct).toBe("2x^2 + 1x + 2");
		expect(dto.expectedFormat).toBe("Enter as polynomial");
	});
	it("generates product question correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		const dto=generateFunctionOperations("medium", rng);
		expect(dto.latex).toContain("(f \\cdot g)(x)");
		expect(dto.correct).toBe("2x^2 + 5x + 2");
		expect(dto.expectedFormat).toBe("Enter as polynomial");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateFunctionOperations("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateFunctionOperations("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.4);
		const dto=generateFunctionOperations("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateFunctionOperations("medium", seededRng(42));
		const dto2=generateFunctionOperations("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
