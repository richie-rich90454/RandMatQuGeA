import {describe,it,expect} from "vitest";
import * as trig from "./index.js";
describe("Trigonometry index exports",()=>{
	it("exports generateSin",()=>{
		expect(typeof trig.generateSin).toBe("function");
	});
	it("exports generateCosine",()=>{
		expect(typeof trig.generateCosine).toBe("function");
	});
	it("exports generateTangent",()=>{
		expect(typeof trig.generateTangent).toBe("function");
	});
	it("exports generateCosecant",()=>{
		expect(typeof trig.generateCosecant).toBe("function");
	});
	it("exports formatPiFraction",()=>{
		expect(typeof trig.formatPiFraction).toBe("function");
	});
});
