import {describe,it,expect} from "vitest";
import * as dm from "./index.js";
describe("DiscreteMathematics index exports",()=>{
	it("exports generatePermutation",()=>{
		expect(typeof dm.generatePermutation).toBe("function");
	});
	it("exports generateCombination",()=>{
		expect(typeof dm.generateCombination).toBe("function");
	});
	it("exports generateProbability",()=>{
		expect(typeof dm.generateProbability).toBe("function");
	});
	it("exports generateStatistics",()=>{
		expect(typeof dm.generateStatistics).toBe("function");
	});
	it("exports factorial",()=>{
		expect(typeof dm.factorial).toBe("function");
	});
});
