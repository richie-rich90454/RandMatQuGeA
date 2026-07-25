/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateApplicationsDiff} from "./calculusApplicationsDiff";
import {seededRng} from "../../main/core/rng";
describe("generateApplicationsDiff",()=>{
	it("generates lhopital correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)// type->floor(18*0.06)=1 lhopital
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto.correct).toBe("2");
		expect(dto.alternate).toBe("2");
	});
	it("generates optimization correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.62)// type->floor(18*0.62)=11 optimization
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto.correct).toBe("1, 1");
		expect(dto.alternate).toBe("1, 1");
	});
	it("generates secondDerivativeTest correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.45)// type->floor(18*0.45)=8 secondDerivativeTest
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto.correct).toBe("inconclusive");
		expect(dto.alternate).toBe("inconclusive");
	});
	it("generates linearization correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.01)// type->floor(18*0.01)=0 linearization
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.5);// x0->floor(5*0.5)+1=3
		const dto=generateApplicationsDiff("medium", rng);
		let point=2*3+3;
		let approx=Math.sqrt(point)+(0.1)/(2*Math.sqrt(point));
		expect(dto.correct).toBe(approx.toFixed(3));
		expect(dto.alternate).toBe(approx.toFixed(3));
	});
	it("generates mvt correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.12)// type->floor(18*0.12)=2 mvt
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateApplicationsDiff("medium", rng);
		let c=1/Math.sqrt(3);
		expect(dto.correct).toBe(c.toFixed(2));
		expect(dto.alternate).toBe(c.toFixed(2));
	});
	it("returns a QuestionDto with required fields",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(dto).toHaveProperty("latex");
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("produces non-empty latex",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
		expect(dto.expectedFormat!.length).toBeGreaterThan(0);
	});
	it("includes choices array",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("easy", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("medium", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.06)
			.mockReturnValueOnce(0.3);
		const dto=generateApplicationsDiff("hard", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateApplicationsDiff("medium", seededRng(42));
		const dto2=generateApplicationsDiff("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
