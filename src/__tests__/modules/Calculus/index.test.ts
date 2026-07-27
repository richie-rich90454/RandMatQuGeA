/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import{
	getMaxCoeff,
	latexToPlain,
	trigFunctions,
	expFunctions,
	logFunctions,
	trigIntegrals,
	generateDerivative,
	generateIntegral,
	generateLimit,
	generateRelatedRates,
	generateLimitsContinuity,
	generateApplicationsDiff,
	generateIntegrationAdvanced,
	generateGraphicalCalculus,
	generateParametricPolarVector,
	generateSequencesSeries,
}from "../../../modules/Calculus/index";
describe("index barrel",()=>{
	it("exports calculusUtils functions",()=>{
		expect(getMaxCoeff).toBeDefined();
		expect(typeof getMaxCoeff).toBe("function");
		expect(latexToPlain).toBeDefined();
		expect(typeof latexToPlain).toBe("function");
	});
	it("exports calculusUtils arrays",()=>{
		expect(Array.isArray(trigFunctions)).toBe(true);
		expect(Array.isArray(expFunctions)).toBe(true);
		expect(Array.isArray(logFunctions)).toBe(true);
		expect(Array.isArray(trigIntegrals)).toBe(true);
	});
	it("exports generateDerivative",()=>{
		expect(generateDerivative).toBeDefined();
		expect(typeof generateDerivative).toBe("function");
	});
	it("exports generateIntegral",()=>{
		expect(generateIntegral).toBeDefined();
		expect(typeof generateIntegral).toBe("function");
	});
	it("exports generateLimit and generateRelatedRates",()=>{
		expect(generateLimit).toBeDefined();
		expect(typeof generateLimit).toBe("function");
		expect(generateRelatedRates).toBeDefined();
		expect(typeof generateRelatedRates).toBe("function");
	});
	it("exports generateLimitsContinuity",()=>{
		expect(generateLimitsContinuity).toBeDefined();
		expect(typeof generateLimitsContinuity).toBe("function");
	});
	it("exports generateApplicationsDiff",()=>{
		expect(generateApplicationsDiff).toBeDefined();
		expect(typeof generateApplicationsDiff).toBe("function");
	});
	it("exports generateIntegrationAdvanced",()=>{
		expect(generateIntegrationAdvanced).toBeDefined();
		expect(typeof generateIntegrationAdvanced).toBe("function");
	});
	it("exports generateGraphicalCalculus",()=>{
		expect(generateGraphicalCalculus).toBeDefined();
		expect(typeof generateGraphicalCalculus).toBe("function");
	});
	it("exports generateParametricPolarVector",()=>{
		expect(generateParametricPolarVector).toBeDefined();
		expect(typeof generateParametricPolarVector).toBe("function");
	});
	it("exports generateSequencesSeries",()=>{
		expect(generateSequencesSeries).toBeDefined();
		expect(typeof generateSequencesSeries).toBe("function");
	});
});
describe("index barrel — DTO return",()=>{
	it("should return QuestionDto with correct/alternate",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValue(0.5);
		const dto=generateDerivative(undefined, rng);
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
		expect(dto).toHaveProperty("alternate");
		expect(typeof dto.correct).toBe("string");
	});
	it("should return QuestionDto with expectedFormat",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValue(0.5);
		const dto=generateDerivative(undefined, rng);
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValue(0.5);
		const dto=generateDerivative("easy", rng);
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValue(0.5);
		const dto=generateDerivative("medium", rng);
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValue(0.5);
		const dto=generateDerivative("hard", rng);
		expect(dto).toBeDefined();
		expect(dto).toHaveProperty("correct");
	});
});
