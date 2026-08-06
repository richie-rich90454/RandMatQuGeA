import {describe, expect, it} from "vitest";
import * as algebra from "../../modules/Algebra/index.js";
import * as arithmetic from "../../modules/Arithmetic/index.js";
import * as calculus from "../../modules/Calculus/index.js";
import * as discrete from "../../modules/DiscreteMathematics/index.js";
import * as geometry from "../../modules/Geometry/index.js";
import * as linearAlgebra from "../../modules/LinearAlgebra/index.js";
import * as trigonometry from "../../modules/Trigonometry/index.js";

type GenFn = (difficulty?: string, rng?: () => number) => { latex: string; correct: string; choices?: string[]; expectedFormat?: string };

function seededRng(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

const barrels: Record<string, Record<string, unknown>> = {
	algebra, arithmetic, calculus, discrete, geometry, linearAlgebra, trigonometry
};

const difficulties = ["easy", "medium", "hard"];
const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const cases: [string, string, number, GenFn][] = [];
for (const [scope, mod] of Object.entries(barrels)) {
	for (const key of Object.keys(mod)) {
		if (key.startsWith("generate") && typeof mod[key] === "function") {
			for (const diff of difficulties) {
				for (const seed of seeds) {
					cases.push([`${scope}.${key}`, diff, seed, mod[key] as GenFn]);
				}
			}
		}
	}
}

describe("generator integrity across seeds and difficulties", () => {
	it.each(cases)("%s (%s, seed=%i) returns a structurally valid question", (_name, diff, seed, fn) => {
		const dto = fn(diff, seededRng(seed));
		expect(dto).toBeDefined();
		expect(typeof dto.latex).toBe("string");
		expect(dto.latex.length).toBeGreaterThan(0);
		expect(typeof dto.correct).toBe("string");
		expect(dto.correct.length).toBeGreaterThan(0);
		if (Array.isArray(dto.choices) && dto.choices.length > 0) {
			expect(dto.choices).toContain(dto.correct);
		}
	});
});
