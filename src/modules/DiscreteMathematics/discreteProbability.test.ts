/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateProbability} from "./discreteProbability.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
vi.mock("./discreteUtils.js",()=>({
	factorial:vi.fn((n)=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;}),
	gcd:vi.fn((a,b)=>{let t;while(b){t=b;b=a%b;a=t;}return Math.abs(a);}),
	lcm:vi.fn((a,b)=>{if(a===0||b===0)return 0;let x=a,y=b;while(y){let t=y;y=x%y;x=t;}return Math.abs(a*b)/Math.abs(x);}),
	nPr:vi.fn((n,r)=>{if(r>n)return 0;let p=1;for(let i=n;i>n-r;i--)p*=i;return p;}),
	nCr:vi.fn((n,r)=>{if(r>n)return 0;let p=1;for(let i=n;i>n-r;i--)p*=i;for(let i=2;i<=r;i++)p/=i;return Math.round(p);}),
	getMaxN:vi.fn(()=>6),
	getDataRange:vi.fn((d)=>{if(d==="easy")return{min:1,max:20,count:5};if(d==="hard")return{min:-50,max:100,count:15};return{min:0,max:50,count:10};}),
	mean:vi.fn((arr)=>arr.reduce((a,b)=>a+b,0)/arr.length),
	median:vi.fn((arr)=>{let s=[...arr].sort((a,b)=>a-b);let m=Math.floor(s.length/2);return s.length%2===0?(s[m-1]+s[m])/2:s[m];}),
	mode:vi.fn((arr)=>{let f={};arr.forEach(v=>f[v]=(f[v]||0)+1);let mx=Math.max(...Object.values(f));return Object.keys(f).filter(k=>f[k]===mx).map(Number);}),
	range:vi.fn((arr)=>Math.max(...arr)-Math.min(...arr)),
	stdDev:vi.fn((arr)=>{let m=arr.reduce((a,b)=>a+b,0)/arr.length;return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length);}),
	getOrdinal:vi.fn((n)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
}));
describe("generateProbability",()=>{
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
		generateProbability();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates basic probability correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates conditional probability correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.09);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates binomial probability correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.45);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates expected value correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.55);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
describe("generateProbability - edge cases",()=>{
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
	it("should produce non-empty question HTML",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.11);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle coin flip probability",()=>{
		Math.random=vi.fn().mockReturnValue(0.51);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle dice probability",()=>{
		Math.random=vi.fn().mockReturnValue(0.61);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should handle card probability",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateProbability("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.31);
		generateProbability("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.61);
		generateProbability("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
