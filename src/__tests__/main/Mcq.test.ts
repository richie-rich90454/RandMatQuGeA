/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach}from"vitest";
vi.mock("../../main/core/StateStore",()=>{
    let mcqMode=false;
    let mcqChoices:string[]=[];
    const setMcqChoices=vi.fn((c:string[])=>{mcqChoices=c;});
    const appState={
        get mcqMode(){return mcqMode;},
        set mcqMode(v:boolean){mcqMode=v;},
        get mcqChoices(){return mcqChoices;},
        set mcqChoices(v:string[]){setMcqChoices(v);},
        setMcqChoices,
    };
    return{appState};
});
vi.mock("../../main/core/QuestionState",()=>({
    questionState:{
        get correctAnswer(){return(window as any).correctAnswer;},
        set correctAnswer(v:any){(window as any).correctAnswer=v;},
    }
}));
vi.mock("../../main/Settings.js",()=>({
    settings:{mcqChoicesCount:4},
}));
vi.mock("../../main/Ui.js",()=>({
    renderMcqChoices:vi.fn(),
}));
vi.mock("mathjs",()=>{
    const evaluate=vi.fn((expr:string)=>{
        try{
            return Function('"use strict";return ('+expr+')')();
        }catch{
            return NaN;
        }
    });
    return{evaluate,default:{evaluate}};
});
import{generateDistractors,generateChoicesForCurrentQuestion}from"../../main/Mcq.js";
import{isFiniteNumberText, sameNumericValue, canonicalNumeric}from"../../main/AnswerFormat";
import*as stateStore from"../../main/core/StateStore";
import* as ui from"../../main/Ui.js";
import* as settings from"../../main/Settings.js";
const state:any=stateStore.appState;
/** The option values a learner must never be shown. */
const UNUSABLE=/NaN|Infinity|null|\?\?/;
/**
 * Reports whether two options are the same value, so that "0.50" and "0.5" are one
 * option rather than two, and "Hello" and "hello" are one option too: a case variant
 * of the answer is a second correct option, not a wrong one.
 */
function sameValue(a: string, b: string): boolean{
    if (isFiniteNumberText(a)&&isFiniteNumberText(b)) return sameNumericValue(a, b);
    return a.trim().toLowerCase()===b.trim().toLowerCase();
}
/** The one spelling an option is compared under. */
function spelling(option: string): string{
    if (isFiniteNumberText(option)) return canonicalNumeric(option);
    return option.trim().toLowerCase();
}
/**
 * Asserts the option-set contract for a given count: exactly that many options,
 * exactly one of them the correct answer, no two the same value, and nothing a
 * learner could never be offered. A bare length says none of the rest, which is how
 * a three-option question with two correct answers once passed.
 */
function expectValidOptionSet(options: string[], correct: string, count: number): void{
    expect(options).toHaveLength(count);
    expect(options.filter(o=>sameValue(o, correct))).toHaveLength(1);
    expect(options.filter(o=>UNUSABLE.test(o))).toEqual([]);
    expect(new Set(options.map(spelling)).size).toBe(options.length);
}
/**
 * Asserts the part of the contract that holds however many alternatives the answer
 * admits: the key is present exactly once, no two options are the same value, and
 * none is unusable. Used where the answer runs out of honest alternatives, because a
 * set that cannot be filled is returned short rather than padded.
 */
function expectOneCorrectOption(options: string[], correct: string): void{
    expect(options).toContain(correct);
    expect(options.filter(o=>sameValue(o, correct))).toHaveLength(1);
    expect(options.filter(o=>UNUSABLE.test(o))).toEqual([]);
    expect(new Set(options.map(spelling)).size).toBe(options.length);
}
describe("generateDistractors",()=>{
    it("should return four options with exactly one correct for a whole number",async()=>{
        const result=await generateDistractors("42",4);
        expectValidOptionSet(result, "42", 4);
    });
    it("should work with numeric answers",async()=>{
        const result=await generateDistractors("10",4);
        expectValidOptionSet(result, "10", 4);
    });
    it("should work with coordinate answers",async()=>{
        const result=await generateDistractors("(3, 4)",4);
        expectValidOptionSet(result, "(3, 4)", 4);
    });
    it("should work with text answers",async()=>{
        const result=await generateDistractors("hello",4);
        expectValidOptionSet(result, "hello", 4);
    });
});
describe("generateChoicesForCurrentQuestion",()=>{
    it("should not throw when called without question",async()=>{
        await expect(generateChoicesForCurrentQuestion()).resolves.not.toThrow();
    });
});
describe("generateDistractors - numeric",()=>{
    it("should include correct answer in results",async()=>{
        const result=await generateDistractors("42",4);
        expect(result).toContain("42");
    });
    it("should reach the configured count for a numeric answer",async()=>{
        // The count is a real setting, so a count other than four is legal; what is
        // not legal is returning a set that ignores it.
        const result=await generateDistractors("7",5);
        expectValidOptionSet(result, "7", 5);
    });
    it("should not include correct answer as a distractor",async()=>{
        const result=await generateDistractors("5",4);
        const filtered=result.filter((v:string)=>v!=="5");
        const unique=new Set(filtered);
        expect(unique.size).toBe(filtered.length);
        expectOneCorrectOption(result, "5");
    });
    it("should work with negative numbers",async()=>{
        const result=await generateDistractors("-3",4);
        expectValidOptionSet(result, "-3", 4);
    });
    it("should work with decimal numbers",async()=>{
        const result=await generateDistractors("3.14",4);
        expectValidOptionSet(result, "3.14", 4);
    });
    it("should work with zero",async()=>{
        const result=await generateDistractors("0",4);
        expectValidOptionSet(result, "0", 4);
    });
    it("should work with large numbers",async()=>{
        const result=await generateDistractors("1000000",4);
        expectValidOptionSet(result, "1000000", 4);
    });
    it("should work with count of 2",async()=>{
        const result=await generateDistractors("10",2);
        expectValidOptionSet(result, "10", 2);
    });
    it("should work with count of 6",async()=>{
        const result=await generateDistractors("10",6);
        expectValidOptionSet(result, "10", 6);
    });
});
describe("generateDistractors - coordinate",()=>{
    it("should generate coordinate distractors for (x, y) format",async()=>{
        const result=await generateDistractors("(3, 4)",4);
        expectValidOptionSet(result, "(3, 4)", 4);
    });
    it("should generate distractors for center/radius format",async()=>{
        const result=await generateDistractors("center (1, 2), radius 3",4);
        expectValidOptionSet(result, "center (1, 2), radius 3", 4);
    });
    it("should generate quadrant distractors",async()=>{
        const result=await generateDistractors("I",4);
        expectValidOptionSet(result, "I", 4);
    });
    it("should include correct answer in coordinate distractors",async()=>{
        const result=await generateDistractors("(5, 6)",4);
        expect(result).toContain("(5, 6)");
    });
});
describe("generateDistractors - text fallback",()=>{
    it("should generate text fallback distractors",async()=>{
        const result=await generateDistractors("hello",3);
        expectValidOptionSet(result, "hello", 3);
    });
    it("should include correct answer in text fallback",async()=>{
        const result=await generateDistractors("world",3);
        expect(result).toContain("world");
        expectOneCorrectOption(result, "world");
    });
    it("should never pad an option set with filler",async()=>{
        // A placeholder option teaches a learner to find the one option that
        // looks like an answer rather than to read the question, so a set that
        // cannot be filled with real alternatives is returned short.
        const result=await generateDistractors("a",4);
        expect(result).toContain("a");
        expect(result).not.toContain("??");
        expect(new Set(result).size).toBe(result.length);
    });
    it("should terminate for text answers with count exceeding unique variations (E001 regression)",async()=>{
        const start=Date.now();
        const result=await generateDistractors("hello",10);
        const elapsed=Date.now()-start;
        expect(elapsed).toBeLessThan(2000);
        expect(result.length).toBeLessThanOrEqual(10);
        expectOneCorrectOption(result, "hello");
    });
    it("should work with single character answers",async()=>{
        const result=await generateDistractors("x",4);
        expectValidOptionSet(result, "x", 4);
    });
    it("should not offer a case variant of the answer as a distractor",async()=>{
        // HELLO and hello are the same answer, so a case variant is a second
        // correct option rather than a wrong one.
        const result=await generateDistractors("Hello",4);
        expectValidOptionSet(result, "Hello", 4);
        const caseVariants=result.filter((v:string)=>v!=="Hello"&&v.toLowerCase()==="hello");
        expect(caseVariants).toHaveLength(0);
    });
});
describe("generateChoicesForCurrentQuestion - integration",()=>{
    afterEach(()=>{
        (state as any).mcqMode=false;
        (window as any).correctAnswer=undefined;
        (settings as any).settings.mcqChoicesCount=4;
        (state.setMcqChoices as any).mockClear();
        (ui.renderMcqChoices as any).mockClear();
    });
    it("should return early when mcqMode is false",async()=>{
        (state as any).mcqMode=false;
        await generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).not.toHaveBeenCalled();
    });
    it("should return early when no correctAnswer",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer=undefined;
        await generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).not.toHaveBeenCalled();
    });
    it("should call setMcqChoices when mcqMode is true",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42"};
        await generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).toHaveBeenCalled();
    });
    it("should call renderMcqChoices when mcqMode is true",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42"};
        await generateChoicesForCurrentQuestion();
        expect(ui.renderMcqChoices).toHaveBeenCalled();
    });
    it("should use pre-defined choices when available",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42",choices:["42","10","20","30"]};
        await generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expectValidOptionSet(calledArgs, "42", 4);
        expect(calledArgs).toContain("10");
        expect(calledArgs).toContain("20");
        expect(calledArgs).toContain("30");
    });
    it("should shuffle pre-defined choices",async()=>{
        (state as any).mcqMode=true;
        const choices=["a","b","c","d"];
        (window as any).correctAnswer={correct:"a",choices:choices};
        let sawDifferent=false;
        for (let i=0;i<20;i++){
            (state.setMcqChoices as any).mockClear();
            await generateChoicesForCurrentQuestion();
            const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
            if (calledArgs[0]!=="a"||calledArgs[1]!=="b"||calledArgs[2]!=="c"||calledArgs[3]!=="d"){
                sawDifferent=true;
                break;
            }
        }
        expect(sawDifferent).toBe(true);
    });
    it("should ensure correct answer is in choices",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42",choices:["10","20","30","40"]};
        await generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expectValidOptionSet(calledArgs, "42", 4);
    });
    it("should keep the configured count when the generator supplies more options",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"a",choices:["a","b","c","d","e","f"]};
        await generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expectValidOptionSet(calledArgs, "a", 4);
    });
    it("should generate distractors when no pre-defined choices",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42"};
        await generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expectValidOptionSet(calledArgs, "42", 4);
    });
    it("should respect mcqChoicesCount setting",async()=>{
        (state as any).mcqMode=true;
        (settings as any).settings.mcqChoicesCount=6;
        (window as any).correctAnswer={correct:"42"};
        await generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expectValidOptionSet(calledArgs, "42", 6);
    });
    it("should handle choices with fewer items than count",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42",choices:["42","10"]};
        await generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expectValidOptionSet(calledArgs, "42", 4);
    });
    it("should handle empty correct answer",async()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:""};
        await generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).not.toHaveBeenCalled();
    });
});
describe("generateDistractors - boundary conditions",()=>{
    it("should handle count of 1",async()=>{
        // One option is the whole contract at a count of one: the answer, and the
        // only thing that can be right.
        const result=await generateDistractors("42",1);
        expectValidOptionSet(result, "42", 1);
    });
    it("should handle count of 0",async()=>{
        const result=await generateDistractors("42",0);
        expect(result).toEqual([]);
    });
    it("should handle negative count",async()=>{
        const result=await generateDistractors("42",-1);
        expect(result).toEqual([]);
    });
    it("should return real options up to a very large count",async()=>{
        // There is no honest way to build a hundred wrong alternatives for a
        // single number, so the set comes back short rather than padded. What still
        // has to hold is that everything in it is a real, distinct, wrong option.
        const result=await generateDistractors("42",100);
        expect(result.length).toBeGreaterThanOrEqual(4);
        expect(result.length).toBeLessThan(100);
        expectOneCorrectOption(result, "42");
    });
    it("should handle answer of \"0\"",async()=>{
        const result=await generateDistractors("0",4);
        expectValidOptionSet(result, "0", 4);
    });
    it("should handle answer of \"1\"",async()=>{
        const result=await generateDistractors("1",4);
        expectValidOptionSet(result, "1", 4);
    });
    it("should handle answer of \"-1\"",async()=>{
        const result=await generateDistractors("-1",4);
        expectValidOptionSet(result, "-1", 4);
    });
    it("should handle answer with many decimal places",async()=>{
        const result=await generateDistractors("3.14159265358979",4);
        expectValidOptionSet(result, "3.14159265358979", 4);
    });
    it("should handle answer in scientific notation",async()=>{
        const result=await generateDistractors("1e5",4);
        expectValidOptionSet(result, "1e5", 4);
    });
    it("should handle answer with leading plus sign",async()=>{
        const result=await generateDistractors("+5",4);
        expectValidOptionSet(result, "+5", 4);
    });
});
describe("generateDistractors - string patterns",()=>{
    it("should handle answer with parentheses",async()=>{
        const result=await generateDistractors("(test)",4);
        expectValidOptionSet(result, "(test)", 4);
    });
    it("should handle answer with brackets",async()=>{
        const result=await generateDistractors("[1, 2]",4);
        expectValidOptionSet(result, "[1, 2]", 4);
    });
    it("should handle answer with braces",async()=>{
        const result=await generateDistractors("{1, 2}",4);
        expectValidOptionSet(result, "{1, 2}", 4);
    });
    it("should handle answer with equals sign",async()=>{
        const result=await generateDistractors("x=5",4);
        expectValidOptionSet(result, "x=5", 4);
    });
    it("should handle answer with comma",async()=>{
        const result=await generateDistractors("a, b",4);
        expectValidOptionSet(result, "a, b", 4);
    });
});
