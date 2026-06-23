/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generateRationalEquation} from "./generateRationalEquation";
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
describe("generateRationalEquation", ()=>{
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
		generateRationalEquation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates simple rational equation correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3) // a -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6) // b -> floor(0.6*5)+1=3+1=4
			.mockReturnValueOnce(0.1) // c -> floor(0.1*5)+1=0+1=1
			.mockReturnValueOnce(0.2) // type -> Math.random()<0.5 -> "simple" (0.2<0.5)
			.mockReturnValueOnce(0.3) // d -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6) // e -> floor(0.6*5)+1=3+1=4
			.mockReturnValueOnce(0.1) // numA -> floor(0.1*5)+1=0+1=1
			.mockReturnValueOnce(0.2) // numB -> floor(0.2*5)+1=1+1=2
			.mockReturnValueOnce(0.3) // denC -> floor(0.3*5)+1=1+1=2
			.mockReturnValueOnce(0.6); // denD -> d which is 2
		generateRationalEquation();
		expect(mockDiv.innerHTML).toContain("Solve");
		expect((window as any).expectedFormat).toBe("Enter decimal answer");
	});
	it("generates extraneous solution question correctly", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3) // a -> 2
			.mockReturnValueOnce(0.6) // b -> 4
			.mockReturnValueOnce(0.1) // c -> 1
			.mockReturnValueOnce(0.8); // type -> Math.random()>=0.5 -> "extraneous"
		generateRationalEquation();
		expect(mockDiv.innerHTML).toContain("extraneous");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "no solution",
			display: "no solution"
		});
	});
	it("should set window.correctAnswer", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateRationalEquation();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.expectedFormat", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateRationalEquation();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateRationalEquation("easy");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle medium difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateRationalEquation("medium");
		expect(mockDiv.innerHTML).not.toBe("");
	});
	it("should handle hard difficulty", ()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.2)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6);
		generateRationalEquation("hard");
		expect(mockDiv.innerHTML).not.toBe("");
	});
});
