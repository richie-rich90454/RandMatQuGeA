/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from "vitest";
import {generateBasicFunctions} from "./generateBasicFunctions";
import {seededRng} from "../../../main/core/rng";
describe("generateBasicFunctions", ()=>{
	it("generates identify question type correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateBasicFunctions("medium", rng);
		expect(dto.latex).toBe("Identify the function: \\( f(x)=x \\). (Enter name)");
		expect(dto.correct).toBe("identity");
		expect(dto.alternate).toBe("identity");
		expect(dto.display).toBe("identity");
		expect(dto.expectedFormat).toBe("Enter the function name");
		expect(dto.choices).toContain("identity");
	});
	it("generates properties question type correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5);
		const dto=generateBasicFunctions("medium", rng);
		expect(dto.latex).toContain("Give one key property");
		expect(dto.correct).toBe("linear, odd, increasing");
		expect(dto.alternate).toBe("linear, odd, increasing");
		expect(dto.display).toBe("linear, odd, increasing");
		expect(dto.expectedFormat).toBe("Enter a property (e.g., 'even', 'increasing')");
	});
	it("generates different function correctly", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.0);
		const dto=generateBasicFunctions("medium", rng);
		expect(dto.correct).toBe("squaring");
		expect(dto.display).toBe("squaring");
	});
	it("should handle easy difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateBasicFunctions("easy", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateBasicFunctions("medium", rng);
		expect(dto.latex).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const dto=generateBasicFunctions("hard", rng);
		expect(dto.latex).not.toBe("");
	});
	it("returns deterministic output for same seed", ()=>{
		const dto1=generateBasicFunctions("medium", seededRng(42));
		const dto2=generateBasicFunctions("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
