/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateArithmeticSequence,generateGeometricSequence,generateSequenceLimit,generateBinomialTheorem} from "./discreteSequenceSeries.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",()=>({
	factorial:vi.fn((n)=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;}),
	gcd:vi.fn((a,b)=>{let t;while(b){t=b;b=a%b;a=t;}return Math.abs(a);}),
	lcm:vi.fn((a,b)=>{if(a===0||b===0)return 0;let x=a,y=b;while(y){let t=y;y=x%y;x=t;}return Math.abs(a*b)/Math.abs(x);}),
	nPr:vi.fn((n,r)=>{if(r>n)return 0;let p=1;for(let i=n;i>n-r;i--)p*=i;return p;}),
	nCr:vi.fn((n,r)=>{if(r>n)return 0;let p=1;for(let i=n;i>n-r;i--)p*=i;for(let i=2;i<=r;i++)p/=i;return Math.round(p);}),
	getMaxN:vi.fn(()=>6),
	getDataRange:vi.fn((d)=>{if(d==="easy")return{min:1,max:20,count:5};if(d==="hard")return{min:-50,max:100,count:15};return{min:0,max:50,count:10};}),
	mean:vi.fn((arr:number[])=>arr.reduce((a:number,b:number)=>a+b,0)/arr.length),
	median:vi.fn((arr:number[])=>{let s=[...arr].sort((a:number,b:number)=>a-b);let m=Math.floor(s.length/2);return s.length%2===0?(s[m-1]+s[m])/2:s[m];}),
	mode:vi.fn((arr:number[])=>{let f:Record<string,number>={};arr.forEach((v:number)=>f[v]=(f[v]||0)+1);let mx=Math.max(...Object.values(f));return Object.keys(f).filter(k=>f[k]===mx).map(Number);}),
	range:vi.fn((arr)=>Math.max(...arr)-Math.min(...arr)),
	stdDev:vi.fn((arr:number[])=>{let m=arr.reduce((a:number,b:number)=>a+b,0)/arr.length;return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length);}),
	getOrdinal:vi.fn((n)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
}));
describe("generateArithmeticSequence",()=>{
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
		generateArithmeticSequence();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates arithmetic term correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates arithmetic sum correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.6);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates geometric sequence correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateGeometricSequence();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates sequence limit correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateSequenceLimit();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates binomial theorem correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateBinomialTheorem();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
describe("generateArithmeticSequence - edge cases",()=>{
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
	it("should produce non-empty question HTML",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
		expect((window as any).expectedFormat.length).toBeGreaterThan(0);
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn().mockReturnValue(0.3);
		generateArithmeticSequence();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
	});
});
