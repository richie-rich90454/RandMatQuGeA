import{describe,it,expect}from"vitest";
import{latexToPlain,canonicalWordToken,canonicalWordSet,equivalentWordAnswers}from"../../main/AnswerFormat";
describe("latexToPlain nested fractions and roots",()=>{
    it("converts a reciprocal of a trig ratio carrying a degree mark",()=>{
        expect(latexToPlain("\\frac{1}{\\sin(30^{\\circ})}")).toBe("(1)/(sin(30))");
    });
    it("converts a half-angle surd with nested roots",()=>{
        expect(latexToPlain("\\frac{\\sqrt{6}-\\sqrt{2}}{4}")).toBe("(sqrt(6)-sqrt(2))/(4)");
    });
    it("converts a fraction nested inside a fraction",()=>{
        expect(latexToPlain("\\frac{\\frac{1}{2}}{3}")).toBe("((1)/(2))/(3)");
    });
    it("converts a root around a fraction",()=>{
        expect(latexToPlain("\\sqrt{\\frac{1}{2}}")).toBe("sqrt((1)/(2))");
    });
    it("converts arbitrarily deep nesting",()=>{
        expect(latexToPlain("\\frac{1}{\\frac{2}{\\frac{3}{4}}}")).toBe("(1)/((2)/((3)/(4)))");
    });
});
describe("word-level answer equivalence",()=>{
    it("canonicalises case, separators and plurals to one stem",()=>{
        expect(canonicalWordToken("Whole Numbers")).toBe("whole");
        expect(canonicalWordToken("whole-number")).toBe("whole");
        expect(canonicalWordToken("INTEGERS")).toBe("integer");
        expect(canonicalWordToken("irrational")).toBe("irrational");
    });
    it("canonicalises a set list independently of order",()=>{
        expect(canonicalWordSet("Whole Numbers, Integers, Rational, Real")).toBe("integer,rational,real,whole");
        expect(canonicalWordSet("real, rational, integer, whole")).toBe("integer,rational,real,whole");
    });
    it("treats a restated key as the same answer",()=>{
        expect(equivalentWordAnswers("whole, integer, rational, real", "Whole Numbers, Integers, Rational, Real")).toBe(true);
        expect(equivalentWordAnswers("even", "Evens")).toBe(true);
        expect(equivalentWordAnswers("whole-number", "whole number")).toBe(true);
    });
    it("keeps genuinely different sets apart",()=>{
        expect(equivalentWordAnswers("integer, rational, real", "whole, integer, rational, real")).toBe(false);
        expect(equivalentWordAnswers("even", "odd")).toBe(false);
    });
    it("never equates a number with a word",()=>{
        expect(equivalentWordAnswers("0", "zero")).toBe(false);
        expect(equivalentWordAnswers("0.50", "0.5")).toBe(false);
    });
});
