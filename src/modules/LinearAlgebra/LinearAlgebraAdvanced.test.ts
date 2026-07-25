/**
 * @vitest-environment jsdom
 */
import {describe,it,expect} from "vitest";
import {generateSystem3x3,generateRowEchelon3x3,generatePartialFractions,generateLinearProgramming,generateVector3D,generateLine3D,generatePlane3D} from "./LinearAlgebraAdvanced.js";
import {seededRng} from "../../main/core/Rng";
describe("generateSystem3x3",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateSystem3x3("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateSystem3x3("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateSystem3x3("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generateSystem3x3("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateSystem3x3("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const dto=generateSystem3x3("medium", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateSystem3x3("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSystem3x3("medium", seededRng(42));
		const dto2=generateSystem3x3("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generateSystem3x3("medium", seededRng(42));
		const dto2=generateSystem3x3("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
describe("generateRowEchelon3x3",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateRowEchelon3x3("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateRowEchelon3x3("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateRowEchelon3x3("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generateRowEchelon3x3("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateRowEchelon3x3("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateRowEchelon3x3("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateRowEchelon3x3("medium", seededRng(42));
		const dto2=generateRowEchelon3x3("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generatePartialFractions",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generatePartialFractions("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generatePartialFractions("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generatePartialFractions("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generatePartialFractions("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generatePartialFractions("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generatePartialFractions("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePartialFractions("medium", seededRng(42));
		const dto2=generatePartialFractions("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateLinearProgramming",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateLinearProgramming("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateLinearProgramming("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateLinearProgramming("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generateLinearProgramming("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateLinearProgramming("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateLinearProgramming("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateLinearProgramming("medium", seededRng(42));
		const dto2=generateLinearProgramming("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateVector3D",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateVector3D("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateVector3D("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateVector3D("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generateVector3D("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateVector3D("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateVector3D("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateVector3D("medium", seededRng(42));
		const dto2=generateVector3D("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateLine3D",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generateLine3D("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generateLine3D("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generateLine3D("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generateLine3D("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generateLine3D("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generateLine3D("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateLine3D("medium", seededRng(42));
		const dto2=generateLine3D("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generatePlane3D",()=>{
	it("returns a QuestionDto with required fields",()=>{
		const dto=generatePlane3D("medium", seededRng(42));
		expect(dto).toHaveProperty("latex");
		expect(dto).toHaveProperty("correct");
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
	});
	it("returns expectedFormat string",()=>{
		const dto=generatePlane3D("medium", seededRng(42));
		expect(dto.expectedFormat).toBeDefined();
		expect(typeof dto.expectedFormat).toBe("string");
	});
	it("returns choices array",()=>{
		const dto=generatePlane3D("medium", seededRng(42));
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThanOrEqual(1);
	});
	it("includes correct answer in choices",()=>{
		const dto=generatePlane3D("medium", seededRng(42));
		expect(dto.choices).toContain(dto.correct);
	});
	it("should handle easy difficulty",()=>{
		const dto=generatePlane3D("easy", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const dto=generatePlane3D("hard", seededRng(42));
		expect(dto.correct).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePlane3D("medium", seededRng(42));
		const dto2=generatePlane3D("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("produces different output for different seeds",()=>{
		const dto1=generatePlane3D("medium", seededRng(42));
		const dto2=generatePlane3D("medium", seededRng(99));
		expect(dto1).not.toEqual(dto2);
	});
});
