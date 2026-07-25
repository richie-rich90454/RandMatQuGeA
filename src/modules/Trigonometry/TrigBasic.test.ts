/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {seededRng} from "../../main/core/Rng";
import {generateSin,generateCosine,generateTangent} from "./TrigBasic.js";
describe("generateSin",()=>{
	it("generates evaluate type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5);
		const dto=generateSin("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.latex).toContain("\\sin");
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
	it("generates amplitude type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.3).mockReturnValue(0.5);
		const dto=generateSin("medium", rng);
		expect(dto.latex).toContain("amplitude");
		expect(dto.correct).toBeDefined();
	});
	it("generates period type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.45).mockReturnValue(0.5);
		const dto=generateSin("medium", rng);
		expect(dto.latex).toContain("period");
		expect(dto.correct).toContain("rad");
	});
	it("generates identity type question",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateSin("medium", rng);
		expect(dto.latex).toContain("identity");
		expect(dto.correct).toBe("1");
	});
	it("generates unit_circle type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.75).mockReturnValue(0.5);
		const dto=generateSin("medium", rng);
		expect(dto.latex).toContain("unit circle");
		expect(dto.correct).toContain("(");
	});
	it("generates law_sines type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.65).mockReturnValue(0.5);
		const dto=generateSin("medium", rng);
		expect(dto.latex).toContain("Law of Sines");
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSin("medium", seededRng(42));
		const dto2=generateSin("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.3).mockReturnValue(0.5);
		const dto=generateSin("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.3).mockReturnValue(0.5);
		const dto=generateSin("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateSin("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSin("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
	});
});
describe("generateCosine",()=>{
	it("generates evaluate type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5);
		const dto=generateCosine("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.latex).toContain("\\cos");
		expect(dto.correct).toBeDefined();
	});
	it("generates identity type question",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateCosine("medium", rng);
		expect(dto.latex).toContain("identity");
		expect(dto.correct).toBe("1");
	});
	it("generates law_cosines type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.75).mockReturnValue(0.5);
		const dto=generateCosine("medium", rng);
		expect(dto.latex).toContain("Law of Cosines");
		expect(dto.correct).toBeDefined();
	});
	it("generates period type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.45).mockReturnValue(0.5);
		const dto=generateCosine("medium", rng);
		expect(dto.latex).toContain("period");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateCosine("medium", seededRng(42));
		const dto2=generateCosine("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.3).mockReturnValue(0.5);
		const dto=generateCosine("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.3).mockReturnValue(0.5);
		const dto=generateCosine("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateCosine("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
});
describe("generateTangent",()=>{
	it("generates evaluate type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5);
		const dto=generateTangent("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.latex).toContain("\\tan");
		expect(dto.correct).toBeDefined();
	});
	it("generates identity type question",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateTangent("medium", rng);
		expect(dto.latex).toContain("identity");
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateTangent("medium", seededRng(42));
		const dto2=generateTangent("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTangent("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTangent("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateTangent("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
});
describe("Trigonometry basic - comprehensive edge cases",()=>{
	it("MCQ choices should be unique for all three basic functions",()=>{
		const funcs=[generateSin,generateCosine,generateTangent];
		for(const gen of funcs){
			for(let i=0;i<10;i++){
				const rng=vi.fn().mockReturnValue(i/10);
				const dto=gen("medium", rng);
				if(dto.choices){
					const uniqueChoices=new Set(dto.choices);
					expect(uniqueChoices.size).toBe(dto.choices.length);
				}
			}
		}
	});
	it("correct answer should always be present in choices",()=>{
		const funcs=[generateSin,generateCosine,generateTangent];
		for(const gen of funcs){
			for(let i=0;i<10;i++){
				const rng=vi.fn().mockReturnValue(i/10);
				const dto=gen("medium", rng);
				expect(dto.choices).toContain(dto.correct);
			}
		}
	});
	it("should not crash on repeated generate calls",()=>{
		for(let i=0;i<30;i++){
			const rng=vi.fn().mockReturnValue(i/30);
			const dto=generateSin("medium", rng);
			expect(dto.correct).toBeDefined();
		}
	});
	it("should produce non-empty latex for all functions",()=>{
		const funcs=[generateSin,generateCosine,generateTangent];
		for(const gen of funcs){
			const rng=vi.fn().mockReturnValue(0.5);
			const dto=gen("medium", rng);
			expect(dto.latex.length).toBeGreaterThan(0);
		}
	});
});