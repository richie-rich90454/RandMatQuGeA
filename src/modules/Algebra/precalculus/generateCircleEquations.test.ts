/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateCircleEquations} from "./generateCircleEquations";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>5),
}));
describe("generateCircleEquations", ()=>{
	let originalMathRandom: ()=>number;
	let mockDiv: HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={typesetPromise: vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null", ()=>{
		(questionArea as any)=null;
		generateCircleEquations();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates standard form question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "standard"
			.mockReturnValueOnce(0.3) // h -> floor(0.3*10)-5=3-5=-2
			.mockReturnValueOnce(0.6) // k -> floor(0.6*10)-5=6-5=1
			.mockReturnValueOnce(0.5); // r -> floor(0.5*5)+1=2+1=3
		generateCircleEquations();
		expect(mockDiv.innerHTML).toContain("circle");
		expect((window as any).expectedFormat).toBe("Enter as (x-h)^2 + (y-k)^2 = r^2");
	});
	it("generates center_radius question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "center_radius"
			.mockReturnValueOnce(0.3) // h
			.mockReturnValueOnce(0.6) // k
			.mockReturnValueOnce(0.5); // r
		generateCircleEquations();
		expect(mockDiv.innerHTML).toContain("center");
		expect((window as any).expectedFormat).toBe("Enter as 'center (h,k), radius r'");
	});
	it("generates complete_square question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "complete_square"
			.mockReturnValueOnce(0.3) // h -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6) // k -> floor(0.6*5)+1=3+1=4
			.mockReturnValueOnce(0.5); // r -> floor(0.5*5)+1=2+1=3
		generateCircleEquations();
		expect(mockDiv.innerHTML).toContain("Complete the square");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "center (2, 4), radius 3",
			display: "center (2, 4), radius 3"
		});
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateCircleEquations();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateCircleEquations();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateCircleEquations("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateCircleEquations("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateCircleEquations("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
