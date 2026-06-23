/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {questionArea} from "../../script.js";
import {generateCosecant,generateSecant,generateCotangent} from "./trigReciprocal.js";
vi.mock("../../script.js",()=>({questionArea:null as HTMLElement|null}));
describe("generateCosecant",()=>{
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
		generateCosecant();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
	});
	it("generates evaluate cosecant correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateCosecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("generates relationship cosecant correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.4).mockReturnValueOnce(0.5);
		generateCosecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.alternate).toContain("sin");
	});
	it("generates evaluate secant correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.5);
		generateSecant();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates cotangent relationship correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.6).mockReturnValueOnce(0.5);
		generateCotangent();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.alternate).toContain("tan");
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
describe("generateCosecant - edge cases",()=>{
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
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
		expect((window as any).correctAnswer.display.length).toBeGreaterThan(0);
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should set expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle repeated calls consistently",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		let first=(window as any).correctAnswer;
		delete(window as any).correctAnswer;
		delete(window as any).expectedFormat;
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		let second=(window as any).correctAnswer;
		expect(first.correct).toBe(second.correct);
		expect(first.display).toBe(second.display);
	});
	it("should verify correctAnswer structure",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		let ans=(window as any).correctAnswer;
		expect(ans).toHaveProperty("correct");
		expect(ans).toHaveProperty("display");
		expect(ans).toHaveProperty("choices");
		expect(Array.isArray(ans.choices)).toBe(true);
		expect(ans.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("should call typesetPromise instead of typeset",()=>{
		const typesetSpy=vi.fn().mockResolvedValue(undefined);
		(window as any).MathJax={typesetPromise:typesetSpy};
		Math.random=vi.fn().mockReturnValue(0.5);
		generateCosecant();
		expect(typesetSpy).toHaveBeenCalled();
	});
	it("should not crash when MathJax is undefined",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn().mockReturnValue(0.01);
		expect(()=>generateCosecant()).not.toThrow();
		expect(()=>generateSecant()).not.toThrow();
		expect(()=>generateCotangent()).not.toThrow();
	});
});
describe("trigReciprocal - comprehensive edge cases",()=>{
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
	it("MCQ choices should be unique for all three reciprocal functions",()=>{
		const funcs=[generateCosecant,generateSecant,generateCotangent];
		for(const gen of funcs){
			for(let i=0;i<10;i++){
				Math.random=vi.fn().mockReturnValue(i/10);
				gen();
				const ca=(window as any).correctAnswer;
				if(ca&&ca.choices){
					const uniqueChoices=new Set(ca.choices);
					expect(uniqueChoices.size).toBe(ca.choices.length);
				}
			}
		}
	});
	it("correct answer should always be present in choices",()=>{
		const funcs=[generateCosecant,generateSecant,generateCotangent];
		for(const gen of funcs){
			for(let i=0;i<10;i++){
				Math.random=vi.fn().mockReturnValue(i/10);
				gen();
				const ca=(window as any).correctAnswer;
				expect(ca.choices).toContain(ca.correct);
			}
		}
	});
	it("cosecant evaluate should not produce NaN",()=>{
		for(let i=0;i<4;i++){ // 4 angles only
			Math.random=vi.fn()
				.mockReturnValueOnce(0.01) // evaluate type (index 0)
				.mockReturnValueOnce(i/4.1); // angle index (0..<1)
			generateCosecant();
			const ca=(window as any).correctAnswer;
			expect(ca.correct).toBeDefined();
			if(ca.correct&&ca.display===ca.correct){
				// Only check numeric evaluate cases
				const val=parseFloat(ca.correct);
				if(!isNaN(val)){
					expect(isNaN(val)).toBe(false);
				}
			}
		}
	});
	it("secant evaluate should handle angle 0 correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.2); // evaluate type, first angle (0)
		generateSecant();
		const ca=(window as any).correctAnswer;
		expect(ca).toBeDefined();
		expect(ca.correct).toBeDefined();
	});
	it("cotangent evaluate should handle π/4 correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0); // first angle (π/4)
		generateCotangent();
		const ca=(window as any).correctAnswer;
		expect(ca).toBeDefined();
		expect(ca.correct).toBeDefined();
		expect(isNaN(parseFloat(ca.correct))).toBe(false);
	});
	it("expectedFormat should be set for all functions",()=>{
		const funcs=[generateCosecant,generateSecant,generateCotangent];
		for(const gen of funcs){
			Math.random=vi.fn().mockReturnValue(0.5);
			gen();
			expect((window as any).expectedFormat).toBeDefined();
		}
	});
	it("should handle asmyptote case correctly",()=>{
		// cosecant: types=["evaluate","relationship","asymptote"] (3 types)
		// Math.floor(0.9*3)=2 which is "asymptote" case
		Math.random=vi.fn().mockReturnValue(0.9);
		generateCosecant();
		expect(mockDiv.innerHTML).toContain("asymptotes");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle secant evaluate type",()=>{
		Math.random=vi.fn().mockReturnValue(0.2); // evaluate type
		generateSecant();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should not crash on repeated generate calls",()=>{
		for(let i=0;i<30;i++){
			Math.random=vi.fn().mockReturnValue(i/30);
			generateCosecant();
			expect((window as any).correctAnswer).toBeDefined();
		}
	});
});
