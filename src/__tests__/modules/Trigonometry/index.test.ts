/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import * as trig from "../../../modules/Trigonometry/index.js";
describe("Trigonometry index exports",()=>{
	it("exports generateSin",()=>{
		expect(typeof trig.generateSin).toBe("function");
	});
	it("exports generateCosine",()=>{
		expect(typeof trig.generateCosine).toBe("function");
	});
	it("exports generateTangent",()=>{
		expect(typeof trig.generateTangent).toBe("function");
	});
	it("exports generateCosecant",()=>{
		expect(typeof trig.generateCosecant).toBe("function");
	});
	it("exports formatPiFraction",()=>{
		expect(typeof trig.formatPiFraction).toBe("function");
	});
});
describe("Trigonometry index functions",()=>{
	it("should return a QuestionDto with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=trig.generateSin("medium", rng);
		expect(dto).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
	});
	it("should return a QuestionDto with expectedFormat",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=trig.generateSin("medium", rng);
		expect(dto.expectedFormat).toBeDefined();
	});
	it("should handle easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=trig.generateSin("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("should handle medium difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=trig.generateSin("medium", rng);
		expect(dto.correct).toBeDefined();
	});
	it("should handle hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=trig.generateSin("hard", rng);
		expect(dto.correct).toBeDefined();
	});
});