/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as Algebra from"./index.js";
describe("Algebra index barrel exports",()=>{
    it("should re-export generateLinearEquation from algebraEquations",()=>{
        expect(typeof Algebra.generateLinearEquation).toBe("function");
    });
    it("should re-export generateFraction from algebraBasics",()=>{
        expect(typeof Algebra.generateFraction).toBe("function");
    });
    it("should re-export generateLogarithm from algebraAdvanced",()=>{
        expect(typeof Algebra.generateLogarithm).toBe("function");
    });
    it("should re-export generatePolynomial from algebraGraphingPolynomials",()=>{
        expect(typeof Algebra.generatePolynomial).toBe("function");
    });
    it("should re-export generateRealNumberOperations from algebraInPrecalculus",()=>{
        expect(typeof Algebra.generateRealNumberOperations).toBe("function");
    });
    it("should re-export getMaxForDifficulty from algebraUtils",()=>{
        expect(typeof Algebra.getMaxForDifficulty).toBe("function");
    });
    it("should re-export factorial from algebraUtils",()=>{
        expect(typeof Algebra.factorial).toBe("function");
    });
});
