/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,beforeEach,vi} from "vitest";
import {seededRng} from "../../main/core/Rng";
import {getMaxForDifficulty} from "./ArithmeticUtils.js";
import {generateWholeNumberPlaceValue,generateNumberLineOrdering,generateDivisibility,generateGCFLCM} from "./ArithmeticAdvanced.js";
vi.mock("./ArithmeticUtils.js",()=>({
	getMaxForDifficulty: vi.fn(()=>100),
	isPrime: vi.fn((n:number)=>{
		if (n<2) return false;
		if (n===2) return true;
		if (n%2===0) return false;
		for (let i=3;i*i<=n;i+=2){if (n%i===0) return false;}
		return true;
	}),
	gcd: vi.fn(function g(a:number,b:number):number{
		return b===0?Math.abs(a):g(b,a%b);
	})
}));
describe("generateWholeNumberPlaceValue",()=>{
	beforeEach(()=>{
		vi.mocked(getMaxForDifficulty).mockClear();
	});
	it("generates place_value type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0);
		const dto=generateWholeNumberPlaceValue("medium", rng);
		expect(dto.latex).toContain("What is the place value of the digit");
		expect(dto.latex).toContain("150");
		expect(dto.correct).toBe("100");
		expect(dto.alternate).toBe("hundreds");
		expect(dto.display).toBe("100");
		expect(dto.expectedFormat).toBe("Enter a number (e.g., 500)");
	});
	it("generates expanded_form type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.34).mockReturnValueOnce(0.5);
		const dto=generateWholeNumberPlaceValue("medium", rng);
		expect(dto.latex).toBe("Write 150 in expanded form.");
		expect(dto.correct).toBe("100 + 50");
		expect(dto.expectedFormat).toBe("Enter as 200 + 30 + 4");
	});
	it("generates rounding type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.67).mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
		const dto=generateWholeNumberPlaceValue("medium", rng);
		expect(dto.latex).toBe("Round 150 to the nearest hundred.");
		expect(dto.correct).toBe("200");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateWholeNumberPlaceValue("medium", seededRng(42));
		const dto2=generateWholeNumberPlaceValue("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes hard difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		generateWholeNumberPlaceValue("hard", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",9999);
	});
	it("passes easy difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateWholeNumberPlaceValue("easy", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",9999);
		expect(dto.correct).toBeDefined();
	});
	it("passes medium difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateWholeNumberPlaceValue("medium", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",9999);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array",()=>{
		const rng=vi.fn().mockReturnValue(0);
		const dto=generateWholeNumberPlaceValue("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThan(0);
		expect(typeof dto.display).toBe("string");
	});
});
describe("generateNumberLineOrdering",()=>{
	beforeEach(()=>{
		vi.mocked(getMaxForDifficulty).mockClear();
	});
	it("generates question with mixed negative and positive numbers",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.3).mockReturnValueOnce(0.6).mockReturnValueOnce(0.9).mockReturnValue(0.5);
		const dto=generateNumberLineOrdering("medium", rng);
		expect(dto.latex).toContain("Order the numbers from least to greatest");
		expect(dto.latex).toContain("-80");
		expect(dto.latex).toContain("80");
		expect(dto.correct).toBe("-80, -40, 20, 80");
		expect(dto.expectedFormat).toBe("Enter numbers separated by commas, e.g., -3, 0, 5, 7");
	});
	it("ensures at least one negative in output",()=>{
		const rng=vi.fn().mockReturnValue(0.9);
		const dto=generateNumberLineOrdering("medium", rng);
		expect(dto.latex).toContain("-");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateNumberLineOrdering("medium", seededRng(42));
		const dto2=generateNumberLineOrdering("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes easy difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateNumberLineOrdering("easy", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",20);
		expect(dto.correct).toBeDefined();
	});
	it("passes medium difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateNumberLineOrdering("medium", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",20);
		expect(dto.correct).toBeDefined();
	});
	it("passes hard difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateNumberLineOrdering("hard", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",20);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateNumberLineOrdering("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
});
describe("generateDivisibility",()=>{
	beforeEach(()=>{
		vi.mocked(getMaxForDifficulty).mockClear();
	});
	it("generates rule type question for divisor 2",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.1).mockReturnValueOnce(0.1);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toBe("State the divisibility rule for 2.");
		expect(dto.correct).toBe("A number is divisible by 2 if its last digit is even.");
		expect(dto.expectedFormat).toBe("Enter the rule in your own words");
	});
	it("generates rule type question for divisor 5",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toBe("State the divisibility rule for 5.");
		expect(dto.correct).toBe("A number is divisible by 5 if its last digit is 0 or 5.");
	});
	it("generates identify_prime type for composite number",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.35).mockReturnValueOnce(0.5);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toBe("Is 52 prime or composite?");
		expect(dto.correct).toBe("composite");
		expect(dto.expectedFormat).toBe("Enter 'prime' or 'composite'");
	});
	it("generates divisible_by type with yes answer",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.7).mockReturnValueOnce(0.1).mockReturnValueOnce(0.1).mockReturnValueOnce(0.4);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toContain("Is");
		expect(dto.latex).toContain("divisible by 2");
		expect(dto.correct).toBe("yes");
		expect(dto.expectedFormat).toBe("Enter 'yes' or 'no'");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateDivisibility("medium", seededRng(42));
		const dto2=generateDivisibility("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes medium difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		generateDivisibility("medium", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",100);
	});
	it("passes easy difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivisibility("easy", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",100);
		expect(dto.correct).toBeDefined();
	});
	it("passes hard difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivisibility("hard", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",100);
		expect(dto.correct).toBeDefined();
	});
	it("handles divisibility by 2 rule",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toContain("divisibility rule for 2");
		expect(dto.correct).toBe("A number is divisible by 2 if its last digit is even.");
	});
	it("handles divisibility by 3 rule",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.2);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toContain("divisibility rule for 3");
		expect(dto.correct).toBe("A number is divisible by 3 if the sum of its digits is divisible by 3.");
	});
	it("handles divisibility by 5 rule",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.4);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex).toContain("divisibility rule for 5");
		expect(dto.correct).toBe("A number is divisible by 5 if its last digit is 0 or 5.");
	});
	it("handles prime numbers",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.35).mockReturnValueOnce(0.05);
		const dto=generateDivisibility("medium", rng);
		expect(dto.correct).toBe("prime");
	});
	it("produces non-empty latex with display property",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDivisibility("medium", rng);
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.display).toBe("string");
	});
});
describe("generateGCFLCM",()=>{
	beforeEach(()=>{
		vi.mocked(getMaxForDifficulty).mockClear();
	});
	it("generates GCF type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
		const dto=generateGCFLCM("medium", rng);
		expect(dto.latex).toContain("Find the greatest common factor (GCF) of");
		expect(dto.correct).toBe("5");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("generates LCM type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.35).mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
		const dto=generateGCFLCM("medium", rng);
		expect(dto.latex).toContain("Find the least common multiple (LCM) of");
		expect(dto.correct).toBe("385");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("generates word problem type question",()=>{
		const rng=vi.fn().mockReturnValueOnce(0.7).mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
		const dto=generateGCFLCM("medium", rng);
		expect(dto.latex).toContain("largest number that divides both");
		expect(dto.correct).toBe("5");
		expect(dto.expectedFormat).toBe("Enter a number");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateGCFLCM("medium", seededRng(42));
		const dto2=generateGCFLCM("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("passes hard difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		generateGCFLCM("hard", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("hard",30);
	});
	it("passes easy difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateGCFLCM("easy", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("easy",30);
		expect(dto.correct).toBeDefined();
	});
	it("passes medium difficulty to getMaxForDifficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateGCFLCM("medium", rng);
		expect(vi.mocked(getMaxForDifficulty)).toHaveBeenCalledWith("medium",30);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices array",()=>{
		const rng=vi.fn().mockReturnValue(0);
		const dto=generateGCFLCM("medium", rng);
		expect(Array.isArray(dto.choices)).toBe(true);
		expect(dto.choices!.length).toBeGreaterThan(0);
	});
});
