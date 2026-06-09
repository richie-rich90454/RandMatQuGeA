/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateLimit,generateRelatedRates} from "./calculusLimitsRelated";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateLimit",()=>{
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
		generateLimit();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates polynomial limit correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)// type->floor(5*0.1)=0 polynomial
			.mockReturnValueOnce(0.3)// a->floor(5*0.3)+1=1+1=2
			.mockReturnValueOnce(0.6)// c->floor(10*0.6)-5=6-5=1
			.mockReturnValueOnce(0.5);// x0->floor(5*0.5)=2
		generateLimit();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"9",
			alternate:"9"
		});
	});
	it("generates trig limit correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.6);// type->floor(5*0.6)=3 trig
		generateLimit();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"1",
			alternate:"1"
		});
		expect((window as any).expectedFormat).toBe("Enter a number or 'avg=... inst=...'");
	});
	it("generates infinity limit correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.4)// type->floor(5*0.4)=2 infinity
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=1+1=2
		generateLimit();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"2",
			alternate:"2"
		});
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateLimit();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateLimit();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateLimit("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateLimit("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.5);
		generateLimit("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
describe("generateRelatedRates",()=>{
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
		generateRelatedRates();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates sphere related rates correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.05);// type->floor(8*0.05)=0 sphere
		generateRelatedRates();
		expect((window as any).correctAnswer).toMatchObject({
			correct:(10/(4*Math.PI*25*25)).toFixed(4),
			alternate:(10/(4*Math.PI*25*25)).toFixed(4)
		});
	});
	it("generates circleArea related rates correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.15);// type->floor(8*0.15)=1 circleArea
		generateRelatedRates();
		let dr_dt=0.5;
		let r=3;
		let dA_dt=2*Math.PI*r*dr_dt;
		expect((window as any).correctAnswer).toMatchObject({
			correct:dA_dt.toFixed(4),
			alternate:dA_dt.toFixed(4)
		});
	});
});
describe("generateRelatedRates - edge cases",()=>{
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
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates();
        expect(mockDiv.innerHTML).not.toBe("");
    });
    it("should set correctAnswer with display property",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("display");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates("easy");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates("medium");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates("hard");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should set expectedFormat",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates();
        expect((window as any).expectedFormat).toBeDefined();
        expect(typeof (window as any).expectedFormat).toBe("string");
    });
    it("should set hasQuestion to true",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates();
        expect((window as any).hasQuestion).toBe(true);
    });
    it("should handle repeated calls",()=>{
        Math.random=vi.fn().mockReturnValueOnce(0.05);
        generateRelatedRates();
        let first=(window as any).correctAnswer;
        Math.random=vi.fn().mockReturnValueOnce(0.15);
        generateRelatedRates();
        let second=(window as any).correctAnswer;
        expect(first).toBeDefined();
        expect(second).toBeDefined();
    });
});
