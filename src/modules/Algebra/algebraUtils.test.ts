import {describe,it,expect} from "vitest";
import {factorial,gcd,getOrdinal,getMaxForDifficulty} from "./algebraUtils.js";
describe("factorial",()=>{
    it("returns 1 for 0",()=>{
        expect(factorial(0)).toBe(1);
    });
    it("returns 1 for 1",()=>{
        expect(factorial(1)).toBe(1);
    });
    it("returns 120 for 5",()=>{
        expect(factorial(5)).toBe(120);
    });
    it("returns NaN for negative input",()=>{
        expect(factorial(-1)).toBe(NaN);
    });
    it("returns 2 for 2",()=>{
        expect(factorial(2)).toBe(2);
    });
    it("returns 6 for 3",()=>{
        expect(factorial(3)).toBe(6);
    });
    it("returns 3628800 for 10",()=>{
        expect(factorial(10)).toBe(3628800);
    });
    it("handles large numbers",()=>{
        expect(factorial(20)).toBe(2432902008176640000);
    });
});
describe("gcd",()=>{
    it("returns 4 for gcd(12,8)",()=>{
        expect(gcd(12,8)).toBe(4);
    });
    it("returns 1 for coprime numbers",()=>{
        expect(gcd(7,13)).toBe(1);
    });
    it("handles negative numbers",()=>{
        expect(gcd(-12,8)).toBe(4);
    });
    it("returns the other number when one is zero",()=>{
        expect(gcd(0,5)).toBe(5);
    });
    it("returns first number when second is 0",()=>{
        expect(gcd(9,0)).toBe(9);
    });
    it("returns second number when first is 0",()=>{
        expect(gcd(0,7)).toBe(7);
    });
    it("handles both negative numbers",()=>{
        expect(gcd(-12,-8)).toBe(4);
    });
    it("returns 1 for coprime numbers 17 and 19",()=>{
        expect(gcd(17,19)).toBe(1);
    });
    it("handles equal numbers",()=>{
        expect(gcd(5,5)).toBe(5);
    });
});
describe("getOrdinal",()=>{
    it("returns st for 1",()=>{
        expect(getOrdinal(1)).toBe("st");
    });
    it("returns nd for 2",()=>{
        expect(getOrdinal(2)).toBe("nd");
    });
    it("returns rd for 3",()=>{
        expect(getOrdinal(3)).toBe("rd");
    });
    it("returns th for 4",()=>{
        expect(getOrdinal(4)).toBe("th");
    });
    it("returns th for 11",()=>{
        expect(getOrdinal(11)).toBe("th");
    });
    it("returns st for 21",()=>{
        expect(getOrdinal(21)).toBe("st");
    });
    it("returns 1st for 1",()=>{
        expect(getOrdinal(1)).toBe("st");
    });
    it("returns 2nd for 2",()=>{
        expect(getOrdinal(2)).toBe("nd");
    });
    it("returns 3rd for 3",()=>{
        expect(getOrdinal(3)).toBe("rd");
    });
    it("returns 4th for 4",()=>{
        expect(getOrdinal(4)).toBe("th");
    });
    it("returns 11th for 11",()=>{
        expect(getOrdinal(11)).toBe("th");
    });
    it("returns 21st for 21",()=>{
        expect(getOrdinal(21)).toBe("st");
    });
    it("returns 22nd for 22",()=>{
        expect(getOrdinal(22)).toBe("nd");
    });
    it("returns 23rd for 23",()=>{
        expect(getOrdinal(23)).toBe("rd");
    });
});
describe("getMaxForDifficulty",()=>{
    it("returns half baseMax for easy",()=>{
        expect(getMaxForDifficulty("easy")).toBe(5);
    });
    it("returns baseMax for medium",()=>{
        expect(getMaxForDifficulty("medium")).toBe(10);
    });
    it("returns double baseMax for hard",()=>{
        expect(getMaxForDifficulty("hard")).toBe(20);
    });
    it("respects custom baseMax for easy",()=>{
        expect(getMaxForDifficulty("easy",20)).toBe(10);
    });
    it("returns default baseMax when no difficulty given",()=>{
        expect(getMaxForDifficulty()).toBe(10);
    });
});
