/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("./core/domRegistry",()=>({
    dom:{
        displays:{
            questionArea:{
                innerHTML:"",
                querySelector:vi.fn(()=>null),
            }
        }
    }
}));
import{ErrorHandler}from"./core/errorHandler";
describe("ErrorHandler",()=>{
    let handler: ErrorHandler;
    beforeEach(()=>{
        handler=new ErrorHandler();
    });
    it("should initialize without error",()=>{
        expect(handler).toBeDefined();
        expect(handler.getError()).toBeNull();
    });
    it("should catch synchronous errors",()=>{
        let result=handler.wrap(()=>{
            throw new Error("test error");
        });
        expect(result).toBeUndefined();
        expect(handler.getError()).toBe("test error");
    });
    it("should return value from successful sync function",()=>{
        let result=handler.wrap(()=>{
            return 42;
        });
        expect(result).toBe(42);
        expect(handler.getError()).toBeNull();
    });
    it("should catch async errors",async()=>{
        let result=await handler.wrapAsync(async()=>{
            throw new Error("async error");
        });
        expect(result).toBeUndefined();
        expect(handler.getError()).toBe("async error");
    });
    it("should return value from successful async function",async()=>{
        let result=await handler.wrapAsync(async()=>{
            return "success";
        });
        expect(result).toBe("success");
        expect(handler.getError()).toBeNull();
    });
    it("should clear error state",()=>{
        handler.wrap(()=>{
            throw new Error("test error");
        });
        expect(handler.getError()).toBe("test error");
        handler.clearError();
        expect(handler.getError()).toBeNull();
    });
    it("should handle non-Error thrown values",()=>{
        handler.wrap(()=>{
            throw "string error";
        });
        expect(handler.getError()).toBe("string error");
    });
});