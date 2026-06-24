/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generatePowerFunctionModeling} from "./generatePowerFunctionModeling";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>10),
}));
describe("generatePowerFunctionModeling", ()=>{
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
		generatePowerFunctionModeling();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates direct variation question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "direct"
			.mockReturnValueOnce(0.3) // k -> floor(0.3*10)+1=3+1=4
			.mockReturnValueOnce(0.1) // x1 -> floor(0.1*10)+1=1+1=2
			.mockReturnValueOnce(0.5); // x2 -> floor(0.5*10)+1=5+1=6
		generatePowerFunctionModeling();
		expect(mockDiv.innerHTML).toContain("varies directly");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "24",
			display: "24"
		});
	});
	it("generates inverse variation question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "inverse"
			.mockReturnValueOnce(0.3) // k -> 4
			.mockReturnValueOnce(0.1) // x1 -> 2 -> y1=8
			.mockReturnValueOnce(0.5); // x2 -> 6
		generatePowerFunctionModeling();
		expect(mockDiv.innerHTML).toContain("varies inversely");
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("generates power variation question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "power"
			.mockReturnValueOnce(0.3) // k -> 4
			.mockReturnValueOnce(0.1) // x1 -> 2
			.mockReturnValueOnce(0.5) // x2 -> 6
			.mockReturnValueOnce(0.5); // exp -> floor(0.5*2)+2=1+2=3
		generatePowerFunctionModeling();
		expect(mockDiv.innerHTML).toContain("rd power");
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		generatePowerFunctionModeling();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		generatePowerFunctionModeling();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		generatePowerFunctionModeling("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		generatePowerFunctionModeling("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5);
		generatePowerFunctionModeling("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
