/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateParametricPolarVector} from "./calculusParametricPolarVector";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateParametricPolarVector",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typeset:vi.fn()};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateParametricPolarVector();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates parametricDeriv correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.04)// type->floor(13*0.04)=0 parametricDeriv
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.5);// t->floor(3*0.5)+1=1+1=2
		generateParametricPolarVector();
		let dx=2*2*2;
		let dy=3*4-3;
		let deriv=dy/dx;
		expect((window as any).correctAnswer).toMatchObject({
			correct:deriv.toFixed(3),
			alternate:deriv.toFixed(3)
		});
	});
	it("generates polarArea correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.54)// type->floor(13*0.54)=7 polarArea
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateParametricPolarVector();
		let area=Math.PI*(1+2);
		expect((window as any).correctAnswer).toMatchObject({
			correct:area.toFixed(3),
			alternate:area.toFixed(3)
		});
	});
	it("generates vectorIntegral correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.31)// type->floor(13*0.31)=4 vectorIntegral
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateParametricPolarVector();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"<0.500, 0.667>",
			alternate:"<0.500, 0.667>"
		});
	});
	it("generates motionParam correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(13*0.4)=5 motionParam
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateParametricPolarVector();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2"
		});
	});
});
