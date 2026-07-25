/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateSequencesSeries} from "./calculusSequencesSeries";
import {seededRng} from "../../main/core/rng";
describe("generateSequencesSeries",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateSequencesSeries("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateSequencesSeries("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateSequencesSeries("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateSequencesSeries("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateSequencesSeries("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateSequencesSeries("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSequencesSeries("medium", seededRng(42));
		const dto2=generateSequencesSeries("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateSequencesSeries("medium", seededRng(42));
		const dto2=generateSequencesSeries("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("generates ratioTest correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.23)// type->floor(18*0.23)=4 ratioTest
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateSequencesSeries("medium", rng);
		expect(dto.correct).toBe("converges");
		expect(dto.alternate).toBe("converges");
	});
	it("generates geometricSeries correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.67)// type->floor(18*0.67)=12 geometricSeries
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateSequencesSeries("medium", rng);
		expect(dto.correct).toBe("converges, sum=4.00");
		expect(dto.alternate).toBe("converges, sum=4.00");
	});
	it("generates taylorPoly correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.39)// type->floor(18*0.39)=7 taylorPoly
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateSequencesSeries("medium", rng);
		expect(dto.correct).toBe("1 + 2x + 2.00x^2 + 1.33x^3");
		expect(dto.alternate).toBe("1 + 2x + 2.00x^2 + 1.33x^3");
	});
	it("generates absCond correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.28);// type->floor(18*0.28)=5 absCond
		const dto=generateSequencesSeries("medium", rng);
		expect(dto.correct).toBe("absolutely");
		expect(dto.alternate).toBe("absolutely");
	});
	it("generates pSeries correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)// type->floor(18*0.06)=1 pSeries
			.mockReturnValueOnce(0.5);// pVal->0.5*2=1.0, toFixed(1)="1.0"
		const dto=generateSequencesSeries("medium", rng);
		expect(dto.correct).toBe("diverges");
		expect(dto.alternate).toBe("diverges");
	});
});
