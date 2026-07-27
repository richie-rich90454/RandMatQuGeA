/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import*as basics from"./AlgebraBasics.js";
describe("algebraBasics exports",()=>{
    it("should export generateFraction",()=>{
        expect(typeof basics.generateFraction).toBe("function");
    });
    it("should export generatePercent",()=>{
        expect(typeof basics.generatePercent).toBe("function");
    });
    it("should export generateRatioProportion",()=>{
        expect(typeof basics.generateRatioProportion).toBe("function");
    });
    it("should export generateUnitConversion",()=>{
        expect(typeof basics.generateUnitConversion).toBe("function");
    });
    it("should export generateExpressionEvaluation",()=>{
        expect(typeof basics.generateExpressionEvaluation).toBe("function");
    });
    it("should export generateNumberSets",()=>{
        expect(typeof basics.generateNumberSets).toBe("function");
    });
    it("should export generateProperties",()=>{
        expect(typeof basics.generateProperties).toBe("function");
    });
    it("should export generateOrderOfOperations",()=>{
        expect(typeof basics.generateOrderOfOperations).toBe("function");
    });
});
