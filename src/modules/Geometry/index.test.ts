import {describe,it,expect} from "vitest";
import * as geom from "./index.js";
describe("Geometry index exports",()=>{
	it("exports generateAreaCircle",()=>{
		expect(typeof geom.generateAreaCircle).toBe("function");
	});
	it("exports generateVolumeSphere",()=>{
		expect(typeof geom.generateVolumeSphere).toBe("function");
	});
	it("exports generatePythagorean",()=>{
		expect(typeof geom.generatePythagorean).toBe("function");
	});
	it("exports generateParabola",()=>{
		expect(typeof geom.generateParabola).toBe("function");
	});
	it("exports generatePerimeter",()=>{
		expect(typeof geom.generatePerimeter).toBe("function");
	});
});
