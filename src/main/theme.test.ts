/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
let mockApplyTheme=vi.fn();
let mockAddEventListener=vi.fn();
let mockMatchMedia=vi.fn();
let mockAppWindow: any=null;
vi.mock("./core/domRegistry",()=>({
    dom:{
        get appWindow(){return mockAppWindow;},
        buttons:{
            get themeToggle(){return mockThemeToggle;}
        }
    }
}));
vi.mock("./settings.js",()=>({
    get settings(){return mockSettings;},
    applyTheme:(t: any)=>mockApplyTheme(t),
    saveSettings:vi.fn(),
}));
let mockSettings={theme:"system"};
let mockThemeToggle: any=null;
import{initializeTheme}from"./theme.js";
describe("theme",()=>{
    it("should export initializeTheme",()=>{
        expect(typeof initializeTheme).toBe("function");
    });
    it("initializeTheme should not throw",async()=>{
        await expect(initializeTheme()).resolves.toBeUndefined();
    });
});
describe("initializeTheme",()=>{
    beforeEach(()=>{
        mockApplyTheme=vi.fn();
        mockAddEventListener=vi.fn();
        mockMatchMedia=vi.fn();
        mockAppWindow=null;
        mockSettings={theme:"system"};
        mockThemeToggle=null;
        Object.defineProperty(window,"matchMedia",{
            writable:true,
            value:mockMatchMedia,
        });
    });
    afterEach(()=>{
        vi.clearAllMocks();
        localStorage.clear();
    });
    it("should be a function",()=>{
        expect(typeof initializeTheme).toBe("function");
    });
    it("should not throw when called",async()=>{
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await expect(initializeTheme()).resolves.toBeUndefined();
    });
    it("should apply dark theme when system prefers dark",async()=>{
        mockMatchMedia.mockReturnValue({matches:true,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
    it("should apply light theme when system prefers light",async()=>{
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("light");
    });
    it("should listen for system theme changes",async()=>{
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockAddEventListener).toHaveBeenCalledWith("change",expect.any(Function));
    });
    it("should handle missing matchMedia",async()=>{
        Object.defineProperty(window,"matchMedia",{writable:true,value:undefined});
        await expect(initializeTheme()).resolves.toBeUndefined();
    });
    it("should handle null matchMedia",async()=>{
        Object.defineProperty(window,"matchMedia",{writable:true,value:null});
        await expect(initializeTheme()).resolves.toBeUndefined();
    });
    it("should not throw when themeToggle is missing",async()=>{
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        mockThemeToggle=null;
        await expect(initializeTheme()).resolves.toBeUndefined();
    });
    it("should add click listener to theme toggle",async()=>{
        let addEventListener=vi.fn();
        mockThemeToggle={addEventListener};
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(addEventListener).toHaveBeenCalledWith("click",expect.any(Function));
    });
    it("should cycle through themes on click",async()=>{
        let clickHandler: any=null;
        mockThemeToggle={addEventListener:(_event: string,handler: any)=>{clickHandler=handler;}};
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(clickHandler).not.toBeNull();
        mockSettings.theme="system";
        await clickHandler();
        expect(mockSettings.theme).toBe("dark");
        await clickHandler();
        expect(mockSettings.theme).toBe("light");
        await clickHandler();
        expect(mockSettings.theme).toBe("system");
    });
    it("should save theme preference",async()=>{
        let clickHandler: any=null;
        mockThemeToggle={addEventListener:(_event: string,handler: any)=>{clickHandler=handler;}};
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        await clickHandler();
        expect(localStorage.getItem("theme")).toBe("dark");
    });
    it("should apply saved theme on init",async()=>{
        localStorage.setItem("theme","dark");
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
    it("should preserve system preference on reload (C004 regression)",async()=>{
        localStorage.setItem("theme","system");
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockSettings.theme).toBe("system");
        expect(mockApplyTheme).toHaveBeenCalledWith("light");
    });
    it("should handle invalid saved theme",async()=>{
        localStorage.setItem("theme","invalid");
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("light");
    });
    it("should handle empty saved theme",async()=>{
        localStorage.setItem("theme","");
        mockMatchMedia.mockReturnValue({matches:false,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("light");
    });
    it("should sync theme with Tauri when available",async()=>{
        mockAppWindow={theme:vi.fn().mockResolvedValue("dark"),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        await initializeTheme();
        expect(mockAppWindow.theme).toHaveBeenCalled();
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
    it("should register onThemeChanged when appWindow is available",async()=>{
        mockAppWindow={theme:vi.fn().mockResolvedValue("light"),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        await initializeTheme();
        expect(mockAppWindow.onThemeChanged).toHaveBeenCalledWith(expect.any(Function));
    });
    it("should attach themeToggle handler even when appWindow is present",async()=>{
        let addEventListener=vi.fn();
        mockThemeToggle={addEventListener};
        mockAppWindow={theme:vi.fn().mockResolvedValue("light"),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        await initializeTheme();
        expect(addEventListener).toHaveBeenCalledWith("click",expect.any(Function));
    });
    it("should await appWindow.theme() for system branch in Tauri mode",async()=>{
        mockSettings={theme:"system"};
        mockAppWindow={theme:vi.fn().mockResolvedValue("dark"),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        await initializeTheme();
        expect(mockAppWindow.theme).toHaveBeenCalled();
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
    it("should apply saved non-system theme via Tauri path",async()=>{
        localStorage.setItem("theme","dark");
        mockAppWindow={theme:vi.fn().mockResolvedValue("light"),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
    it("should fall back to matchMedia when Tauri theme query throws",async()=>{
        mockAppWindow={theme:vi.fn().mockRejectedValue(new Error("perm denied")),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        mockMatchMedia.mockReturnValue({matches:true,addEventListener:mockAddEventListener});
        await initializeTheme();
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
    it("should use appWindow.theme() in click handler system branch when appWindow is present",async()=>{
        let clickHandler: any=null;
        mockThemeToggle={addEventListener:(_event: string,handler: any)=>{clickHandler=handler;}};
        mockAppWindow={theme:vi.fn().mockResolvedValue("dark"),setTheme:vi.fn(),onThemeChanged:vi.fn().mockResolvedValue(vi.fn())};
        await initializeTheme();
        mockSettings.theme="light";
        await clickHandler();
        expect(mockSettings.theme).toBe("system");
        expect(mockAppWindow.theme).toHaveBeenCalledTimes(2);
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
    });
});
