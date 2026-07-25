/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateLimit,generateRelatedRates} from "./CalculusLimitsRelated";
import {seededRng} from "../../main/core/Rng";
describe("generateLimit",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateLimit("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateLimit("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateLimit("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateLimit("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateLimit("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateLimit("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateLimit("medium", seededRng(42));
		const dto2=generateLimit("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateLimit("medium", seededRng(42));
		const dto2=generateLimit("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("generates polynomial limit correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)// type->floor(5*0.1)=0 polynomial
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.6)// c->floor(10*0.6)-5=1
			.mockReturnValueOnce(0.5);// x0->floor(5*0.5)=2
		const dto=generateLimit("medium", rng);
		expect(dto.correct).toBe("9");
		expect(dto.alternate).toBe("9");
	});
	it("generates trig limit correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.6);// type->floor(5*0.6)=3 trig
		const dto=generateLimit("medium", rng);
		expect(dto.correct).toBe("1");
		expect(dto.alternate).toBe("1");
	});
});
describe("generateRelatedRates",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateRelatedRates("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateRelatedRates("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateRelatedRates("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateRelatedRates("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateRelatedRates("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateRelatedRates("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateRelatedRates("medium", seededRng(42));
		const dto2=generateRelatedRates("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateRelatedRates("medium", seededRng(42));
		const dto2=generateRelatedRates("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("generates sphere related rates correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.05);// type->floor(8*0.05)=0 sphere
		const dto=generateRelatedRates("medium", rng);
		expect(dto.correct).toBe((10/(4*Math.PI*25*25)).toFixed(4));
		expect(dto.alternate).toBe((10/(4*Math.PI*25*25)).toFixed(4));
	});
	it("generates circleArea related rates correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.15);// type->floor(8*0.15)=1 circleArea
		const dto=generateRelatedRates("medium", rng);
		let dr_dt=0.5;
		let r=3;
		let dA_dt=2*Math.PI*r*dr_dt;
		expect(dto.correct).toBe(dA_dt.toFixed(4));
		expect(dto.alternate).toBe(dA_dt.toFixed(4));
	});
});
