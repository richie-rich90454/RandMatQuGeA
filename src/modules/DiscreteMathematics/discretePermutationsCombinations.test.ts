/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generatePermutation,generateCombination} from "./discretePermutationsCombinations.js";
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
	stdDev:vi.fn((arr:number[])=>{let m=arr.reduce((a:number,b:number)=>a+b,0)/arr.length;return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length);}),
	getOrdinal:vi.fn((n)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];}),
}));
describe("generatePermutation",()=>{
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
		generatePermutation();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates basic permutation correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates word permutation correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.25);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates basic combination correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generateCombination();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates combination word correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.35);
		generateCombination();
		expect((window as any).correctAnswer).toBeDefined();
		expect(mockDiv.innerHTML).toContain("choose");
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
});
describe("generatePermutation - edge cases",()=>{
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
		generatePermutation();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.18);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle small values (n=2, r=1)",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("should handle n=r permutation",()=>{
		Math.random=vi.fn().mockReturnValue(0.52);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect(typeof (window as any).correctAnswer.correct).toBe("string");
	});
	it("should handle large n values",()=>{
		Math.random=vi.fn().mockReturnValue(0.85);
		generatePermutation();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.35);
		generatePermutation("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.68);
		generatePermutation("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should call typesetPromise instead of typeset",()=>{
		const typesetSpy=vi.fn().mockResolvedValue(undefined);
		(window as any).MathJax={typesetPromise:typesetSpy};
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		expect(typesetSpy).toHaveBeenCalled();
	});
	it("should not crash when MathJax is undefined",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn().mockReturnValue(0.01);
		expect(()=>generatePermutation()).not.toThrow();
	});
	it("MCQ choices should not contain duplicates",()=>{
		// Test all permutation types to ensure unique choices
		for(let i=0;i<12;i++){
			Math.random=vi.fn().mockReturnValue(i/12);
			generatePermutation();
			const ca=(window as any).correctAnswer;
			if(ca&&ca.choices){
				const uniqueChoices=new Set(ca.choices);
				expect(uniqueChoices.size).toBe(ca.choices.length);
			}
		}
	});
	it("correct answer should be present in choices",()=>{
		Math.random=vi.fn().mockReturnValue(0.01);
		generatePermutation();
		const ca=(window as any).correctAnswer;
		expect(ca.choices).toContain(ca.correct);
	});
});
describe("generateCombination - comprehensive",()=>{
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
	it("should not contain NaN or Infinity in answers",()=>{
		for(let i=0;i<20;i++){
			Math.random=vi.fn().mockReturnValue(i/20);
			generateCombination();
			const ca=(window as any).correctAnswer;
			expect(ca.correct).not.toBe("NaN");
			expect(ca.correct).not.toBe("Infinity");
			expect(ca.correct).not.toBe("-Infinity");
		}
	});
	it("MCQ choices should be unique across all combination types",()=>{
		for(let i=0;i<12;i++){
			Math.random=vi.fn().mockReturnValue(i/12);
			generateCombination();
			const ca=(window as any).correctAnswer;
			if(ca&&ca.choices){
				const uniqueChoices=new Set(ca.choices);
				expect(uniqueChoices.size).toBe(ca.choices.length);
			}
		}
	});
	it("should handle all combination types",()=>{
		const types=["basic","equation","word","complement","paths","multiset"];
		for(let i=0;i<types.length;i++){
			Math.random=vi.fn().mockReturnValue((i+0.5)/12);
			generateCombination();
			expect((window as any).correctAnswer).toBeDefined();
			expect((window as any).correctAnswer.correct).toBeDefined();
			expect((window as any).expectedFormat).toBe("Enter a number");
		}
	});
	it("correct answer should be in choices for all types",()=>{
		for(let i=0;i<12;i++){
			Math.random=vi.fn().mockReturnValue(i/12);
			generateCombination();
			const ca=(window as any).correctAnswer;
			expect(ca.choices).toContain(ca.correct);
		}
	});
});
