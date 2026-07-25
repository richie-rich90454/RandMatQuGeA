/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateParametricPolarVector} from "./CalculusParametricPolarVector";
import {seededRng} from "../../main/core/Rng";
describe("generateParametricPolarVector",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateParametricPolarVector("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateParametricPolarVector("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateParametricPolarVector("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateParametricPolarVector("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateParametricPolarVector("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateParametricPolarVector("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateParametricPolarVector("medium", seededRng(42));
		const dto2=generateParametricPolarVector("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateParametricPolarVector("medium", seededRng(42));
		const dto2=generateParametricPolarVector("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
	it("generates parametricDeriv correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.04)// type->floor(13*0.04)=0 parametricDeriv
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.5);// t->floor(3*0.5)+1=2
		const dto=generateParametricPolarVector("medium", rng);
		let dx=2*2*2;
		let dy=3*4-3;
		let deriv=dy/dx;
		expect(dto.correct).toBe(deriv.toFixed(3));
		expect(dto.alternate).toBe(deriv.toFixed(3));
	});
	it("generates polarArea correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.54)// type->floor(13*0.54)=7 polarArea
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateParametricPolarVector("medium", rng);
		let area=Math.PI*(1+2);
		expect(dto.correct).toBe(area.toFixed(3));
		expect(dto.alternate).toBe(area.toFixed(3));
	});
	it("generates vectorIntegral correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.31)// type->floor(13*0.31)=4 vectorIntegral
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateParametricPolarVector("medium", rng);
		expect(dto.correct).toBe("<0.500, 0.667>");
		expect(dto.alternate).toBe("<0.500, 0.667>");
	});
	it("generates motionParam correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(13*0.4)=5 motionParam
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateParametricPolarVector("medium", rng);
		expect(dto.correct).toBe("2");
		expect(dto.alternate).toBe("2");
	});
});
