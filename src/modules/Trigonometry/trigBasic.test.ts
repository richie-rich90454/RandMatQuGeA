/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateSin,generateCosine,generateTangent} from "./trigBasic.js";
let sink=vi.hoisted(()=>({ div: null as HTMLDivElement|null }));
vi.mock("../../main/core/questionRenderer",()=>({
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
describe("generateSin",()=>{
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
		generateSin();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates evaluate sin correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.choices.length).toBeGreaterThanOrEqual(1);
	});
	it("generates identity sin correctly",()=>{
		Math.random=vi.fn().mockReturnValue(0.9);
		generateSin();
		expect((window as any).correctAnswer.correct).toBe("1");
	});
	it("generates evaluate cosine correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateCosine();
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("generates tangent identity correctly",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.85);
		generateTangent();
		expect((window as any).correctAnswer.correct).toBe("\\sec^2\\theta");
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
		expect((window as any).correctAnswer.choices).toBeDefined();
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateSin();
		expect((window as any).expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateSin("easy");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateSin("medium");
		expect((window as any).correctAnswer).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValue(0.5);
		generateSin("hard");
		expect((window as any).correctAnswer).toBeDefined();
	});
});
describe("generateSin - edge cases",()=>{
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
	it("should produce non-empty question HTML",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateSin();
		expect(mockDiv.innerHTML.length).toBeGreaterThan(0);
	});
	it("should set correctAnswer with display property",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateSin();
		expect((window as any).correctAnswer.display).toBeDefined();
		expect(typeof (window as any).correctAnswer.display).toBe("string");
	});
	it("should handle 30 degree angle",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(1/16);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle 45 degree angle",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(2/16);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle 60 degree angle",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(3/16);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle 90 degree angle",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(4/16);
		generateSin();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.correct).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateSin("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);
		generateSin("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer.display).toBeDefined();
	});
});
describe("generateSin - solve edge cases (k negative fix)",()=>{
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
	it("sine solve with k=0 should have 2 solutions (0, π)",()=>{
		// force "solve" type (index 1): random between 0.125 and 0.25
		Math.random=vi.fn()
			.mockReturnValueOnce(0.13) // selects "solve" type (index 1)
			.mockReturnValueOnce(0.5);  // k = 2*0.5-1 = 0
		generateSin();
		const correct=(window as any).correctAnswer.correct;
		// sin(θ)=0 has solutions θ=0 and θ=π in [0,2π)
		expect(correct).toContain("0.00");
		expect(correct).toContain("3.14");
	});
	it("sine solve with k=-0.5 should have 2 solutions (7π/6 and 11π/6)",()=>{
		// force "solve" type (index 1)
		Math.random=vi.fn()
			.mockReturnValueOnce(0.13) // "solve" type
			.mockReturnValueOnce(0.25); // k = 2*0.25-1 = -0.5
		generateSin();
		const correct=(window as any).correctAnswer.correct;
		// sin(θ)=-0.5 has solutions 7π/6≈3.67 and 11π/6≈5.76 in [0,2π)
		expect(correct).toContain("3.67");
		expect(correct).toContain("5.76");
	});
	it("sine solve with k=-1 should have 1 solution (3π/2)",()=>{
		// force "solve" type (index 1)
		Math.random=vi.fn()
			.mockReturnValueOnce(0.13) // "solve" type
			.mockReturnValueOnce(0);    // k = 2*0-1 = -1
		generateSin();
		const correct=(window as any).correctAnswer.correct;
		// sin(θ)=-1 has only θ=3π/2≈4.71 in [0,2π)
		expect(correct).toContain("4.71");
		// should NOT have negative solutions
		expect(correct).not.toContain("-");
	});
	it("sine solve with k=0.5 should have 2 solutions (π/6 and 5π/6)",()=>{
		// force "solve" type (index 1)
		Math.random=vi.fn()
			.mockReturnValueOnce(0.13) // "solve" type
			.mockReturnValueOnce(0.75); // k = 2*0.75-1 = 0.5
		generateSin();
		const correct=(window as any).correctAnswer.correct;
		// sin(θ)=0.5 has solutions π/6≈0.52 and 5π/6≈2.62 in [0,2π)
		expect(correct).toContain("0.52");
		expect(correct).toContain("2.62");
	});
	it("sine solve with k=1 should have 1 unique solution (π/2)",()=>{
		// force "solve" type (index 1)
		Math.random=vi.fn()
			.mockReturnValueOnce(0.13) // "solve" type
			.mockReturnValueOnce(1);    // k = 2*1-1 = 1
		generateSin();
		const correct=(window as any).correctAnswer.correct;
		// sin(θ)=1 has only θ=π/2≈1.57 in [0,2π)
		// Note: due to floating point, k=1 may produce sol1=sol2=π/2
		expect(correct).toContain("1.57");
		// Should not have negative solutions
		expect(correct).not.toContain("-");
	});
	it("sine evaluate does not crash for boundary angles",()=>{
		// force "evaluate" type via first random near 0
		for(let i=0;i<20;i++){
			Math.random=vi.fn()
				.mockReturnValueOnce(0.001) // "evaluate" type
				.mockReturnValueOnce(i/20);  // cycle through angles
			generateSin();
			expect((window as any).correctAnswer).toBeDefined();
			expect((window as any).correctAnswer.correct).not.toBe("NaN");
			expect((window as any).correctAnswer.correct).not.toBe("Infinity");
		}
	});
});
