/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateSequencesSeries} from "./calculusSequencesSeries";
import {questionArea} from "../../script.js";
vi.mock("../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
describe("generateSequencesSeries",()=>{
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
		generateSequencesSeries();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates ratioTest correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.23)// type->floor(18*0.23)=4 ratioTest
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateSequencesSeries();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"converges",
			alternate:"converges"
		});
	});
	it("generates geometricSeries correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.67)// type->floor(18*0.67)=12 geometricSeries
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateSequencesSeries();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"converges, sum=4.00",
			alternate:"converges, sum=4.00"
		});
	});
	it("generates taylorPoly correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.39)// type->floor(18*0.39)=7 taylorPoly
			.mockReturnValueOnce(0.3);// a->floor(5*0.3)+1=2
		generateSequencesSeries();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"1 + 2x + 2.00x^2 + 1.33x^3",
			alternate:"1 + 2x + 2.00x^2 + 1.33x^3"
		});
	});
	it("generates absCond correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.28);// type->floor(18*0.28)=5 absCond
		generateSequencesSeries();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"absolutely",
			alternate:"absolutely"
		});
	});
	it("generates pSeries correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.06)// type->floor(18*0.06)=1 pSeries
			.mockReturnValueOnce(0.5);// pVal->0.5*2=1.0, toFixed(1)="1.0"
		generateSequencesSeries();
		expect((window as any).correctAnswer).toMatchObject({
			correct:"diverges",
			alternate:"diverges"
		});
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.23)
			.mockReturnValueOnce(0.3);
		generateSequencesSeries();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.23)
			.mockReturnValueOnce(0.3);
		generateSequencesSeries();
		expect((window as any).expectedFormat).toBeDefined();
		expect(typeof (window as any).expectedFormat).toBe("string");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.23)
			.mockReturnValueOnce(0.3);
		generateSequencesSeries("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.23)
			.mockReturnValueOnce(0.3);
		generateSequencesSeries("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.23)
			.mockReturnValueOnce(0.3);
		generateSequencesSeries("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
	});
});
describe("generateSeries - edge cases",()=>{
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
        Math.random=vi.fn()
            .mockReturnValueOnce(0.23)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries();
        expect(mockDiv.innerHTML).not.toBe("");
    });
    it("should set correctAnswer with display property",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.23)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("display");
    });
    it("should handle arithmetic series",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.06)
            .mockReturnValueOnce(0.5);
        generateSequencesSeries();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle geometric series",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.67)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries();
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle easy difficulty",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.23)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries("easy");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle medium difficulty",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.23)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries("medium");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle hard difficulty",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.23)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries("hard");
        expect((window as any).correctAnswer).toBeDefined();
        expect((window as any).correctAnswer).toHaveProperty("correct");
    });
    it("should handle repeated calls",()=>{
        Math.random=vi.fn()
            .mockReturnValueOnce(0.23)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries();
        let first=(window as any).correctAnswer;
        Math.random=vi.fn()
            .mockReturnValueOnce(0.67)
            .mockReturnValueOnce(0.3);
        generateSequencesSeries();
        let second=(window as any).correctAnswer;
        expect(first).toBeDefined();
        expect(second).toBeDefined();
    });
});
