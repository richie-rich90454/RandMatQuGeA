/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach}from"vitest";
vi.mock("./state.js",()=>{
    let mcqMode=false;
    let mcqChoices:string[]=[];
    return{
        mcqMode:mcqMode,
        mcqChoices:mcqChoices,
        setMcqChoices:vi.fn((c:string[])=>{mcqChoices=c;}),
    };
});
vi.mock("./settings.js",()=>({
    settings:{mcqChoicesCount:4},
}));
vi.mock("./ui.js",()=>({
    renderMcqChoices:vi.fn(),
}));
import{generateDistractors,generateChoicesForCurrentQuestion}from"./mcq.js";
import*as state from"./state.js";
import*as ui from"./ui.js";
import*as settings from"./settings.js";
describe("generateDistractors",()=>{
    it("should return an array of the given count",()=>{
        const result=generateDistractors("42",4);
        expect(result.length).toBe(4);
        expect(result).toContain("42");
    });
    it("should work with numeric answers",()=>{
        const result=generateDistractors("10",4);
        expect(result.length).toBe(4);
        expect(result).toContain("10");
    });
    it("should work with coordinate answers",()=>{
        const result=generateDistractors("(3, 4)",4);
        expect(result.length).toBe(4);
    });
    it("should work with text answers",()=>{
        const result=generateDistractors("hello",3);
        expect(result.length).toBe(3);
        expect(result).toContain("hello");
    });
});
describe("generateChoicesForCurrentQuestion",()=>{
    it("should not throw when called without question",()=>{
        expect(()=>generateChoicesForCurrentQuestion()).not.toThrow();
    });
});
describe("generateDistractors - numeric",()=>{
    it("should include correct answer in results",()=>{
        const result=generateDistractors("42",4);
        expect(result).toContain("42");
    });
    it("should generate correct count of distractors",()=>{
        const result=generateDistractors("7",5);
        expect(result.length).toBe(5);
    });
    it("should not include correct answer as a distractor",()=>{
        const result=generateDistractors("5",4);
        const filtered=result.filter((v:string)=>v!=="5");
        const unique=new Set(filtered);
        expect(unique.size).toBe(filtered.length);
    });
    it("should work with negative numbers",()=>{
        const result=generateDistractors("-3",4);
        expect(result.length).toBe(4);
        expect(result).toContain("-3");
    });
    it("should work with decimal numbers",()=>{
        const result=generateDistractors("3.14",4);
        expect(result.length).toBe(4);
        expect(result).toContain("3.14");
    });
    it("should work with zero",()=>{
        const result=generateDistractors("0",4);
        expect(result.length).toBe(4);
        expect(result).toContain("0");
    });
    it("should work with large numbers",()=>{
        const result=generateDistractors("1000000",4);
        expect(result.length).toBe(4);
        expect(result).toContain("1000000");
    });
    it("should work with count of 2",()=>{
        const result=generateDistractors("10",2);
        expect(result.length).toBe(2);
        expect(result).toContain("10");
    });
    it("should work with count of 6",()=>{
        const result=generateDistractors("10",6);
        expect(result.length).toBe(6);
        expect(result).toContain("10");
    });
});
describe("generateDistractors - coordinate",()=>{
    it("should generate coordinate distractors for (x, y) format",()=>{
        const result=generateDistractors("(3, 4)",4);
        expect(result.length).toBe(4);
        expect(result).toContain("(3, 4)");
    });
    it("should generate distractors for center/radius format",()=>{
        const result=generateDistractors("center (1, 2), radius 3",4);
        expect(result.length).toBe(4);
        expect(result).toContain("center (1, 2), radius 3");
    });
    it("should generate quadrant distractors",()=>{
        const result=generateDistractors("I",4);
        expect(result.length).toBe(4);
        expect(result).toContain("I");
    });
    it("should include correct answer in coordinate distractors",()=>{
        const result=generateDistractors("(5, 6)",4);
        expect(result).toContain("(5, 6)");
    });
});
describe("generateDistractors - text fallback",()=>{
    it("should generate text fallback distractors",()=>{
        const result=generateDistractors("hello",3);
        expect(result.length).toBe(3);
        expect(result).toContain("hello");
    });
    it("should include correct answer in text fallback",()=>{
        const result=generateDistractors("world",3);
        expect(result).toContain("world");
    });
    it("should fill remaining slots with ?? if needed",()=>{
        const result=generateDistractors("a",4);
        expect(result.length).toBe(4);
        expect(result).toContain("a");
        const qCount=result.filter((v:string)=>v==="??").length;
        expect(qCount).toBeGreaterThan(0);
    });
    it("should work with single character answers",()=>{
        const result=generateDistractors("x",4);
        expect(result.length).toBe(4);
        expect(result).toContain("x");
    });
    it("should work with uppercase/lowercase variations",()=>{
        const result=generateDistractors("Hello",4);
        expect(result.length).toBe(4);
        expect(result).toContain("Hello");
        const hasCaseVariant=result.some((v:string)=>v==="HELLO"||v==="hello");
        expect(hasCaseVariant).toBe(true);
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
    it("should return early when mcqMode is false",()=>{
        (state as any).mcqMode=false;
        generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).not.toHaveBeenCalled();
    });
    it("should return early when no correctAnswer",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer=undefined;
        generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).not.toHaveBeenCalled();
    });
    it("should call setMcqChoices when mcqMode is true",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42"};
        generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).toHaveBeenCalled();
    });
    it("should call renderMcqChoices when mcqMode is true",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42"};
        generateChoicesForCurrentQuestion();
        expect(ui.renderMcqChoices).toHaveBeenCalled();
    });
    it("should use pre-defined choices when available",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42",choices:["42","10","20","30"]};
        generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expect(calledArgs).toContain("42");
        expect(calledArgs).toContain("10");
        expect(calledArgs).toContain("20");
        expect(calledArgs).toContain("30");
    });
    it("should shuffle pre-defined choices",()=>{
        (state as any).mcqMode=true;
        const choices=["a","b","c","d"];
        (window as any).correctAnswer={correct:"a",choices:choices};
        let sawDifferent=false;
        for (let i=0;i<20;i++){
            (state.setMcqChoices as any).mockClear();
            generateChoicesForCurrentQuestion();
            const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
            if (calledArgs[0]!=="a"||calledArgs[1]!=="b"||calledArgs[2]!=="c"||calledArgs[3]!=="d"){
                sawDifferent=true;
                break;
            }
        }
        expect(sawDifferent).toBe(true);
    });
    it("should ensure correct answer is in choices",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42",choices:["10","20","30","40"]};
        generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expect(calledArgs).toContain("42");
    });
    it("should truncate choices to count",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"a",choices:["a","b","c","d","e","f"]};
        generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expect(calledArgs.length).toBe(4);
    });
    it("should generate distractors when no pre-defined choices",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42"};
        generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expect(calledArgs.length).toBe(4);
        expect(calledArgs).toContain("42");
    });
    it("should respect mcqChoicesCount setting",()=>{
        (state as any).mcqMode=true;
        (settings as any).settings.mcqChoicesCount=6;
        (window as any).correctAnswer={correct:"42"};
        generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expect(calledArgs.length).toBe(6);
    });
    it("should handle choices with fewer items than count",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:"42",choices:["42","10"]};
        generateChoicesForCurrentQuestion();
        const calledArgs=(state.setMcqChoices as any).mock.calls[0][0];
        expect(calledArgs.length).toBe(4);
        expect(calledArgs).toContain("42");
    });
    it("should handle empty correct answer",()=>{
        (state as any).mcqMode=true;
        (window as any).correctAnswer={correct:""};
        generateChoicesForCurrentQuestion();
        expect(state.setMcqChoices).not.toHaveBeenCalled();
    });
});
describe("generateDistractors - boundary conditions",()=>{
    it("should handle count of 1",()=>{
        const result=generateDistractors("42",1);
        expect(result.length).toBe(1);
        expect(result).toContain("42");
    });
    it("should handle count of 0",()=>{
        const result=generateDistractors("42",0);
        expect(result.length).toBe(0);
    });
    it("should handle negative count",()=>{
        const result=generateDistractors("42",-1);
        expect(result.length).toBe(0);
    });
    it("should handle very large count",()=>{
        const result=generateDistractors("42",100);
        expect(result.length).toBe(100);
        expect(result).toContain("42");
    });
    it("should handle answer of \"0\"",()=>{
        const result=generateDistractors("0",4);
        expect(result.length).toBe(4);
        expect(result).toContain("0");
    });
    it("should handle answer of \"1\"",()=>{
        const result=generateDistractors("1",4);
        expect(result.length).toBe(4);
        expect(result).toContain("1");
    });
    it("should handle answer of \"-1\"",()=>{
        const result=generateDistractors("-1",4);
        expect(result.length).toBe(4);
        expect(result).toContain("-1");
    });
    it("should handle answer with many decimal places",()=>{
        const result=generateDistractors("3.14159265358979",4);
        expect(result.length).toBe(4);
        expect(result).toContain("3.14159265358979");
    });
    it("should handle answer in scientific notation",()=>{
        const result=generateDistractors("1e5",4);
        expect(result.length).toBe(4);
        expect(result).toContain("1e5");
    });
    it("should handle answer with leading plus sign",()=>{
        const result=generateDistractors("+5",4);
        expect(result.length).toBe(4);
        expect(result).toContain("+5");
    });
});
describe("generateDistractors - string patterns",()=>{
    it("should handle answer with parentheses",()=>{
        const result=generateDistractors("(test)",4);
        expect(result.length).toBe(4);
        expect(result).toContain("(test)");
    });
    it("should handle answer with brackets",()=>{
        const result=generateDistractors("[1, 2]",4);
        expect(result.length).toBe(4);
        expect(result).toContain("[1, 2]");
    });
    it("should handle answer with braces",()=>{
        const result=generateDistractors("{1, 2}",4);
        expect(result.length).toBe(4);
        expect(result).toContain("{1, 2}");
    });
    it("should handle answer with equals sign",()=>{
        const result=generateDistractors("x=5",4);
        expect(result.length).toBe(4);
        expect(result).toContain("x=5");
    });
    it("should handle answer with comma",()=>{
        const result=generateDistractors("a, b",4);
        expect(result.length).toBe(4);
        expect(result).toContain("a, b");
    });
});
