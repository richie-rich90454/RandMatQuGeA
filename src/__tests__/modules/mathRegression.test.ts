import {describe, expect, it} from "vitest";
import {generateRationalEquation} from "../../modules/Algebra/precalculus/GenerateRationalEquation.js";
import {generateRadicalSimplify} from "../../modules/Algebra/advanced/GenerateRadicalSimplify.js";
import {generateSumDifference, generateDoubleAngle} from "../../modules/Trigonometry/TrigAnalytic.js";
import {generateProbability} from "../../modules/DiscreteMathematics/DiscreteProbability.js";

function seededRng(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

const seeds = Array.from({length: 100}, (_, i) => i + 1);

describe("regression: rational equations never emit non-finite answers", () => {
	it.each(seeds)("seed %i produces a finite answer or 'no solution'", (seed) => {
		const dto = generateRationalEquation("medium", seededRng(seed));
		if (dto.correct === "no solution") {
			return;
		}
		const n = parseFloat(dto.correct);
		expect(Number.isFinite(n)).toBe(true);
	});
});

describe("regression: tangent sum/difference and double-angle never hit tan(90 deg)", () => {
	it.each(seeds)("sum/difference seed %i has a bounded answer", (seed) => {
		const dto = generateSumDifference("easy", seededRng(seed));
		const n = parseFloat(dto.correct);
		expect(Math.abs(n)).toBeLessThan(1e6);
	});
	it.each(seeds)("double-angle seed %i has a bounded answer", (seed) => {
		const dto = generateDoubleAngle("easy", seededRng(seed));
		const n = parseFloat(dto.correct);
		expect(Math.abs(n)).toBeLessThan(1e6);
	});
});

describe("regression: radical simplification is always in simplest form", () => {
	it.each(seeds)("seed %i never emits a sqrt(1) radicand", (seed) => {
		const dto = generateRadicalSimplify("medium", seededRng(seed));
		expect(dto.correct).not.toMatch(/\\sqrt\{1\}|√1/);
	});
});

describe("regression: Bayes answers are always valid probabilities", () => {
	it.each(seeds)("seed %i yields P(A|B) <= 1 when the question is a Bayes one", (seed) => {
		const dto = generateProbability("medium", seededRng(seed));
		if (dto.latex.includes("P(B|A)")) {
			const n = parseFloat(dto.correct);
			expect(Number.isFinite(n)).toBe(true);
			expect(n).toBeLessThanOrEqual(1.0001);
			expect(n).toBeGreaterThanOrEqual(0);
		}
	});
});
