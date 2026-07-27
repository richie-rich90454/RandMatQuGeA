/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as adv from"../../../modules/Algebra/AlgebraAdvanced.js";
describe("algebraAdvanced exports",()=>{
    it("should export generateLogarithm",()=>{
        expect(typeof adv.generateLogarithm).toBe("function");
    });
    it("should export generateExponent",()=>{
        expect(typeof adv.generateExponent).toBe("function");
    });
    it("should export generateFactorial",()=>{
        expect(typeof adv.generateFactorial).toBe("function");
    });
    it("should export generateSeries",()=>{
        expect(typeof adv.generateSeries).toBe("function");
    });
    it("should export generateRoot",()=>{
        expect(typeof adv.generateRoot).toBe("function");
    });
    it("should export generateLinearWordProblem",()=>{
        expect(typeof adv.generateLinearWordProblem).toBe("function");
    });
    it("should export generateRadicalSimplify",()=>{
        expect(typeof adv.generateRadicalSimplify).toBe("function");
    });
    it("should export generateRadicalEquation",()=>{
        expect(typeof adv.generateRadicalEquation).toBe("function");
    });
    it("should export generateRationalExponents",()=>{
        expect(typeof adv.generateRationalExponents).toBe("function");
    });
    it("should export generateExponentRules",()=>{
        expect(typeof adv.generateExponentRules).toBe("function");
    });
    it("should export generateScientificNotation",()=>{
        expect(typeof adv.generateScientificNotation).toBe("function");
    });
    it("should export generateComplex",()=>{
        expect(typeof adv.generateComplex).toBe("function");
    });
    it("should export generateVariation",()=>{
        expect(typeof adv.generateVariation).toBe("function");
    });
});
