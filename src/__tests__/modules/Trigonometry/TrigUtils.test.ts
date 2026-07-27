import{describe,it,expect}from"vitest";
import{formatPiFraction,getTrigFunction,getAngle,getPeriod,formatAngle,getReferenceAngle}from"../../../modules/Trigonometry/TrigUtils";
describe("formatPiFraction",()=>{
    it("returns 0 for zero",()=>{
        expect(formatPiFraction(0)).toBe("0");
    });
    it("returns π for Math.PI",()=>{
        expect(formatPiFraction(Math.PI)).toBe("π");
    });
    it("returns -π for -Math.PI",()=>{
        expect(formatPiFraction(-Math.PI)).toBe("-π");
    });
    it("returns π/2 for half pi",()=>{
        expect(formatPiFraction(Math.PI/2)).toBe("π/2");
    });
    it("returns -π/2 for negative half pi",()=>{
        expect(formatPiFraction(-Math.PI/2)).toBe("-π/2");
    });
    it("returns π/4 for quarter pi",()=>{
        expect(formatPiFraction(Math.PI/4)).toBe("π/4");
    });
    it("returns 3π/4 for three quarters pi",()=>{
        expect(formatPiFraction(3*Math.PI/4)).toBe("3π/4");
    });
    it("returns -3π/4 for negative three quarters pi",()=>{
        expect(formatPiFraction(-3*Math.PI/4)).toBe("-3π/4");
    });
    it("returns 2π for double pi",()=>{
        expect(formatPiFraction(2*Math.PI)).toBe("2π");
    });
    it("returns 8π for 8*Math.PI",()=>{
        expect(formatPiFraction(8*Math.PI)).toBe("8π");
    });
    it("returns decimal for non-matching fractions",()=>{
        expect(formatPiFraction(0.5)).toBe("0.50");
    });
    it("returns 5π/2 for five halves pi",()=>{
        expect(formatPiFraction(5*Math.PI/2)).toBe("5π/2");
    });
});
describe("getTrigFunction",()=>{
    it("should return sin for sin",()=>{
        expect(getTrigFunction("sin")).toBe("sin");
    });
    it("should return cos for cos",()=>{
        expect(getTrigFunction("cos")).toBe("cos");
    });
    it("should return tan for tan",()=>{
        expect(getTrigFunction("tan")).toBe("tan");
    });
    it("should return cot for cot",()=>{
        expect(getTrigFunction("cot")).toBe("cot");
    });
    it("should return sec for sec",()=>{
        expect(getTrigFunction("sec")).toBe("sec");
    });
    it("should return csc for csc",()=>{
        expect(getTrigFunction("csc")).toBe("csc");
    });
    it("should handle unknown function",()=>{
        expect(getTrigFunction("log")).toBe("unknown");
    });
    it("should handle empty string",()=>{
        expect(getTrigFunction("")).toBe("unknown");
    });
    it("should handle null input",()=>{
        expect(getTrigFunction(null as unknown as string)).toBe("unknown");
    });
});
describe("getAngle",()=>{
    it("should return angle in degrees for easy",()=>{
        let angle=getAngle("easy");
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThan(360);
        expect(Number.isInteger(angle)).toBe(true);
    });
    it("should return angle in radians for hard",()=>{
        let angle=getAngle("hard");
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThan(2*Math.PI);
    });
    it("should return special angles for medium",()=>{
        let angle=getAngle("medium");
        let specialAngles=[0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, 2*Math.PI/3, 3*Math.PI/4, 5*Math.PI/6, Math.PI, 7*Math.PI/6, 5*Math.PI/4, 4*Math.PI/3, 3*Math.PI/2, 5*Math.PI/3, 7*Math.PI/4, 11*Math.PI/6];
        expect(specialAngles).toContain(angle);
    });
    it("should handle invalid difficulty",()=>{
        expect(getAngle("invalid")).toBe(-1);
    });
    it("should return valid angle range",()=>{
        let easyAngle=getAngle("easy");
        expect(easyAngle).toBeGreaterThanOrEqual(0);
        expect(easyAngle).toBeLessThan(360);
        let hardAngle=getAngle("hard");
        expect(hardAngle).toBeGreaterThanOrEqual(0);
        expect(hardAngle).toBeLessThan(2*Math.PI);
    });
});
describe("getPeriod",()=>{
    it("should return 2pi for sin and cos",()=>{
        expect(getPeriod("sin")).toBe(2*Math.PI);
        expect(getPeriod("cos")).toBe(2*Math.PI);
    });
    it("should return pi for tan and cot",()=>{
        expect(getPeriod("tan")).toBe(Math.PI);
        expect(getPeriod("cot")).toBe(Math.PI);
    });
    it("should return 2pi for sec and csc",()=>{
        expect(getPeriod("sec")).toBe(2*Math.PI);
        expect(getPeriod("csc")).toBe(2*Math.PI);
    });
    it("should handle unknown function",()=>{
        expect(getPeriod("log")).toBe(-1);
    });
});
describe("formatAngle",()=>{
    it("should format degrees with degree symbol",()=>{
        expect(formatAngle(45, false)).toBe("45°");
    });
    it("should format radians with pi",()=>{
        expect(formatAngle(Math.PI/2, true)).toBe("π/2");
    });
    it("should format decimal radians",()=>{
        expect(formatAngle(0.5, true)).toBe("0.50");
    });
    it("should handle zero",()=>{
        expect(formatAngle(0, true)).toBe("0");
        expect(formatAngle(0, false)).toBe("0°");
    });
    it("should handle negative angles",()=>{
        expect(formatAngle(-Math.PI/4, true)).toBe("-π/4");
        expect(formatAngle(-30, false)).toBe("-30°");
    });
});
describe("getReferenceAngle",()=>{
    it("should return same angle for quadrant 1",()=>{
        expect(getReferenceAngle(Math.PI/4)).toBe(Math.PI/4);
    });
    it("should return pi minus angle for quadrant 2",()=>{
        expect(getReferenceAngle(3*Math.PI/4)).toBe(Math.PI/4);
    });
    it("should return angle minus pi for quadrant 3",()=>{
        expect(getReferenceAngle(5*Math.PI/4)).toBe(Math.PI/4);
    });
    it("should return 2pi minus angle for quadrant 4",()=>{
        expect(getReferenceAngle(7*Math.PI/4)).toBe(Math.PI/4);
    });
    it("should handle angles greater than 2pi",()=>{
        expect(getReferenceAngle(9*Math.PI/4)).toBe(Math.PI/4);
    });
    it("should handle negative angles",()=>{
        expect(getReferenceAngle(-Math.PI/4)).toBe(Math.PI/4);
    });
    it("should handle zero angle",()=>{
        expect(getReferenceAngle(0)).toBe(0);
    });
});
