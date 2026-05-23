/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
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
