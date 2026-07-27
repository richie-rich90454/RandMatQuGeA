import {describe,it,expect} from "vitest";
import * as geom from "../../../modules/Geometry/index.js";
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
	it("exports generateArcLength",()=>{
		expect(typeof geom.generateArcLength).toBe("function");
	});
	it("exports generateEllipse",()=>{
		expect(typeof geom.generateEllipse).toBe("function");
	});
	it("exports generateVolumeCylinder",()=>{
		expect(typeof geom.generateVolumeCylinder).toBe("function");
	});
	it("exports generateSectorArea",()=>{
		expect(typeof geom.generateSectorArea).toBe("function");
	});
});
