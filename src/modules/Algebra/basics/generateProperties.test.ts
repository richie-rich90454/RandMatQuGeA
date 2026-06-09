/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";
import {generateProperties} from "./generateProperties";
import {questionArea} from "../../../script.js";

vi.mock("../../../script.js",()=>({
	questionArea: null as HTMLElement|null
}));
vi.mock("../algebraUtils.js",()=>({
	getMaxForDifficulty: vi.fn(()=>5)
}));
describe("generateProperties",()=>{
	let originalMathRandom:()=>number;
	let mockDiv:HTMLDivElement;
	beforeEach(()=>{
		originalMathRandom=Math.random;
		mockDiv=document.createElement("div");
		(questionArea as any)=mockDiv;
		delete (window as any).correctAnswer;
		delete (window as any).expectedFormat;
		(window as any).MathJax={typesetPromise:vi.fn().mockResolvedValue(undefined)};
	});
	afterEach(()=>{
		Math.random=originalMathRandom;
		delete (window as any).MathJax;
	});
	it("returns early if questionArea is null",()=>{
		(questionArea as any)=null;
		generateProperties();
		expect(mockDiv.innerHTML).toBe("");
		expect((window as any).correctAnswer).toBeUndefined();
		expect((window as any).expectedFormat).toBeUndefined();
	});
	it("generates commutative type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect(mockDiv.innerHTML).toBe("<div>Which property is illustrated? \\( 3 + 2=2 + 3 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "commutative property of addition",
			alternate: "commutative",
			display: "commutative property of addition"
		});
		expect((window as any).expectedFormat).toBe("Enter the property name");
		expect((window as any).MathJax.typesetPromise).toHaveBeenCalled();
	});
	it("generates associative type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect(mockDiv.innerHTML).toBe("<div>Which property is illustrated? \\( (3 + 2) + 4=3 + (2 + 4) \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "associative property of addition",
			alternate: "associative",
			display: "associative property of addition"
		});
	});
	it("generates distributive type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect(mockDiv.innerHTML).toBe("<div>Which property is illustrated? \\( 3(2 + 4)=32 + 34 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "distributive property",
			alternate: "distributive",
			display: "distributive property"
		});
	});
	it("generates identity type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect(mockDiv.innerHTML).toBe("<div>Which property is illustrated? \\( 3 + 0=3 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "identity property of addition",
			alternate: "identity",
			display: "identity property of addition"
		});
	});
	it("generates inverse type correctly",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect(mockDiv.innerHTML).toBe("<div>Which property is illustrated? \\( 3 + (-3)=0 \\)</div>");
		expect((window as any).correctAnswer).toMatchObject({
			correct: "inverse property of addition",
			alternate: "inverse",
			display: "inverse property of addition"
		});
	});
	it("does not call MathJax if missing",()=>{
		delete (window as any).MathJax;
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect((window as any).MathJax).toBeUndefined();
	});
	it("should set window.correctAnswer",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).correctAnswer).toHaveProperty("correct");
		expect((window as any).correctAnswer).toHaveProperty("alternate");
		expect((window as any).correctAnswer).toHaveProperty("display");
		expect((window as any).correctAnswer).toHaveProperty("choices");
	});
	it("should set window.expectedFormat",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties();
		expect((window as any).expectedFormat).toBe("Enter the property name");
	});
	it("should handle easy difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties("easy");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBe("Enter the property name");
	});
	it("should handle medium difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties("medium");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBe("Enter the property name");
	});
	it("should handle hard difficulty",()=>{
		Math.random=vi.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.5)
			.mockReturnValueOnce(0.3)
			.mockReturnValueOnce(0.7);
		generateProperties("hard");
		expect((window as any).correctAnswer).toBeDefined();
		expect((window as any).expectedFormat).toBe("Enter the property name");
	});
});
