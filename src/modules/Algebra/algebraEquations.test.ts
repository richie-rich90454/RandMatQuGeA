/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as eq from"./algebraEquations.js";
describe("algebraEquations exports",()=>{
    it("should export generateLinearEquation",()=>{
        expect(typeof eq.generateLinearEquation).toBe("function");
    });
    it("should export generateQuadraticEquation",()=>{
        expect(typeof eq.generateQuadraticEquation).toBe("function");
    });
    it("should export generateLinearInequality",()=>{
        expect(typeof eq.generateLinearInequality).toBe("function");
    });
    it("should export generateQuadraticInequality",()=>{
        expect(typeof eq.generateQuadraticInequality).toBe("function");
    });
    it("should export generateRationalInequality",()=>{
        expect(typeof eq.generateRationalInequality).toBe("function");
    });
    it("should export generateSystem2x2",()=>{
        expect(typeof eq.generateSystem2x2).toBe("function");
    });
    it("should export generateSystem3x3",()=>{
        expect(typeof eq.generateSystem3x3).toBe("function");
    });
});
