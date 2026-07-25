/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateLimitsContinuity} from "./calculusLimitsContinuity";
import {seededRng} from "../../main/core/rng";
describe("generateLimitsContinuity",()=>{
	it("generates limitSqueeze correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)// type->floor(14*0.3)=4 limitSqueeze
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("0");
		expect(dto.alternate).toBe("0");
		expect(dto.display).toBe("0");
		expect(dto.expectedFormat).toBe("Enter 0");
	});
	it("generates discontinuityType correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(14*0.4)=5 discontinuityType
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("removable");
		expect(dto.alternate).toBe("removable");
		expect(dto.display).toBe("\\text{removable}");
	});
	it("generates horizontalAsymptote correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.75)// type->floor(14*0.75)=10 horizontalAsymptote
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("1");
		expect(dto.alternate).toBe("1");
		expect(dto.display).toBe("1");
	});
	it("generates continuityConditions correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.45);// type->floor(14*0.45)=6 continuityConditions
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("f(c) defined, limit exists, limit equals f(c)");
		expect(dto.alternate).toBe("f(c) defined, limit exists, limit equals f(c)");
	});
	it("generates limitProperties correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.15)// type->floor(14*0.15)=2 limitProperties
			.mockReturnValueOnce(0.1)// limF->floor(10*0.1)+1=2
			.mockReturnValueOnce(0.2)// limG->floor(10*0.2)+1=3
			.mockReturnValueOnce(0.3)// coeff1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff2->floor(5*0.5)+1=3 -> result=2*2+3*3=13
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("13");
		expect(dto.alternate).toBe("13");
	});
	it("generates limitNotation correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)// type->floor(14*0)=0 limitNotation
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.3);// c->floor(5*0.3)+1=2 -> val=2*2*2=8
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("\\lim_{x\\to 2} f(x)=8");
		expect(dto.alternate).toBe("\\lim_{x\\to 2} f(x)=8");
		expect(dto.display).toBe("\\lim_{x\\to 2} f(x)=8");
	});
	it("generates verticalAsymptote correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.65)// type->floor(14*0.65)=9 verticalAsymptote
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// b->floor(5*0.5)+1=3 -> sqrt(3).toFixed(2)=1.73
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.correct).toBe("x=1.73, x=-1.73");
		expect(dto.alternate).toBe("x=1.73, x=-1.73");
	});
	it("returns a QuestionDto with required fields",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(dto).toHaveProperty("latex");
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("produces non-empty latex",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
	});
	it("includes choices array",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		const dto=generateLimitsContinuity("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		const dto=generateLimitsContinuity("easy", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		const dto=generateLimitsContinuity("medium", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.3);
		const dto=generateLimitsContinuity("hard", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateLimitsContinuity("medium", seededRng(42));
		const dto2=generateLimitsContinuity("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
