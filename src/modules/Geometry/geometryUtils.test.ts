import{describe,it,expect}from"vitest";
import{getMaxForDifficulty,cleanupVisualization}from"./geometryUtils";
describe("getMaxForDifficulty",()=>{
    it("returns baseMax when difficulty is undefined",()=>{
        expect(getMaxForDifficulty(undefined,10)).toBe(10);
    });
    it("returns default baseMax(10) when no arguments given",()=>{
        expect(getMaxForDifficulty()).toBe(10);
    });
    it("returns half of baseMax for easy difficulty",()=>{
        expect(getMaxForDifficulty("easy",10)).toBe(5);
    });
    it("returns double baseMax for hard difficulty",()=>{
        expect(getMaxForDifficulty("hard",10)).toBe(20);
    });
    it("returns floor(half) for easy with odd baseMax",()=>{
        expect(getMaxForDifficulty("easy",9)).toBe(4);
    });
    it("returns baseMax for unknown difficulty string",()=>{
        expect(getMaxForDifficulty("extreme",10)).toBe(10);
    });
    it("returns custom baseMax when difficulty is medium",()=>{
        expect(getMaxForDifficulty(undefined,25)).toBe(25);
    });
    it("scales easy with custom baseMax",()=>{
        expect(getMaxForDifficulty("easy",20)).toBe(10);
    });
    it("scales hard with custom baseMax",()=>{
        expect(getMaxForDifficulty("hard",50)).toBe(100);
    });
    it("handles easy with zero baseMax",()=>{
        expect(getMaxForDifficulty("easy",0)).toBe(0);
    });
    it("handles hard with zero baseMax",()=>{
        expect(getMaxForDifficulty("hard",0)).toBe(0);
    });
});
describe("cleanupVisualization",()=>{
    it("is a function",()=>{
        expect(typeof cleanupVisualization).toBe("function");
    });
});
