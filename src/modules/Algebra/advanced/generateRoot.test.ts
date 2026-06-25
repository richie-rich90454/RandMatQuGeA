/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateRoot} from "./generateRoot";
import {getMaxForDifficulty} from "../algebraUtils.js";
let sink=vi.hoisted(()=>({ div: null as HTMLDivElement|null }));
vi.mock("../../../main/core/questionRenderer",()=>({
	renderer:{
		render(html: string){
			if(sink.div) sink.div.innerHTML=html;
			let mj=(window as any).MathJax;
			if(mj&&typeof mj.typesetPromise==="function") mj.typesetPromise([sink.div]);
		},
		clear(){ if(sink.div) sink.div.innerHTML=""; },
		setAnswer(a: any){ (window as any).correctAnswer=a; },
		setExpectedFormat(f: string){ (window as any).expectedFormat=f; },
		setHasQuestion(v: boolean){ (window as any).hasQuestion=v; },
		typeset(){
			let mj=(window as any).MathJax;
			if(mj&&typeof mj.typesetPromise==="function") mj.typesetPromise([sink.div]);
		}
	}
}));
vi.mock("../algebraUtils.js",()=>({
	factorial:vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd:vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal:vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
	getMaxForDifficulty:vi.fn(()=>4),
}));
describe("generateRoot",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		sink.div=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		sink.div=null;
		generateRoot();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("generates square root (root===2) correctly",()=>{
		// root=floor(0.1*4)+2=2, base=floor(0.3*4)+1=2, radicand=4
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)//root offset->2
			.mockReturnValueOnce(0.3);//base offset->2
		generateRoot();
		expect(mockDiv.innerHTML).toBe("\\[ \\sqrt{4}=? \\]");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2",
			display:"2"
		});
		expect((window as any).expectedFormat).toBe("Enter a whole number");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates nth root (root!==2) correctly",()=>{
		// root=floor(0.5*4)+2=4, base=floor(0.5*4)+1=3, radicand=3^4=81
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5)//root offset->4
			.mockReturnValueOnce(0.5);//base offset->3
		generateRoot();
		expect(mockDiv.innerHTML).toBe("\\[ \\sqrt[4]{81}=? \\]");
		expect((window as any).correctAnswer).toMatchObject({
			correct:"3",
			alternate:"3",
			display:"3"
		});
	});
	it("uses getMaxForDifficulty with provided difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(8).mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRoot("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard",4);
		expect(mockGetMax).toHaveBeenCalledWith("hard",10);
	});
	it("does not call MathJax.typesetPromise if MathJax is missing",()=>{
		delete(window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRoot();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateRoot();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3);
		generateRoot();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(4).mockReturnValueOnce(10);
		Math.random=vi.fn()
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRoot("easy");
		expect(mockGetMax).toHaveBeenCalledWith("easy", 4);
		expect(mockGetMax).toHaveBeenCalledWith("easy", 10);
	});
	it("should handle medium difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(6).mockReturnValueOnce(15);
		Math.random=vi.fn()
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRoot("medium");
		expect(mockGetMax).toHaveBeenCalledWith("medium", 4);
		expect(mockGetMax).toHaveBeenCalledWith("medium", 10);
	});
	it("should handle hard difficulty",()=>{
		const mockGetMax=vi.mocked(getMaxForDifficulty);
		mockGetMax.mockClear();
		mockGetMax.mockReturnValueOnce(8).mockReturnValueOnce(20);
		Math.random=vi.fn()
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(0);
		generateRoot("hard");
		expect(mockGetMax).toHaveBeenCalledWith("hard", 4);
		expect(mockGetMax).toHaveBeenCalledWith("hard", 10);
	});
});
