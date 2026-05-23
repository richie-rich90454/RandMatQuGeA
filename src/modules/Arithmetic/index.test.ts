import {describe,it,expect,vi} from "vitest";
vi.mock("../../script.js",()=>({}));
import {getRangeForDifficulty,getMaxForDifficulty,gcd,isPrime,generateAddition,generateSubtraction,generateMultiplication,generateDivision,generateWholeNumberPlaceValue,generateNumberLineOrdering,generateDivisibility,generateGCFLCM} from "./index.js";
describe("barrel exports",()=>{
    it("exports getRangeForDifficulty",()=>{
        expect(typeof getRangeForDifficulty).toBe("function");
    });
    it("exports getMaxForDifficulty",()=>{
        expect(typeof getMaxForDifficulty).toBe("function");
    });
    it("exports gcd",()=>{
        expect(typeof gcd).toBe("function");
    });
    it("exports isPrime",()=>{
        expect(typeof isPrime).toBe("function");
    });
    it("exports generateAddition",()=>{
        expect(typeof generateAddition).toBe("function");
    });
    it("exports generateSubtraction",()=>{
        expect(typeof generateSubtraction).toBe("function");
    });
    it("exports generateMultiplication",()=>{
        expect(typeof generateMultiplication).toBe("function");
    });
    it("exports generateDivision",()=>{
        expect(typeof generateDivision).toBe("function");
    });
    it("exports generateWholeNumberPlaceValue",()=>{
        expect(typeof generateWholeNumberPlaceValue).toBe("function");
    });
    it("exports generateNumberLineOrdering",()=>{
        expect(typeof generateNumberLineOrdering).toBe("function");
    });
    it("exports generateDivisibility",()=>{
        expect(typeof generateDivisibility).toBe("function");
    });
    it("exports generateGCFLCM",()=>{
        expect(typeof generateGCFLCM).toBe("function");
    });
    it("getRangeForDifficulty returns correct range",()=>{
        let result=getRangeForDifficulty("easy");
        expect(result.min).toBe(1);
        expect(result.max).toBe(50);
    });
    it("getMaxForDifficulty returns correct max",()=>{
        let result=getMaxForDifficulty("hard",50);
        expect(result).toBe(100);
    });
    it("gcd computes correctly",()=>{
        expect(gcd(12,8)).toBe(4);
    });
    it("isPrime works",()=>{
        expect(isPrime(7)).toBe(true);
        expect(isPrime(4)).toBe(false);
    });
});
