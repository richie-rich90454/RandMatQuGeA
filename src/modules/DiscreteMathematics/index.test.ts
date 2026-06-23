/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import * as dm from "./index.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",()=>({
	factorial:vi.fn((n)=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;}),
	gcd:vi.fn((a,b)=>{let t;while(b){t=b;b=a%b;a=t;}return Math.abs(a);}),
	lcm:vi.fn((a,b)=>{if(a===0||b===0)return 0;let x=a,y=b;while(y){let t=y;y=x%y;x=t;}return Math.abs(a*b)/Math.abs(x);}),
	nPr:vi.fn((n,r)=>{if(r>n)return 0;let p=1;for(let i=n;i>n-r;i--)p*=i;return p;}),
	nCr:vi.fn((n,r)=>{if(r>n)return 0;let p=1;for(let i=n;i>n-r;i--)p*=i;for(let i=2;i<=r;i++)p/=i;return Math.round(p);}),
	getMaxN:vi.fn(()=>6),
	getDataRange:vi.fn(()=>({min:1,max:20,count:5})),
	mean:vi.fn((arr)=>arr.reduce((a,b)=>a+b,0)/arr.length),
	median:vi.fn((arr)=>{let s=[...arr].sort((a,b)=>a-b);let m=Math.floor(s.length/2);return s.length%2===0?(s[m-1]+s[m])/2:s[m];}),
	mode:vi.fn((arr)=>{let f={};arr.forEach(v=>f[v]=(f[v]||0)+1);let mx=Math.max(...Object.values(f));return Object.keys(f).filter(k=>f[k]===mx).map(Number);}),
	range:vi.fn((arr)=>Math.max(...arr)-Math.min(...arr)),
	stdDev:vi.fn((arr)=>{let m=arr.reduce((a,b)=>a+b,0)/arr.length;return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length);}),
	getOrdinal:vi.fn((n)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
}));
describe("DiscreteMathematics index exports",()=>{
	it("exports generatePermutation",()=>{
		expect(typeof dm.generatePermutation).toBe("function");
	});
	it("exports generateCombination",()=>{
		expect(typeof dm.generateCombination).toBe("function");
	});
	it("exports generateProbability",()=>{
		expect(typeof dm.generateProbability).toBe("function");
	});
	it("exports generateStatistics",()=>{
		expect(typeof dm.generateStatistics).toBe("function");
	});
	it("exports factorial",()=>{
		expect(typeof dm.factorial).toBe("function");
	});
});
describe("DiscreteMathematics index function calls",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		(window as any).MathJax={typeset:vi.fn(),typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete(window as any).MathJax;
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		dm.generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		dm.generatePermutation();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		dm.generatePermutation("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		dm.generateCombination("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		dm.generateProbability("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
