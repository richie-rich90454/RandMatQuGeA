/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
describe("mathWorkerClient",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
    });
    it("should export evaluateInWorker",async()=>{
        let{evaluateInWorker}=await import("./services/mathWorkerClient");
        expect(typeof evaluateInWorker).toBe("function");
    });
    it("should export simplifyInWorker",async()=>{
        let{simplifyInWorker}=await import("./services/mathWorkerClient");
        expect(typeof simplifyInWorker).toBe("function");
    });
    it("should export terminateWorker",async()=>{
        let{terminateWorker}=await import("./services/mathWorkerClient");
        expect(typeof terminateWorker).toBe("function");
    });
});