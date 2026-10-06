import{describe,it,expect}from"vitest";
import{getMaxForDifficulty,cleanupVisualization,getShapeName,getUnit,round,formatNumber}from"../../../modules/Geometry/GeometryUtils";
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
describe("getShapeName",()=>{
    it("should return circle for circle",()=>{
        expect(getShapeName("circle")).toBe("circle");
    });
    it("should return square for square",()=>{
        expect(getShapeName("square")).toBe("square");
    });
    it("should return rectangle for rectangle",()=>{
        expect(getShapeName("rectangle")).toBe("rectangle");
    });
    it("should return triangle for triangle",()=>{
        expect(getShapeName("triangle")).toBe("triangle");
    });
    it("should return trapezoid for trapezoid",()=>{
        expect(getShapeName("trapezoid")).toBe("trapezoid");
    });
    it("should return parallelogram for parallelogram",()=>{
        expect(getShapeName("parallelogram")).toBe("parallelogram");
    });
    it("should return rhombus for rhombus",()=>{
        expect(getShapeName("rhombus")).toBe("rhombus");
    });
    it("should return ellipse for ellipse",()=>{
        expect(getShapeName("ellipse")).toBe("ellipse");
    });
    it("should return polygon for polygon",()=>{
        expect(getShapeName("polygon")).toBe("polygon");
    });
    it("should handle unknown shape",()=>{
        expect(getShapeName("hexagon")).toBe("unknown");
    });
});
describe("getUnit",()=>{
    it("should return cm for metric",()=>{
        expect(getUnit("metric")).toBe("cm");
    });
    it("should return in for imperial",()=>{
        expect(getUnit("imperial")).toBe("in");
    });
    it("should return m for meters",()=>{
        expect(getUnit("meters")).toBe("m");
    });
    it("should return ft for feet",()=>{
        expect(getUnit("feet")).toBe("ft");
    });
    it("should handle null system",()=>{
        expect(getUnit(null)).toBe("");
    });
    it("should handle empty system",()=>{
        expect(getUnit("")).toBe("");
    });
});
describe("round",()=>{
    it("should round to 2 decimal places",()=>{
        expect(round(3.14159,2)).toBe(3.14);
    });
    it("should round to 0 decimal places",()=>{
        expect(round(3.7,0)).toBe(4);
    });
    it("should handle negative numbers",()=>{
        expect(round(-2.555,2)).toBe(-2.56);
    });
    it("should handle already rounded numbers",()=>{
        expect(round(5,2)).toBe(5);
    });
});
describe("formatNumber",()=>{
    it("should format integers",()=>{
        expect(formatNumber(42)).toBe("42");
    });
    it("should format decimals",()=>{
        expect(formatNumber(3.14)).toBe("3.14");
    });
    it("should handle pi symbol",()=>{
        expect(formatNumber("2*pi")).toBe("2*π");
    });
    it("should handle sqrt symbol",()=>{
        expect(formatNumber("sqrt(2)")).toBe("√(2)");
    });
    it("should format fractions",()=>{
        expect(formatNumber(1/3)).toBe("0.33");
    });
});
