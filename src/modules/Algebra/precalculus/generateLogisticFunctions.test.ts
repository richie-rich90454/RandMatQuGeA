/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateLogisticFunctions} from "./generateLogisticFunctions";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number){return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number){return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>10),
}));
describe("generateLogisticFunctions", ()=>{
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
		generateLogisticFunctions();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates identify question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "identify"
			.mockReturnValueOnce(0.5) // c -> floor(0.5*10)+5=5+5=10
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.5) // k -> 0.50
			.mockReturnValueOnce(0.5); // x (unused in identify)
		generateLogisticFunctions();
		expect(mockDiv.innerHTML).toContain("Identify the type");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "logistic",
			display: "logistic"
		});
	});
	it("generates limit question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "limit"
			.mockReturnValueOnce(0.5) // c
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.5) // k
			.mockReturnValueOnce(0.5); // x
		generateLogisticFunctions();
		expect(mockDiv.innerHTML).toContain("carrying capacity");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "10",
			display: "10"
		});
	});
	it("generates value question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "value"
			.mockReturnValueOnce(0.5) // c
			.mockReturnValueOnce(0.3) // a
			.mockReturnValueOnce(0.5) // k
			.mockReturnValueOnce(0.5); // x
		generateLogisticFunctions();
		expect(mockDiv.innerHTML).toContain("Evaluate");
		expect((window as any).expectedFormat).toBe("Enter decimal");
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateLogisticFunctions();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateLogisticFunctions();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateLogisticFunctions("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateLogisticFunctions("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5);
		generateLogisticFunctions("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
