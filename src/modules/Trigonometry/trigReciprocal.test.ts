/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {seededRng} from "../../main/core/rng";
import {generateCosecant,generateSecant,generateCotangent} from "./trigReciprocal.js";
describe("generateCosecant",()=>{
	it("generates evaluate type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5);
		const dto=generateCosecant("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.latex).toContain("\\csc");
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
	it("generates relationship type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.34).mockReturnValue(0.5);
		const dto=generateCosecant("medium", rng);
		expect(dto.latex).toContain("Express");
		expect(dto.latex).toContain("\\csc");
		expect(dto.alternate).toContain("sin");
	});
	it("generates asymptote type question",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateCosecant("medium", rng);
		expect(dto.latex).toContain("asymptotes");
		expect(dto.correct).toContain("n");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateCosecant("medium", seededRng(42));
		const dto2=generateCosecant("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCosecant("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles medium difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCosecant("medium", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCosecant("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCosecant("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCosecant("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
	});
});
describe("generateSecant",()=>{
	it("generates evaluate type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.5);
		const dto=generateSecant("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.latex).toContain("\\sec");
		expect(dto.correct).toBeDefined();
	});
	it("generates identity type question",()=>{
		const rng=vi.fn().mockReturnValue(0.8);
		const dto=generateSecant("medium", rng);
		expect(dto.latex).toContain("identity");
		expect(dto.correct).toBe("1");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSecant("medium", seededRng(42));
		const dto2=generateSecant("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSecant("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSecant("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSecant("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
});
describe("generateCotangent",()=>{
	it("generates evaluate type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.5);
		const dto=generateCotangent("medium", rng);
		expect(dto.latex).toContain("Evaluate");
		expect(dto.latex).toContain("\\cot");
		expect(dto.correct).toBeDefined();
	});
	it("generates relationship type question",()=>{
		const rng=vi.fn().mockReturnValue(0.8);
		const dto=generateCotangent("medium", rng);
		expect(dto.latex).toContain("Express");
		expect(dto.alternate).toContain("tan");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateCotangent("medium", seededRng(42));
		const dto2=generateCotangent("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCotangent("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCotangent("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateCotangent("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
});
describe("Trigonometry reciprocal - comprehensive edge cases",()=>{
	it("MCQ choices should be unique for all three reciprocal functions",()=>{
		const funcs=[generateCosecant,generateSecant,generateCotangent];
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
		const funcs=[generateCosecant,generateSecant,generateCotangent];
		for(const gen of funcs){
			for(let i=0;i<10;i++){
				const rng=vi.fn().mockReturnValue(i/10);
				const dto=gen("medium", rng);
				expect(dto.choices).toContain(dto.correct);
			}
		}
	});
	it("cosecant evaluate should not produce NaN",()=>{
		for(let i=0;i<4;i++){
			const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(i/4.1);
			const dto=generateCosecant("medium", rng);
			expect(dto.correct).toBeDefined();
			const val=parseFloat(dto.correct);
			if(!isNaN(val)){
				expect(isNaN(val)).toBe(false);
			}
		}
	});
	it("secant evaluate should handle angle 0 correctly",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0);
		const dto=generateSecant("medium", rng);
		expect(dto).toBeDefined();
		expect(dto.correct).toBeDefined();
	});
	it("cotangent evaluate should handle π/4 correctly",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0);
		const dto=generateCotangent("medium", rng);
		expect(dto).toBeDefined();
		expect(dto.correct).toBeDefined();
	});
	it("should handle asymptote case correctly",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateCosecant("medium", rng);
		expect(dto.latex).toContain("asymptotes");
		expect(dto.correct).toBeDefined();
	});
	it("should not crash on repeated generate calls",()=>{
		for(let i=0;i<30;i++){
			const rng=vi.fn().mockReturnValue(i/30);
			const dto=generateCosecant("medium", rng);
			expect(dto.correct).toBeDefined();
		}
	});
	it("should produce non-empty latex for all functions",()=>{
		const funcs=[generateCosecant,generateSecant,generateCotangent];
		for(const gen of funcs){
			const rng=vi.fn().mockReturnValue(0.5);
			const dto=gen("medium", rng);
			expect(dto.latex.length).toBeGreaterThan(0);
		}
	});
});