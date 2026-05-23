import {describe,it,expect} from "vitest";
import * as la from "./index.js";
describe("LinearAlgebra index exports",()=>{
	it("exports generateMatrix",()=>{
		expect(typeof la.generateMatrix).toBe("function");
	});
	it("exports generateVector",()=>{
		expect(typeof la.generateVector).toBe("function");
	});
	it("exports generateSystem3x3",()=>{
		expect(typeof la.generateSystem3x3).toBe("function");
	});
	it("exports getRange",()=>{
		expect(typeof la.getRange).toBe("function");
	});
	it("exports matrixToString",()=>{
		expect(typeof la.matrixToString).toBe("function");
	});
});
