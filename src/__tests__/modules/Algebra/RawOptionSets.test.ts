/**
 * @vitest-environment jsdom
 * @file Every option set an Algebra generator returns is four usable options with
 * exactly one correct. These tests name the defect classes that gate found: a set
 * that offered fewer than four, a set that offered the same value twice, and a
 * set that offered a spelling no learner would write.
 */
import{describe,it,expect}from"vitest";
import{seededRng}from"../../../main/core/Rng";
import{generateLinearEquation, generateRationalInequality}from"../../../modules/Algebra/AlgebraEquations.js";
import{generateLinearGraphing}from"../../../modules/Algebra/AlgebraGraphingPolynomials.js";
import{generateFraction}from"../../../modules/Algebra/basics/GenerateFraction";
import{generateNumberSets}from"../../../modules/Algebra/basics/GenerateNumberSets";
import{generateOrderOfOperations}from"../../../modules/Algebra/basics/GenerateOrderOfOperations";
import{generatePercent}from"../../../modules/Algebra/basics/GeneratePercent";
import{generateRatioProportion}from"../../../modules/Algebra/basics/GenerateRatioProportion";
import{generateRoot}from"../../../modules/Algebra/advanced/GenerateRoot";
import{generateScientificNotation}from"../../../modules/Algebra/advanced/GenerateScientificNotation";

/** The values no learner can be shown, and the one that is not a value at all. */
const UNUSABLE=/NaN|Infinity|null|\?\?|-0\.00/;

/**
 * Reports whether an option denotes a plain number or a plain fraction, which is
 * what decides whether two options can be compared by value.
 *
 * @param option - The option to test.
 * @returns True when the option is a plain rational.
 */
function isPlainValue(option: string): boolean{
    return /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(option.trim())||/^[+-]?\d+\s*\/\s*\d+$/.test(option.trim());
}

/**
 * Reduces an option to the one thing that decides whether two of them are the
 * same option: its value. `5/4` and `20/16` are one option to a learner and two
 * to a string comparison, which is how a four-option question silently became a
 * three-option one.
 *
 * @param option - The option to reduce.
 * @returns Its numeric value when it has one, and the trimmed text otherwise.
 */
function valueOf(option: string): string{
    let text=option.trim();
    if (!isPlainValue(text)) return text;
    if (text.includes("/")){
        let parts=text.split("/");
        return String(Number(parts[0])/Number(parts[1]));
    }
    return String(Number(text));
}

/**
 * Reports whether an option set is four usable options with exactly one of them
 * equal to the key, which is the contract every generator in this subject now
 * states through one shared filter.
 *
 * @param choices - The generator's own option array.
 * @param correct - The generator's key.
 * @returns True when the set satisfies the contract.
 */
function isFourDistinctWithOneCorrect(choices: string[], correct: string): boolean{
    if (choices.length!==4) return false;
    let seen=new Set<string>();
    for(let option of choices){
        if (UNUSABLE.test(option)) return false;
        let value=valueOf(option);
        if (seen.has(value)) return false;
        seen.add(value);
    }
    let hits=choices.filter(o=>valueOf(o)===valueOf(correct));
    return hits.length===1&&hits[0]===correct;
}

describe("an option set is four distinct values with one correct",()=>{
    it("a two-step equation whose coefficient is one offers four options",()=>{
        // A coefficient of one made "the whole right-hand side" and "the answer"
        // the same number, so the text-only filter left three options.
        let dto=generateLinearEquation("easy", seededRng(12));
        expect(dto.latex).toBe("Solve: \\( 1x + 3=4 \\)");
        expect(dto.correct).toBe("1");
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a parenthesised equation whose coefficient is one offers four options",()=>{
        let dto=generateLinearEquation("easy", seededRng(1));
        expect(dto.latex).toBe("Solve: \\( 1(x + 3)=8 \\)");
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a rational inequality offers two real mistakes besides the two outer rays",()=>{
        // The three union candidates were all the same set written in one order
        // or the other, so the branch could only ever offer two options.
        let dto=generateRationalInequality("easy", seededRng(1));
        expect(dto.correct).toBe("(-∞,1) ∪ (2,∞)");
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("an evaluation whose parentheses collapse to one term offers four options",()=>{
        let dto=generateOrderOfOperations("easy", seededRng(31));
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a map scale of one offers four options",()=>{
        // A scale of one makes the map distance the answer, so the two scale-based
        // mistakes became the key and the set fell to three options.
        let dto=generateRatioProportion("easy", seededRng(1));
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a comparison whose answer domain is three symbols offers a fourth that is always wrong",()=>{
        let dto=generateNumberSets("easy", seededRng(2));
        expect(dto.correct).toBe(">");
        expect(dto.choices).toEqual([">","<","=","none of these"]);
    });
    it("a simplified fraction is never offered beside its own equivalent",()=>{
        // 5/4 and 20/16 are one option to a learner. The unreduced form is only a
        // wrong answer when the question asked for lowest terms.
        let dto=generateFraction("easy", seededRng(2));
        expect(dto.correct).toBe("5/4");
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a fraction operation offers four options when its mistakes collide",()=>{
        // 19/23 and 18/23, 20/23 and 19/24: four of the five candidates were the
        // same value written differently, which left three options.
        let dto=generateFraction("easy", seededRng(5));
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a one-year loan never offers the interest twice",()=>{
        // On a one-year loan the interest for a single year is the answer, so the
        // "forgot the years" option was a second correct answer.
        let dto=generatePercent("easy", seededRng(5));
        expect(dto.correct).toBe("42.00");
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a root of one never offers one as one and as 1.00",()=>{
        let dto=generateRoot("easy", seededRng(1));
        expect(dto.correct).toBe("1");
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a line equation never offers its intercept as 0.00 and as 0",()=>{
        // The key printed the intercept to two places while a distractor printed
        // the same number bare, so the question had two correct options.
        let dto=generateLinearGraphing("easy", seededRng(7));
        expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
    });
    it("a scientific-notation key is written the way the question declares it",()=>{
        // toExponential emits a leading sign, as in 4.00e+5, which contradicts a
        // declared format of 1.2e3 and is not a spelling a learner would write.
        for(let seed=1; seed<=30; seed++){
            let dto=generateScientificNotation("easy", seededRng(seed));
            for(let option of dto.choices as string[]){
                expect(option).not.toMatch(/^-?\d*\.?\d+[eE]\+\d+$/);
            }
            expect(isFourDistinctWithOneCorrect(dto.choices as string[], dto.correct)).toBe(true);
        }
    });
    it("a scientific-notation key is the exact product the prompt shows",()=>{
        // 2 x 10^2 times 6 x 10^2 is 1.2 x 10^5 exactly. Rounding the product to
        // two places produced 2.66e+7 for a product of 26569 x 10^3, which is a
        // number the printed factors cannot produce.
        let dto=generateScientificNotation("easy", seededRng(1));
        expect(dto.latex).toBe("Multiply: \\( (2 \\times 10^{2}) \\times (6 \\times 10^{2}) \\)");
        expect(dto.correct).toBe("1.20e5");
        expect(Number("1.20e5")).toBe(2*Math.pow(10,2)*6*Math.pow(10,2));
    });
});

describe("a distractor is never also the correct answer",()=>{
    it("classifying zero does not offer the whole-number list as a wrong answer",()=>{
        // The option validator compares options as values, and these are prose, so
        // it cannot see this one. Zero is a whole number and a rational number,
        // so "whole, integer, rational, real" was a second correct answer.
        let seen=0;
        for(let seed=1; seed<=40; seed++){
            let dto=generateNumberSets("easy", seededRng(seed));
            if (dto.latex.indexOf("Classify")!==0) continue;
            let num=Number(dto.latex.match(/(\d+)/)![1]);
            if (num!==0) continue;
            seen++;
            expect(dto.correct).toBe("whole, integer, rational, real");
            for(let option of dto.choices as string[]){
                if (option!==dto.correct) expect(option.indexOf("whole")).toBe(-1);
            }
        }
        expect(seen).toBeGreaterThan(0);
    });
    it("solving for x does not offer a coefficient of one, which makes an option the key",()=>{
        // With a coefficient of one, "c/a - by" is the same function as
        // "(c - by)/a", so the branch has to draw a coefficient above one, and
        // with equal coefficients the option that swaps them is the key. The
        // first draw of 0.9 selects the literal branch and every draw after that
        // is zero, which is the draw that used to produce a coefficient of one.
        let position=0;
        let rng=(): number=>position++===0?0.9:0;
        let dto=generateLinearEquation("medium", rng);
        expect(dto.latex.indexOf("Solve for x:")).toBe(0);
        let pair=dto.latex.match(/(\d+)x \+ (\d+)y = \d+/);
        expect(pair).not.toBeNull();
        expect(Number(pair![1])).toBeGreaterThan(1);
        expect(pair![1]).not.toBe(pair![2]);
    });
});
