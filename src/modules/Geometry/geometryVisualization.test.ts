/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,vi} from "vitest";
import {cleanupVisualization} from "./geometryVisualization.js";
describe("cleanupVisualization",()=>{
	beforeEach(()=>{
		document.body.innerHTML='<div id="geometry-visualization">vis</div><div id="geometry-info">info</div>';
	});
	it("removes visualization container from DOM",()=>{
		cleanupVisualization();
		expect(document.getElementById("geometry-visualization")).toBeNull();
	});
	it("removes info element from DOM",()=>{
		cleanupVisualization();
		expect(document.getElementById("geometry-info")).toBeNull();
	});
	it("does not throw when no visualization exists",()=>{
		document.body.innerHTML="";
		expect(()=>cleanupVisualization()).not.toThrow();
	});
	it("handles missing info element gracefully",()=>{
		document.body.innerHTML='<div id="geometry-visualization">vis</div>';
		expect(()=>cleanupVisualization()).not.toThrow();
	});
});
