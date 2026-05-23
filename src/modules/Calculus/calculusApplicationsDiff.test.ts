/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateApplicationsDiff} from "./calculusApplicationsDiff";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateApplicationsDiff",()=>{
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
		generateApplicationsDiff();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates lhopital correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.06)// type->floor(18*0.06)=1 lhopital
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateApplicationsDiff();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2"
		});
	});
	it("generates optimization correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.62)// type->floor(18*0.62)=11 optimization
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateApplicationsDiff();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"1, 1",
			alternate:"1, 1"
		});
	});
	it("generates secondDerivativeTest correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.45)// type->floor(18*0.45)=8 secondDerivativeTest
			.mockReturnValueOnce(0.3);
		generateApplicationsDiff();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"inconclusive",
			alternate:"inconclusive"
		});
	});
	it("generates linearization correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.01)// type->floor(18*0.01)=0 linearization
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=2
			.mockReturnValueOnce(0.5)// b->floor(5*0.5)+1=3
			.mockReturnValueOnce(0.5);// x0->floor(5*0.5)+1=3
		generateApplicationsDiff();
		let point=2*3+3;
		let approx=Math.sqrt(point)+(0.1)/(2*Math.sqrt(point));
		expect((window as any).correctAnswer).toMatchObject({
			correct:approx.toFixed(3),
			alternate:approx.toFixed(3)
		});
	});
	it("generates mvt correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.12)// type->floor(18*0.12)=2 mvt
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateApplicationsDiff();
		let c=1/Math.sqrt(3);
		expect((window as any).correctAnswer).toMatchObject({
			correct:c.toFixed(2),
			alternate:c.toFixed(2)
		});
	});
});
