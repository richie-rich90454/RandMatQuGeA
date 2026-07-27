/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach}from"vitest";
import{OfflineIndicator}from"../../main/ui/OfflineIndicator";
describe("OfflineIndicator",()=>{
    let indicator: OfflineIndicator;
    beforeEach(()=>{
        indicator=new OfflineIndicator();
    });
    it("should create instance",()=>{
        expect(indicator).toBeDefined();
    });
    it("should return online status",()=>{
        expect(indicator.getStatus()).toBe(false);
    });
    it("should init without errors",()=>{
        indicator.init();
        expect(indicator.getStatus()).toBe(false);
    });
    it("should destroy without errors",()=>{
        indicator.init();
        indicator.destroy();
        expect(indicator.getStatus()).toBe(false);
    });
});