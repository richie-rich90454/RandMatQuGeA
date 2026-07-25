/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,vi} from "vitest";
import {seededRng} from "../../main/core/Rng";
import {getRangeForDifficulty} from "./ArithmeticUtils.js";
import {generateAddition,generateSubtraction,generateMultiplication,generateDivision} from "./ArithmeticBasic.js";
vi.mock("./ArithmeticUtils.js",()=>({
	getRangeForDifficulty: vi.fn(()=>({min:1,max:10}))
}));
describe("generateAddition",()=>{
	beforeEach(()=>{
		vi.mocked(getRangeForDifficulty).mockClear();
	});
	it("generates correct addition question and answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateAddition("medium", rng);
		expect(dto.latex).toBe("$5.5+5=$");
		expect(dto.correct).toBe("10.500");
		expect(dto.alternate).toBe("10.500");
		expect(dto.display).toBe("10.500");
		expect(dto.expectedFormat).toBe("Enter a number (up to 3 decimals)");
		expect(dto.choices).toContain("10.500");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateAddition("medium", seededRng(42));
		const dto2=generateAddition("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes easy difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		generateAddition("easy", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("easy");
	});
	it("passes medium difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateAddition("medium", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("medium");
		expect(dto.correct).toBeDefined();
	});
	it("passes hard difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateAddition("hard", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("hard");
		expect(dto.correct).toBeDefined();
	});
	it("handles adding zero",()=>{
		const rng=vi.fn().mockReturnValue(0);
		const dto=generateAddition("medium", rng);
		expect(dto.correct).toBeDefined();
		expect(parseFloat(dto.correct)).not.toBeNaN();
	});
	it("handles negative addition result",()=>{
		const rng=vi.fn().mockReturnValue(0.01);
		const dto=generateAddition("medium", rng);
		expect(parseFloat(dto.correct)).not.toBeNaN();
	});
	it("handles large numbers",()=>{
		const rng=vi.fn().mockReturnValue(0.99);
		const dto=generateAddition("medium", rng);
		expect(parseFloat(dto.correct)).not.toBeNaN();
	});
	it("handles carry operations",()=>{
		const rng=vi.fn().mockReturnValue(0.95);
		const dto=generateAddition("medium", rng);
		expect(parseFloat(dto.correct)).not.toBeNaN();
	});
	it("produces non-empty latex",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateAddition("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
	});
	it("includes choices array with display property",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateAddition("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThan(0);
		expect(typeof dto.display).toBe("string");
	});
});
describe("generateSubtraction",()=>{
	beforeEach(()=>{
		vi.mocked(getRangeForDifficulty).mockClear();
	});
	it("generates correct subtraction question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSubtraction("medium", rng);
		expect(dto.latex).toBe("$5.5-5=$");
		expect(dto.correct).toBe("0.500");
		expect(dto.alternate).toBe("0.500");
		expect(dto.display).toBe("0.500");
		expect(dto.expectedFormat).toBe("Enter a number (up to 3 decimals)");
	});
	it("handles negative subtraction result",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
		const dto=generateSubtraction("medium", rng);
		expect(dto.correct).toBe("-7.100");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSubtraction("medium", seededRng(42));
		const dto2=generateSubtraction("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes hard difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		generateSubtraction("hard", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("hard");
	});
	it("passes easy difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSubtraction("easy", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("easy");
		expect(dto.correct).toBeDefined();
	});
	it("passes medium difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSubtraction("medium", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("medium");
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSubtraction("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
});
describe("generateMultiplication",()=>{
	beforeEach(()=>{
		vi.mocked(getRangeForDifficulty).mockClear();
	});
	it("generates correct multiplication question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateMultiplication("medium", rng);
		expect(dto.latex).toBe("$5.5 \\times 5=$<br>Round your answer to two decimal places");
		expect(dto.correct).toBe("27.50");
		expect(dto.alternate).toBe("27.50000");
		expect(dto.display).toBe("27.50");
		expect(dto.expectedFormat).toBe("Enter a number rounded to 2 decimal places");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateMultiplication("medium", seededRng(42));
		const dto2=generateMultiplication("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("includes choices containing the correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateMultiplication("medium", rng);
		expect(dto.choices).toBeDefined();
		expect(dto.choices!.length).toBeGreaterThan(0);
		expect(dto.choices).toContain("27.50");
	});
	it("passes easy difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateMultiplication("easy", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("easy");
		expect(dto.correct).toBeDefined();
	});
	it("passes medium difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateMultiplication("medium", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("medium");
		expect(dto.correct).toBeDefined();
	});
	it("passes hard difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateMultiplication("hard", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("hard");
		expect(dto.correct).toBeDefined();
	});
});
describe("generateDivision",()=>{
	beforeEach(()=>{
		vi.mocked(getRangeForDifficulty).mockClear();
	});
	it("generates correct division question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivision("medium", rng);
		expect(dto.latex).toBe("$5.5 \\div 5=$<br>Round your answer to two decimal places");
		expect(dto.correct).toBe("1.10");
		expect(dto.expectedFormat).toBe("Enter a number rounded to 2 decimal places");
	});
	it("guards against division by zero",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0);
		const dto=generateDivision("medium", rng);
		expect(dto.correct).toBe("5.50");
		expect(dto.alternate).toBe("5.50000");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateDivision("medium", seededRng(42));
		const dto2=generateDivision("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes hard difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		generateDivision("hard", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("hard");
	});
	it("passes easy difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivision("easy", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("easy");
		expect(dto.correct).toBeDefined();
	});
	it("passes medium difficulty to getRangeForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivision("medium", rng);
		expect(vi.mocked(getRangeForDifficulty)).toHaveBeenCalledWith("medium");
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivision("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
});
