import{describe,it,expect}from"vitest";
import{formatPiFraction}from"./trigUtils";
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
