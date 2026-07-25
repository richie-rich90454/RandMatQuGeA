/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateGraphicalCalculus} from "./CalculusGraphical";
import {seededRng} from "../../main/core/Rng";
describe("generateGraphicalCalculus",()=>{
	it("generates diffContinuity correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)// type->floor(22*0.14)=3 diffContinuity
			.mockReturnValueOnce(0.3);// x0->floor(3*0.3)=0
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto.correct).toBe("no");
		expect(dto.alternate).toBe("no");
	});
	it("generates definiteProps correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.55)// type->floor(22*0.55)=12 definiteProps
			.mockReturnValueOnce(0.3)// int1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// int2->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.3)// a->floor(3*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->2+floor(3*0.5)+1=2+1+1=4
			.mockReturnValueOnce(0.7);// c->4+floor(3*0.7)+1=4+2+1=7
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto.correct).toBe("5");
		expect(dto.alternate).toBe("5");
	});
	it("generates inverseFunc correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.19)// type->floor(22*0.19)=4 inverseFunc
			.mockReturnValueOnce(0.3)// fVal->floor(5*0.3)+2=1+2=3
			.mockReturnValueOnce(0.5)// fPrime->floor(5*0.5)+1=2+1=3
			.mockReturnValueOnce(0.7);// a->floor(5*0.7)+1=3+1=4
		const dto=generateGraphicalCalculus("medium", rng);
		let correct=1/3;
		expect(dto.correct).toBe(correct.toFixed(3));
		expect(dto.alternate).toBe(correct.toFixed(3));
	});
	it("generates derivativeLimit correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.73)// type->floor(22*0.73)=16 derivativeLimit
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto.correct).toBe("2");
		expect(dto.alternate).toBe("2");
	});
	it("returns a QuestionDto with required fields",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(dto).toHaveProperty("latex");
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("produces non-empty latex",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
		expect(dto.expectedFormat!.length).toBeGreaterThan(0);
	});
	it("includes choices array",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("easy", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("medium", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)
			.mockReturnValueOnce(0.3);
		const dto=generateGraphicalCalculus("hard", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateGraphicalCalculus("medium", seededRng(42));
		const dto2=generateGraphicalCalculus("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
