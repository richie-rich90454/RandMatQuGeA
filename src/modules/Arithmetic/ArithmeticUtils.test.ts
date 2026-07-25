import {describe,it,expect} from "vitest";
import {getRangeForDifficulty,getMaxForDifficulty,gcd,isPrime} from "./ArithmeticUtils.js";
describe("getRangeForDifficulty",()=>{
    it("returns easy range",()=>{
        expect(getRangeForDifficulty("easy")).toEqual({min:1,max:50});
    });
    it("returns medium range",()=>{
        expect(getRangeForDifficulty("medium")).toEqual({min:-1000,max:1500});
    });
    it("returns hard range",()=>{
        expect(getRangeForDifficulty("hard")).toEqual({min:-1000,max:3000});
    });
    it("defaults to medium when no difficulty",()=>{
        expect(getRangeForDifficulty()).toEqual({min:-1000,max:1500});
    });
    it("defaults to medium for unknown difficulty",()=>{
        expect(getRangeForDifficulty("extreme")).toEqual({min:-1000,max:1500});
    });
    it("should return small range for easy",()=>{
        expect(getRangeForDifficulty("easy")).toEqual({min:1,max:50});
    });
    it("should return medium range for medium",()=>{
        expect(getRangeForDifficulty("medium")).toEqual({min:-1000,max:1500});
    });
    it("should return large range for hard",()=>{
        expect(getRangeForDifficulty("hard")).toEqual({min:-1000,max:3000});
    });
    it("should handle null difficulty",()=>{
        expect(getRangeForDifficulty(null as unknown as string)).toEqual({min:-1000,max:1500});
    });
    it("should handle empty difficulty",()=>{
        expect(getRangeForDifficulty("")).toEqual({min:-1000,max:1500});
    });
});
describe("getMaxForDifficulty",()=>{
    it("returns half baseMax for easy",()=>{
        expect(getMaxForDifficulty("easy",100)).toBe(50);
    });
    it("returns baseMax for medium",()=>{
        expect(getMaxForDifficulty("medium",100)).toBe(100);
    });
    it("returns double baseMax for hard",()=>{
        expect(getMaxForDifficulty("hard",100)).toBe(200);
    });
    it("defaults to baseMax 10",()=>{
        expect(getMaxForDifficulty()).toBe(10);
    });
    it("uses default baseMax for medium",()=>{
        expect(getMaxForDifficulty("medium")).toBe(10);
    });
    it("floors half for odd easy",()=>{
        expect(getMaxForDifficulty("easy",7)).toBe(3);
    });
    it("floors double for odd hard",()=>{
        expect(getMaxForDifficulty("hard",7)).toBe(14);
    });
    it("should return small max for easy",()=>{
        expect(getMaxForDifficulty("easy",100)).toBe(50);
    });
    it("should return medium max for medium",()=>{
        expect(getMaxForDifficulty("medium",100)).toBe(100);
    });
    it("should return large max for hard",()=>{
        expect(getMaxForDifficulty("hard",100)).toBe(200);
    });
    it("should handle null difficulty",()=>{
        expect(getMaxForDifficulty(null as unknown as string,100)).toBe(100);
    });
    it("should handle empty difficulty",()=>{
        expect(getMaxForDifficulty("",100)).toBe(100);
    });
});
describe("gcd",()=>{
    it("returns 6 for gcd(12,18)",()=>{
        expect(gcd(12,18)).toBe(6);
    });
    it("returns 1 for coprime numbers",()=>{
        expect(gcd(7,13)).toBe(1);
    });
    it("handles negative first argument",()=>{
        expect(gcd(-12,18)).toBe(6);
    });
    it("handles negative second argument",()=>{
        expect(gcd(12,-18)).toBe(6);
    });
    it("returns non-zero when one is zero",()=>{
        expect(gcd(0,5)).toBe(5);
    });
    it("returns 0 when both are zero",()=>{
        expect(gcd(0,0)).toBe(0);
    });
    it("returns divisor for exact multiple",()=>{
        expect(gcd(100,10)).toBe(10);
    });
    it("returns 1 for consecutive numbers",()=>{
        expect(gcd(7,8)).toBe(1);
    });
    it("should return first when second is 0",()=>{
        expect(gcd(5,0)).toBe(5);
    });
    it("should return second when first is 0",()=>{
        expect(gcd(0,5)).toBe(5);
    });
    it("should handle negative numbers",()=>{
        expect(gcd(-12,-18)).toBe(6);
    });
    it("should return 1 for coprime",()=>{
        expect(gcd(7,13)).toBe(1);
    });
    it("should handle equal numbers",()=>{
        expect(gcd(9,9)).toBe(9);
    });
});
describe("isPrime",()=>{
    it("returns true for 2",()=>{
        expect(isPrime(2)).toBe(true);
    });
    it("returns true for 3",()=>{
        expect(isPrime(3)).toBe(true);
    });
    it("returns true for 17",()=>{
        expect(isPrime(17)).toBe(true);
    });
    it("returns true for 97",()=>{
        expect(isPrime(97)).toBe(true);
    });
    it("returns false for 1",()=>{
        expect(isPrime(1)).toBe(false);
    });
    it("returns false for 0",()=>{
        expect(isPrime(0)).toBe(false);
    });
    it("returns false for negative numbers",()=>{
        expect(isPrime(-5)).toBe(false);
    });
    it("returns false for 4",()=>{
        expect(isPrime(4)).toBe(false);
    });
    it("returns false for 9",()=>{
        expect(isPrime(9)).toBe(false);
    });
    it("returns false for even numbers >2",()=>{
        expect(isPrime(100)).toBe(false);
    });
    it("returns false for 1 below prime",()=>{
        expect(isPrime(16)).toBe(false);
    });
    it("should return false for 0",()=>{
        expect(isPrime(0)).toBe(false);
    });
    it("should return false for 1",()=>{
        expect(isPrime(1)).toBe(false);
    });
    it("should return true for 2",()=>{
        expect(isPrime(2)).toBe(true);
    });
    it("should return true for 3",()=>{
        expect(isPrime(3)).toBe(true);
    });
    it("should return false for 4",()=>{
        expect(isPrime(4)).toBe(false);
    });
    it("should return true for large prime",()=>{
        expect(isPrime(101)).toBe(true);
    });
    it("should return false for large composite",()=>{
        expect(isPrime(100)).toBe(false);
    });
    it("should handle negative numbers",()=>{
        expect(isPrime(-5)).toBe(false);
    });
    it("should handle decimal numbers",()=>{
        expect(isPrime(3.7)).toBe(true);
    });
    it("should return true for 97",()=>{
        expect(isPrime(97)).toBe(true);
    });
});
