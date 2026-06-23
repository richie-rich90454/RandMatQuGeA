/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateFunctionOperations} from "./generateFunctionOperations";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js", ()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number){return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number){return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>5),
}));
describe("generateFunctionOperations", ()=>{
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
		generateFunctionOperations();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates composition question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0) // type "composition"
			.mockReturnValueOnce(0.1) // a -> floor(0.1*5)+1=0+1=1
			.mockReturnValueOnce(0.2) // b -> floor(0.2*5)+1=1+1=2
			.mockReturnValueOnce(0.3) // c -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.5); // xVal -> floor(0.5*5)+1=2+1=3
		generateFunctionOperations();
		expect(mockDiv.innerHTML).toContain("f \\circ g");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "11",
			display: "11"
		});
	});
	it("generates sum question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35) // type "sum"
			.mockReturnValueOnce(0.1) // a
			.mockReturnValueOnce(0.2) // b
			.mockReturnValueOnce(0.3); // c
		generateFunctionOperations();
		expect(mockDiv.innerHTML).toContain("(f+g)(x)");
		expect((window as any).expectedFormat).toBe("Enter as polynomial");
	});
	it("generates product question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7) // type "product"
			.mockReturnValueOnce(0.1) // a
			.mockReturnValueOnce(0.2) // b
			.mockReturnValueOnce(0.3); // c
		generateFunctionOperations();
		expect(mockDiv.innerHTML).toContain("f \\cdot g");
		expect((window as any).expectedFormat).toBe("Enter as polynomial");
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFunctionOperations();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.35)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3);
		generateFunctionOperations();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFunctionOperations("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFunctionOperations("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5);
		generateFunctionOperations("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
