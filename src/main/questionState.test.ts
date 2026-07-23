/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("./core/domRegistry",()=>({
    dom:{
        displays:{
            questionArea:null,
            mcqChoicesContainer:null,
            previewDiv:null,
        }
    }
}));
import{QuestionState}from"./core/questionState";
describe("QuestionState",()=>{
    let state: QuestionState;
    beforeEach(()=>{
        state=new QuestionState();
    });
    it("should initialize with default values",()=>{
        expect(state.correctAnswer).toEqual({correct:"",alternate:"",display:""});
        expect(state.expectedFormat).toBe("");
        expect(state.hasQuestion).toBe(false);
    });
    it("should allow setting correctAnswer",()=>{
        state.correctAnswer={correct:"4",alternate:"four",display:"4"};
        expect(state.correctAnswer).toEqual({correct:"4",alternate:"four",display:"4"});
    });
    it("should allow setting expectedFormat",()=>{
        state.expectedFormat="Enter a number";
        expect(state.expectedFormat).toBe("Enter a number");
    });
    it("should allow setting hasQuestion",()=>{
        state.hasQuestion=true;
        expect(state.hasQuestion).toBe(true);
    });
    it("should reset all state to defaults",()=>{
        state.correctAnswer={correct:"4",alternate:"four",display:"4"};
        state.expectedFormat="Enter a number";
        state.hasQuestion=true;
        state.reset();
        expect(state.correctAnswer).toEqual({correct:"",alternate:"",display:""});
        expect(state.expectedFormat).toBe("");
        expect(state.hasQuestion).toBe(false);
    });
    it("should sync with window globals",()=>{
        state.correctAnswer={correct:"4",alternate:"four",display:"4"};
        expect(window.correctAnswer).toEqual({correct:"4",alternate:"four",display:"4"});
        state.expectedFormat="Enter a number";
        expect(window.expectedFormat).toBe("Enter a number");
        state.hasQuestion=true;
        expect(window.hasQuestion).toBe(true);
    });
});