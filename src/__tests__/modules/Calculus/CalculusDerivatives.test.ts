/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {generateDerivative} from "../../../modules/Calculus/CalculusDerivatives";
import {seededRng} from "../../../main/core/Rng";
describe("generateDerivative",()=>{
	it("generates trigonometric derivative correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)// type->floor(13*0.1)=1 trigonometric
			.mockReturnValueOnce(0.1)// trig index->floor(6*0.1)=0 sin
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=1+1=2
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("2*cos(x)");
		expect(dto.alternate).toBe("2*cos(x)");
	});
	it("generates implicit derivative correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.55)// type->floor(13*0.55)=7 implicit
			.mockReturnValueOnce(0.2)// a->floor(5*0.2)+1=1+1=2
			.mockReturnValueOnce(0.4);// b->floor(5*0.4)+1=2+1=3
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("-(2x)/(3y)");
		expect(dto.alternate).toBe("-(2x)/(3y)");
	});
	it("generates inverseTrig derivative correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.85)// type->floor(13*0.85)=11 inverseTrig
			.mockReturnValueOnce(0.1)// subType->floor(3*0.1)=0 arcsin
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=1+1=2
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("2/sqrt(1-4x^2)");
		expect(dto.alternate).toBe("2/sqrt(1-4x^2)");
	});
	it("generates polynomial derivative correctly (power rule)",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.0)// type->floor(13*0)=0 polynomial
			.mockReturnValueOnce(0.0)// numTerms->floor(4*0)+2=2
			.mockReturnValueOnce(0.0)// exponent->floor(11*0)=0
			.mockReturnValueOnce(0.1)// exponent->floor(11*0.1)=1
			.mockReturnValueOnce(0.3)// coeff for exp 1->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5);// coeff for exp 0->floor(100*0.5)+1=51
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("2");
		expect(dto.alternate).toBe("2");
	});
	it("generates exponential derivative correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.16)// type->floor(13*0.16)=2 exponential
			.mockReturnValueOnce(0.1)// exp index->floor(2*0.1)=0 e^x
			.mockReturnValueOnce(0.3);// coeff->floor(5*0.3)+1=2
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("2*e^x");
	});
	it("generates logarithmic derivative correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.24)// type->floor(13*0.24)=3 logarithmic
			.mockReturnValueOnce(0.1);// log index->floor(2*0.1)=0 ln(x)
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("1/x");
	});
	it("generates chain rule derivative correctly",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.47)// type->floor(13*0.47)=6 chain
			.mockReturnValueOnce(0.0)// chainType->floor(3*0)=0 trig chain
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(3*0.5)=1
			.mockReturnValueOnce(0.0);// trigFunc->floor(2*0)=0 sin
		const dto=generateDerivative("medium", rng);
		expect(dto.correct).toBe("cos(2x+1)*2");
	});
	it("returns a QuestionDto with required fields",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("medium", rng);
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(dto).toHaveProperty("latex");
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("produces non-empty latex",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
		expect(dto.expectedFormat!.length).toBeGreaterThan(0);
	});
	it("includes choices array",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("easy", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("medium", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		const dto=generateDerivative("hard", rng);
		expect(dto).toHaveProperty("correct");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateDerivative("medium", seededRng(42));
		const dto2=generateDerivative("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
