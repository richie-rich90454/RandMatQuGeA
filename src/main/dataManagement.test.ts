/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./ui.js",()=>({
    showNotification:vi.fn(),
}));
vi.mock("./session.js",()=>({
    updateLeaderboard:vi.fn(),
}));
import{openDataModal,initDataModal}from"./dataManagement.js";
describe("dataManagement",()=>{
    it("should export openDataModal",()=>{
        expect(typeof openDataModal).toBe("function");
    });
    it("openDataModal should not throw",async()=>{
        await expect(openDataModal()).resolves.toBeUndefined();
    });
    it("should export initDataModal",()=>{
        expect(typeof initDataModal).toBe("function");
    });
    it("initDataModal should not throw",()=>{
        expect(()=>initDataModal()).not.toThrow();
    });
});
