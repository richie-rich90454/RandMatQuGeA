/**
 * @vitest-environment jsdom
 * @file The option-set contract every multiple-choice generator has to keep, stated
 * once because six copies of the rule used to keep it six times.
 * @description A generator's `choices` array is a claim: four options, exactly one
 * of them right. Each test here names a property of that claim rather than a
 * subject, because a property that six subjects each had to re-derive is a property
 * that a seventh subject will get wrong. The oracle gate checks the same claim from
 * the outside, by sampling every registered topic; these tests pin it from the
 * inside, so a defect in the rule itself is reported as a rule defect.
 */
import{describe,it,expect}from"vitest";
import{fourOptions, numberOptions}from"../../../modules/shared/Options";
import{fmt}from"../../../modules/shared/Numeric";

describe("fourOptions",()=>{
    it("returns the key first, followed by the candidates in the order it was given",()=>{
        expect(fourOptions("2",["1","3","4","5"])).toEqual(["2","1","3","4"]);
    });
    it("treats two spellings of one number as the one option they are",()=>{
        let options=fourOptions("1.00",["1.10","0.90","1","2"]);
        expect(options).toHaveLength(4);
        expect(options.filter(o=>Number(o)===1)).toHaveLength(1);
    });
    it("treats a decimal and a fraction of one quantity as the one option they are",()=>{
        expect(fourOptions("1",["1.00","2/2","2","3"])).toEqual(["1","2","3","0"]);
        let options=fourOptions("0.50",["0.5","0.500","1/2","0.25","0.75"]);
        expect(options).toHaveLength(4);
        expect(options.filter(o=>Number(o)===0.5)).toHaveLength(1);
    });
    it("drops every spelling of the key and still reaches four options",()=>{
        let options=fourOptions("4",["4.000","4.0","+4","5"]);
        expect(options).toHaveLength(4);
        expect(options.filter(o=>Number(o)===4)).toHaveLength(1);
    });
    it("drops a distractor that is the key written in another unit",()=>{
        expect(fourOptions("6.28 rad",["6.28","3.14 rad","12.57 rad","0.79 rad"])).toEqual(["6.28 rad","3.14 rad","12.57 rad","0.79 rad"]);
    });
    it("drops a distractor that is the key with a different multiple of pi",()=>{
        expect(fourOptions("π/2",["2π/4","π/3","π/4","2π/3"])).toEqual(["π/2","π/3","π/4","2π/3"]);
    });
    it("drops a distractor that is the key behind a leading variable and sign",()=>{
        let options=fourOptions("x = 3",["3","x = 4","x = 2","x = 1"]);
        expect(options).toHaveLength(4);
        expect(options.filter(o=>o.replace(/^x\s*=\s*/,"")==="3")).toHaveLength(1);
    });
    it("never re-spells the key in a different case",()=>{
        let options=fourOptions("Substitution",["substitution","partial fractions","integration by parts"]);
        expect(options).toContain("Substitution");
        expect(options).not.toContain("substitution");
    });
    it("keeps an interval, a matrix and a sentence in the spelling the question gave it",()=>{
        expect(fourOptions("(1, 2)",["(1, 3)"])).toEqual(["(1, 2)","(1, 3)"]);
        let options=fourOptions("y=C e^(1.50x^2)",["y=C e^(1.50x)","y=C e^(3x^2)","y=Cx^1.50","y=C e^(1.50x^2)+1"]);
        expect(options).toHaveLength(4);
        expect(options[0]).toBe("y=C e^(1.50x^2)");
    });
    it("rejects a value no learner could be written rather than offering it",()=>{
        let options=fourOptions("2",["NaN","Infinity","-Infinity","null","-0.00","4.00e+5","3"]);
        expect(options).toHaveLength(4);
        for(let option of options){
            expect(option).not.toMatch(/NaN|Infinity|null|-0\.00|e\+\d/);
        }
    });
    it("never emits a blank option, whatever a branch puts in the pool",()=>{
        let pool:string[]=["","   ",null as unknown as string,undefined as unknown as string,"5","7","11"];
        let options=fourOptions("3",pool);
        expect(options).toHaveLength(4);
        for(let option of options){
            expect(option.trim()).not.toBe("");
        }
    });
    it("allows undefined, which is a real answer wherever a ratio is undefined",()=>{
        expect(fourOptions("undefined",["0","1","-1"])).toEqual(["undefined","0","1","-1"]);
        expect(fourOptions("3.14",["Infinity","1.57","6.28","0.79"])).toEqual(["3.14","1.57","6.28","0.79"]);
    });
    it("tops a pool that has all collided up from the answer instead of shipping three options",()=>{
        let options=fourOptions("7",["7.0","7"]);
        expect(options).toHaveLength(4);
        expect(options.filter(o=>Number(o)===7)).toHaveLength(1);
    });
    it("tops a numeric key up rather than shipping an unusable option",()=>{
        let options=fourOptions("2",["NaN","Infinity","null","","  "]);
        expect(options).toHaveLength(4);
        for(let option of options){
            expect(option).not.toMatch(/NaN|Infinity|null/);
        }
    });
    it("leaves a pool that is genuinely exhausted at what it has rather than inventing filler",()=>{
        // A filler option teaches a learner to find the one that looks like an
        // answer, so an answer that admits no alternative is returned short and the
        // gate is left free to fail the branch that named too few.
        expect(fourOptions("no mode",["none","every value ties"])).toEqual(["no mode","none","every value ties"]);
        expect(fourOptions("converges",["diverges"])).toEqual(["converges","diverges"]);
        expect(fourOptions("min",["1.00","1.000","1e0"])).toEqual(["min","1.00"]);
    });
});

describe("numberOptions",()=>{
    it("renders the key and every option through the same rounding decision",()=>{
        let options=numberOptions(1/3,[-1/3,2/3,1,4],2);
        expect(options[0]).toBe("0.33");
        expect(options).toHaveLength(4);
        for(let option of options){
            expect(option).toBe(fmt(Number(option),2));
        }
    });
    it("keeps a candidate that rounds onto the key out of the set",()=>{
        let options=numberOptions(1,[2,1/3,1/2,3],0);
        expect(options).toEqual(["1","2","0","3"]);
    });
    it("reaches four options for a key whose whole candidate pool collides",()=>{
        let options=numberOptions(5,[5,5.5,4.5,5.25],0);
        expect(options).toHaveLength(4);
        expect(options.filter(o=>Number(o)===5)).toHaveLength(1);
    });
});