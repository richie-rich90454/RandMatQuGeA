/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateIntegral} from "./CalculusIntegrals";
import {seededRng} from "../../main/core/Rng";
describe("generateIntegral",()=>{
	it("generates trigonometric integral correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)// type->floor(15*0.07)=1 trigonometric
			.mockReturnValueOnce(0.1)// trigOptions index->floor(6*0.1)=0 sin->cos sign=-1
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		const dto=generateIntegral("medium", rng);
		expect(dto.correct).toBe("-1.5cos(2x)+c");
		expect(dto.alternate).toBe("-3/2cos(2x)+c");
	});
	it("generates exponential integral with e base correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.14)// type->floor(15*0.14)=2 exponential
			.mockReturnValueOnce(0.3)// base->0.3<0.5 => "e"
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		const dto=generateIntegral("medium", rng);
		expect(dto.correct).toBe("1.5e^(2x)+c");
		expect(dto.alternate).toBe("1.5e^(2x)+c");
	});
	it("generates substitution integral correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.27)// type->floor(15*0.27)=4 substitution
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)=2
			.mockReturnValueOnce(0.3)// power->floor(3*0.3)+2=2
			.mockReturnValueOnce(0.5);// coeff->floor(5*0.5)+1=3
		const dto=generateIntegral("medium", rng);
		expect(dto.correct).toBe("0.5(2x+2)^3+c");
		expect(dto.alternate).toBe("0.5(2x+2)^3+c");
	});
	it("generates logarithmic integral correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.2)// type->floor(15*0.2)=3 logarithmic
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=2
		const dto=generateIntegral("medium", rng);
		expect(dto.correct).toBe("2ln|x|+c");
		expect(dto.alternate).toBe("2ln|x|+c");
	});
	it("returns a QuestionDto with required fields",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("medium", rng);
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(dto).toHaveProperty("latex");
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("produces non-empty latex",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
	});
	it("sets expectedFormat for integral",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("medium", rng);
		expect(dto.expectedFormat).toBe("Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, 1/3 sin(3x)+C, etc.");
	});
	it("includes choices array",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("easy", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("medium", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.07)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		const dto=generateIntegral("hard", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateIntegral("medium", seededRng(42));
		const dto2=generateIntegral("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
