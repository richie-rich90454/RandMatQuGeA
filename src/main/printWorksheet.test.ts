/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./questionGenerator.js",()=>({
    generateQuestion:vi.fn(),
}));
import{initPrintModal,openPrintModal}from"./printWorksheet.js";
describe("printWorksheet",()=>{
    it("should export initPrintModal",()=>{
        expect(typeof initPrintModal).toBe("function");
    });
    it("initPrintModal should not throw",()=>{
        expect(()=>initPrintModal()).not.toThrow();
    });
    it("should export openPrintModal",()=>{
        expect(typeof openPrintModal).toBe("function");
    });
});
