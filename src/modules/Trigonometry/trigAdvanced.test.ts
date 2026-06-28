/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {seededRng} from "../../main/core/rng";
import {generateInverseTrig,generateTrigEquations,generateTrigGraphs} from "./trigAdvanced.js";
describe("generateInverseTrig",()=>{
	it("generates arcsin type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateInverseTrig("medium", rng);
		expect(dto.latex).toContain("arcsin");
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
	it("generates arccos type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.5).mockReturnValue(0.5);
		const dto=generateInverseTrig("medium", rng);
		expect(dto.latex).toContain("arccos");
		expect(dto.correct).toBeDefined();
	});
	it("generates arctan type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.99).mockReturnValue(0.5);
		const dto=generateInverseTrig("medium", rng);
		expect(dto.latex).toContain("arctan");
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateInverseTrig("medium", seededRng(42));
		const dto2=generateInverseTrig("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateInverseTrig("easy", rng);
		expect(dto.correct).toBeDefined();
		expect(dto.display).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateInverseTrig("hard", rng);
		expect(dto.correct).toBeDefined();
		expect(dto.display).toBeDefined();
	});
	it("handles arcsin(0)",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0).mockReturnValue(0.5);
		const dto=generateInverseTrig("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles arcsin(1)",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValueOnce(0.75).mockReturnValue(0.5);
		const dto=generateInverseTrig("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles arccos(0)",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0.5).mockReturnValue(0.5);
		const dto=generateInverseTrig("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles arctan(1)",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.99).mockReturnValueOnce(0.5).mockReturnValue(0.5);
		const dto=generateInverseTrig("medium", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateInverseTrig("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateInverseTrig("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
	});
});
describe("generateTrigEquations",()=>{
	it("generates basic type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateTrigEquations("medium", rng);
		expect(dto.latex).toContain("Solve");
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
	});
	it("generates multiple_angle type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.4).mockReturnValue(0.5);
		const dto=generateTrigEquations("medium", rng);
		expect(dto.latex).toContain("Solve");
		expect(dto.correct).toBeDefined();
	});
	it("generates using_identity type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.8).mockReturnValue(0.5);
		const dto=generateTrigEquations("medium", rng);
		expect(dto.latex).toContain("sin^2");
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateTrigEquations("medium", seededRng(42));
		const dto2=generateTrigEquations("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateTrigEquations("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateTrigEquations("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTrigEquations("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
	it("sets expectedFormat",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTrigEquations("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
	});
});
describe("generateTrigGraphs",()=>{
	it("generates sine type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.01).mockReturnValue(0.5);
		const dto=generateTrigGraphs("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
	});
	it("generates cosine type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.4).mockReturnValue(0.5);
		const dto=generateTrigGraphs("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
	});
	it("generates tangent type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.8).mockReturnValue(0.5);
		const dto=generateTrigGraphs("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateTrigGraphs("medium", seededRng(42));
		const dto2=generateTrigGraphs("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTrigGraphs("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTrigGraphs("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateTrigGraphs("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices).toContain(dto.correct);
	});
});
describe("Trigonometry advanced - comprehensive edge cases",()=>{
	it("all generators should produce non-empty latex",()=>{
		const gens=[generateInverseTrig,generateTrigEquations,generateTrigGraphs];
		for(const gen of gens){
			const rng=vi.fn().mockReturnValue(0.5);
			const dto=gen("medium", rng);
			expect(dto.latex.length).toBeGreaterThan(0);
		}
	});
	it("all generators should include correct answer in choices",()=>{
		const gens=[generateInverseTrig,generateTrigEquations,generateTrigGraphs];
		for(const gen of gens){
			const rng=vi.fn().mockReturnValue(0.5);
			const dto=gen("medium", rng);
			expect(dto.choices).toContain(dto.correct);
		}
	});
	it("should not crash on repeated generate calls",()=>{
		for(let i=0;i<30;i++){
			const rng=vi.fn().mockReturnValue(i/30);
			const dto=generateInverseTrig("medium", rng);
			expect(dto.correct).toBeDefined();
		}
	});
});