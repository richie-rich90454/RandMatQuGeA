/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi} from "vitest";
import {seededRng} from "../../main/core/Rng";
import {generateDegreesToRadians,generateRadiansToDegrees,generateArcLength,generateAngularLinearSpeed,generateRightTriangleDefs,generateSpecialTriangle,generateElevationDepression,generateReferenceAngle,generateASTCSign,generateSumDifference,generateDoubleAngle,generateHalfAngle,generatePolarToRectangular,generateRectangularToPolar,generatePolarDistance,generatePolarGraphEquation,generateParametricToCartesian,generateParametricMotion,generateComplexPolarForm,generateComplexMultiplyDivide,generateDeMoivre,generateComplexRoots} from "./TrigAnalytic.js";
vi.mock("../Algebra/algebraUtils.js",()=>({
	getMaxForDifficulty: vi.fn(()=>5),
	factorial: vi.fn(function f(n:number):number{return n<=1?1:n*f(n-1);}),
	gcd: vi.fn(function g(a:number,b:number):number{return b===0?Math.abs(a):g(b,a%b);}),
	getOrdinal: vi.fn((n:number)=>{let s=["th","st","nd","rd"];let v=n%100;return s[(v-20)%10]||s[v]||s[0];})
}));
describe("generateDegreesToRadians",()=>{
	it("generates degrees to radians question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDegreesToRadians("medium", rng);
		expect(dto.latex).toContain("Convert");
		expect(dto.latex).toContain("radians");
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toBeDefined();
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateDegreesToRadians("medium", seededRng(42));
		const dto2=generateDegreesToRadians("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDegreesToRadians("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDegreesToRadians("hard", rng);
		expect(dto.correct).toBeDefined();
	});
	it("includes choices with correct answer",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDegreesToRadians("medium", rng);
		expect(dto.choices).toContain(dto.correct);
	});
});
describe("generateRadiansToDegrees",()=>{
	it("generates radians to degrees question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateRadiansToDegrees("medium", rng);
		expect(dto.latex).toContain("Convert");
		expect(dto.latex).toContain("degrees");
		expect(dto.correct).toContain("°");
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateRadiansToDegrees("medium", seededRng(42));
		const dto2=generateRadiansToDegrees("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateRadiansToDegrees("easy", rng);
		expect(dto.correct).toBeDefined();
	});
});
describe("generateArcLength",()=>{
	it("generates arc length question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateArcLength("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateArcLength("medium", seededRng(42));
		const dto2=generateArcLength("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
	it("handles easy difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateArcLength("easy", rng);
		expect(dto.correct).toBeDefined();
	});
	it("handles hard difficulty",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateArcLength("hard", rng);
		expect(dto.correct).toBeDefined();
	});
});
describe("generateAngularLinearSpeed",()=>{
	it("generates angular/linear speed question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateAngularLinearSpeed("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateAngularLinearSpeed("medium", seededRng(42));
		const dto2=generateAngularLinearSpeed("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateRightTriangleDefs",()=>{
	it("generates right triangle definitions question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateRightTriangleDefs("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateRightTriangleDefs("medium", seededRng(42));
		const dto2=generateRightTriangleDefs("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateSpecialTriangle",()=>{
	it("generates special triangle question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSpecialTriangle("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSpecialTriangle("medium", seededRng(42));
		const dto2=generateSpecialTriangle("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateElevationDepression",()=>{
	it("generates elevation/depression question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateElevationDepression("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateElevationDepression("medium", seededRng(42));
		const dto2=generateElevationDepression("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateReferenceAngle",()=>{
	it("generates reference angle question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateReferenceAngle("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateReferenceAngle("medium", seededRng(42));
		const dto2=generateReferenceAngle("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateASTCSign",()=>{
	it("generates ASTC sign question",()=>{
		const rng=vi.fn().mockReturnValue(0.2).mockReturnValue(0.5);
		const dto=generateASTCSign("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(["positive","negative"]).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateASTCSign("medium", seededRng(42));
		const dto2=generateASTCSign("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateSumDifference",()=>{
	it("generates sum/difference question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateSumDifference("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateSumDifference("medium", seededRng(42));
		const dto2=generateSumDifference("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateDoubleAngle",()=>{
	it("generates double angle question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDoubleAngle("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateDoubleAngle("medium", seededRng(42));
		const dto2=generateDoubleAngle("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateHalfAngle",()=>{
	it("generates half angle question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateHalfAngle("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateHalfAngle("medium", seededRng(42));
		const dto2=generateHalfAngle("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generatePolarToRectangular",()=>{
	it("generates polar to rectangular question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generatePolarToRectangular("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePolarToRectangular("medium", seededRng(42));
		const dto2=generatePolarToRectangular("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateRectangularToPolar",()=>{
	it("generates rectangular to polar question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateRectangularToPolar("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateRectangularToPolar("medium", seededRng(42));
		const dto2=generateRectangularToPolar("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generatePolarDistance",()=>{
	it("generates polar distance question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generatePolarDistance("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePolarDistance("medium", seededRng(42));
		const dto2=generatePolarDistance("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generatePolarGraphEquation",()=>{
	it("generates polar graph equation question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generatePolarGraphEquation("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generatePolarGraphEquation("medium", seededRng(42));
		const dto2=generatePolarGraphEquation("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateParametricToCartesian",()=>{
	it("generates parametric to cartesian question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateParametricToCartesian("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateParametricToCartesian("medium", seededRng(42));
		const dto2=generateParametricToCartesian("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateParametricMotion",()=>{
	it("generates parametric motion question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateParametricMotion("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateParametricMotion("medium", seededRng(42));
		const dto2=generateParametricMotion("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateComplexPolarForm",()=>{
	it("generates complex polar form question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateComplexPolarForm("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateComplexPolarForm("medium", seededRng(42));
		const dto2=generateComplexPolarForm("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateComplexMultiplyDivide",()=>{
	it("generates complex multiply/divide question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateComplexMultiplyDivide("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateComplexMultiplyDivide("medium", seededRng(42));
		const dto2=generateComplexMultiplyDivide("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateDeMoivre",()=>{
	it("generates De Moivre theorem question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateDeMoivre("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateDeMoivre("medium", seededRng(42));
		const dto2=generateDeMoivre("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("generateComplexRoots",()=>{
	it("generates complex roots question",()=>{
		const rng=vi.fn().mockReturnValue(0.5);
		const dto=generateComplexRoots("medium", rng);
		expect(dto.latex).toBeDefined();
		expect(dto.correct).toBeDefined();
		expect(dto.choices).toContain(dto.correct);
	});
	it("returns deterministic output for same seed",()=>{
		const dto1=generateComplexRoots("medium", seededRng(42));
		const dto2=generateComplexRoots("medium", seededRng(42));
		expect(dto1).toEqual(dto2);
	});
});
describe("Trigonometry analytic - comprehensive edge cases",()=>{
	it("all generators should produce non-empty latex",()=>{
		const gens=[generateDegreesToRadians,generateRadiansToDegrees,generateArcLength,generateAngularLinearSpeed,generateRightTriangleDefs,generateSpecialTriangle,generateElevationDepression,generateReferenceAngle,generateASTCSign,generateSumDifference,generateDoubleAngle,generateHalfAngle,generatePolarToRectangular,generateRectangularToPolar,generatePolarDistance,generatePolarGraphEquation,generateParametricToCartesian,generateParametricMotion,generateComplexPolarForm,generateComplexMultiplyDivide,generateDeMoivre,generateComplexRoots];
		for(const gen of gens){
			const rng=vi.fn().mockReturnValue(0.5);
			const dto=gen("medium", rng);
			expect(dto.latex.length).toBeGreaterThan(0);
		}
	});
	it("all generators should include correct answer in choices",()=>{
		const gens=[generateDegreesToRadians,generateRadiansToDegrees,generateArcLength,generateAngularLinearSpeed,generateRightTriangleDefs,generateSpecialTriangle,generateElevationDepression,generateReferenceAngle,generateASTCSign,generateSumDifference,generateDoubleAngle,generateHalfAngle,generatePolarToRectangular,generateRectangularToPolar,generatePolarDistance,generatePolarGraphEquation,generateParametricToCartesian,generateParametricMotion,generateComplexPolarForm,generateComplexMultiplyDivide,generateDeMoivre,generateComplexRoots];
		for(const gen of gens){
			const rng=vi.fn().mockReturnValue(0.5);
			const dto=gen("medium", rng);
			expect(dto.choices).toContain(dto.correct);
		}
	});
	it("should not crash on repeated generate calls",()=>{
		for(let i=0;i<30;i++){
			const rng=vi.fn().mockReturnValue(i/30);
			const dto=generateDegreesToRadians("medium", rng);
			expect(dto.correct).toBeDefined();
		}
	});
});