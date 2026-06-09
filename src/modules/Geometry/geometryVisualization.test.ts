/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach} from "vitest";
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
	it("removes both elements when both exist",()=>{
		document.body.innerHTML='<div id="geometry-visualization">vis</div><div id="geometry-info">info</div>';
		cleanupVisualization();
		expect(document.getElementById("geometry-visualization")).toBeNull();
		expect(document.getElementById("geometry-info")).toBeNull();
	});
	it("does not remove unrelated elements",()=>{
		document.body.innerHTML='<div id="other">keep</div><div id="geometry-visualization">vis</div>';
		cleanupVisualization();
		expect(document.getElementById("other")).not.toBeNull();
	});
	it("handles missing visualization element gracefully",()=>{
		document.body.innerHTML='<div id="geometry-info">info</div>';
		expect(()=>cleanupVisualization()).not.toThrow();
		expect(document.getElementById("geometry-info")).toBeNull();
	});
	it("does not throw when called multiple times",()=>{
		document.body.innerHTML='<div id="geometry-visualization">vis</div><div id="geometry-info">info</div>';
		cleanupVisualization();
		expect(()=>cleanupVisualization()).not.toThrow();
	});
	it("cleans up even when DOM has only text nodes",()=>{
		document.body.innerHTML='text<div id="geometry-visualization">vis</div>';
		cleanupVisualization();
		expect(document.getElementById("geometry-visualization")).toBeNull();
	});
});
