/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as gp from"./algebraGraphingPolynomials.js";
describe("algebraGraphingPolynomials exports",()=>{
    it("should export generatePolynomial",()=>{
        expect(typeof gp.generatePolynomial).toBe("function");
    });
    it("should export generatePolynomialDivision",()=>{
        expect(typeof gp.generatePolynomialDivision).toBe("function");
    });
    it("should export generateFactoring",()=>{
        expect(typeof gp.generateFactoring).toBe("function");
    });
    it("should export generateFunctionConcepts",()=>{
        expect(typeof gp.generateFunctionConcepts).toBe("function");
    });
    it("should export generateLinearGraphing",()=>{
        expect(typeof gp.generateLinearGraphing).toBe("function");
    });
    it("should export generateNonLinearGraphing",()=>{
        expect(typeof gp.generateNonLinearGraphing).toBe("function");
    });
});
