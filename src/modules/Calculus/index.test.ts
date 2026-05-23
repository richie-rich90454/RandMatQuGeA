/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
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
}from "./index";
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
