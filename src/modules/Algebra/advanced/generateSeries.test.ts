/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateSeries} from "./generateSeries";
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number){return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number){return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>10),
}));
describe("generateSeries",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateSeries();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates arithmetic_sum correctly",()=>{
		// a1=floor(0.3*10)+1=4, d=floor(0.5*5)+1=3, n=floor(0.7*10)+5=12
		// sum=(12/2)*(2*4+11*3)=6*41=246
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)//type->arithmetic_sum
			.mockReturnValueOnce(0.3)//a1->4
			.mockReturnValueOnce(0.5)//d->3
			.mockReturnValueOnce(0.7);//n->12
		generateSeries();
		expect(mockDiv.innerHTML).toBe("<div>Find the sum of the first 12 terms of the arithmetic sequence: \\[ S_n=\\frac{n}{2} [2a_1+(n-1)d] \\] where \\( a_1=4 \\) and \\( d=3 \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"246",
			alternate:"246",
			display:"246"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates geometric_sum correctly",()=>{
		// a1=floor(0.3*5)+1=2, sign=1(0.6>=0.5), mag=4/9*0.9+0.1=0.5, rValue=0.5
		// n=floor(0.1*8)+3=3, sum=2*(1-0.125)/0.5=3.5
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)//type->geometric_sum
			.mockReturnValueOnce(0.3)//a1->2
			.mockReturnValueOnce(0.6)//sign->1
			.mockReturnValueOnce(4/9)//mag->0.5
			.mockReturnValueOnce(0.1);//n->3
		generateSeries();
		expect(mockDiv.innerHTML).toBe("<div>Find the sum of the first 3 terms of the geometric sequence: \\[ S_n=a_1 \\frac{1-r^n}{1-r} \\] where \\( a_1=2 \\) and \\( r=0.50 \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"3.50",
			display:"3.50"
		});
		expect((window as any).expectedFormat).toBe("Enter a decimal number");
	});
	it("generates convergence correctly",()=>{
		// 0.55->index 2->"convergence", 0.1->floor(0.3)=0->"\frac{1}{n^2}"->"converges"
		Math.random=vi.fn()
			.mockReturnValueOnce(0.55)//type->convergence
			.mockReturnValueOnce(0.1);//series index->0
		generateSeries();
		expect(mockDiv.innerHTML).toBe("<div>Determine if the series converges or diverges: \\[ \\sum_{n=1}^{\\infty} \\frac{1}{n^2} \\]</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"converges",
			display:"converges"
		});
		expect((window as any).expectedFormat).toBe("Enter 'converges' or 'diverges'");
	});
	it("generates nth_term correctly",()=>{
		// a1=4, d=3, n=12, an=4+11*3=37
		Math.random=vi.fn()
			.mockReturnValueOnce(0.85)//type->nth_term
			.mockReturnValueOnce(0.3)//a1->4
			.mockReturnValueOnce(0.5)//d->3
			.mockReturnValueOnce(0.7);//n->12
		generateSeries();
		expect(mockDiv.innerHTML).toBe("<div>Find the 12th term of the arithmetic sequence: \\[ a_n=a_1+(n-1)d \\] where \\( a_1=4 \\) and \\( d=3 \\).</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"37",
			alternate:"37",
			display:"37"
		});
		expect((window as any).expectedFormat).toBe("Enter a number");
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateSeries("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
		expect(mockGetMax).toHaveReturnedWith(20);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0);
		generateSeries();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.7);
		generateSeries();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.7);
		generateSeries();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(10);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateSeries("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy", 10);
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(15);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateSeries("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium", 10);
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateSeries("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 10);
	});
});
