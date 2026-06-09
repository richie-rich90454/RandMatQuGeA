/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("./ui.js",()=>({
    showNotification:vi.fn(),
}));
vi.mock("./session.js",()=>({
    updateLeaderboard:vi.fn(),
}));
vi.mock("@tauri-apps/api/core",()=>({
    invoke:vi.fn(),
}));
import{invoke}from"@tauri-apps/api/core";
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
describe("openDataModal",()=>{
    let modal:HTMLElement;
    let dataList:HTMLElement;
    beforeEach(()=>{
        modal=document.createElement("div");
        modal.id="data-modal";
        dataList=document.createElement("div");
        dataList.id="data-list";
        document.body.appendChild(modal);
        document.body.appendChild(dataList);
        vi.mocked(invoke).mockReset();
    });
    afterEach(()=>{
        modal.remove();
        dataList.remove();
    });
    it("should be a function",()=>{
        expect(typeof openDataModal).toBe("function");
    });
    it("should not throw when called",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        await expect(openDataModal()).resolves.toBeUndefined();
    });
    it("should invoke load_scores command",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        await openDataModal();
        expect(invoke).toHaveBeenCalledWith("get_performance_stats",{difficulty:null,days:null});
    });
    it("should display scores in table",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        await openDataModal();
        expect(dataList.innerHTML).toContain("algebra");
        expect(dataList.innerHTML).toContain("easy");
        expect(dataList.innerHTML).toContain("80.0%");
    });
    it("should handle empty scores",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        await openDataModal();
        expect(dataList.innerHTML).toContain("No performance data yet");
    });
    it("should handle null scores",async()=>{
        vi.mocked(invoke).mockResolvedValue(null);
        await openDataModal();
        expect(dataList.innerHTML).toContain("No performance data yet");
    });
});
describe("initDataModal",()=>{
    let modal:HTMLElement;
    let dataList:HTMLElement;
    let closeBtn:HTMLElement;
    let refreshBtn:HTMLElement;
    let deleteAllBtn:HTMLElement;
    let resetAllBtn:HTMLElement;
    beforeEach(()=>{
        modal=document.createElement("div");
        modal.id="data-modal";
        dataList=document.createElement("div");
        dataList.id="data-list";
        closeBtn=document.createElement("button");
        closeBtn.id="data-close";
        refreshBtn=document.createElement("button");
        refreshBtn.id="data-refresh";
        deleteAllBtn=document.createElement("button");
        deleteAllBtn.id="delete-all-btn";
        resetAllBtn=document.createElement("button");
        resetAllBtn.id="reset-all-btn";
        document.body.appendChild(modal);
        document.body.appendChild(dataList);
        document.body.appendChild(closeBtn);
        document.body.appendChild(refreshBtn);
        document.body.appendChild(deleteAllBtn);
        document.body.appendChild(resetAllBtn);
        vi.mocked(invoke).mockReset();
    });
    afterEach(()=>{
        modal.remove();
        dataList.remove();
        closeBtn.remove();
        refreshBtn.remove();
        deleteAllBtn.remove();
        resetAllBtn.remove();
    });
    it("should be a function",()=>{
        expect(typeof initDataModal).toBe("function");
    });
    it("should not throw when called",()=>{
        expect(()=>initDataModal()).not.toThrow();
    });
    it("should attach click listener to delete button",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        await openDataModal();
        const btn=document.getElementById("delete-all-btn")as HTMLButtonElement;
        expect(btn).not.toBeNull();
        expect(btn.onclick!==null).toBe(true);
        expect(typeof btn.onclick).toBe("function");
    });
    it("should attach click listener to close button",()=>{
        initDataModal();
        expect(closeBtn.onclick).not.toBeNull();
    });
    it("should attach click listener to reset button",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        await openDataModal();
        const btn=document.getElementById("reset-all-btn")as HTMLButtonElement;
        expect(btn).not.toBeNull();
        expect(btn.onclick!==null).toBe(true);
        expect(typeof btn.onclick).toBe("function");
    });
    it("should confirm before delete all",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(false);
        await openDataModal();
        const btn=document.getElementById("delete-all-btn")as HTMLButtonElement;
        expect(btn).not.toBeNull();
        if(btn&&btn.onclick){
            (btn.onclick as unknown as EventListener)(new MouseEvent("click"));
        }
        expect(confirmSpy).toHaveBeenCalledWith("Delete ALL performance data? This cannot be undone.");
        confirmSpy.mockRestore();
    });
    it("should confirm before reset all",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(false);
        await openDataModal();
        const btn=document.getElementById("reset-all-btn")as HTMLButtonElement;
        expect(btn).not.toBeNull();
        if(btn&&btn.onclick){
            (btn.onclick as unknown as EventListener)(new MouseEvent("click"));
        }
        expect(confirmSpy).toHaveBeenCalledWith("HARD RESET: This will delete ALL scores and performance data. This cannot be undone. Are you sure?");
        confirmSpy.mockRestore();
    });
    it("should invoke delete_score command",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(true);
        await openDataModal();
        const btn=document.getElementById("delete-all-btn")as HTMLButtonElement;
        expect(btn).not.toBeNull();
        if(btn&&btn.onclick){
            await (btn.onclick as unknown as EventListener)(new MouseEvent("click"));
        }
        expect(invoke).toHaveBeenCalledWith("delete_performance_record",{topicId:"add",difficulty:"easy"});
        confirmSpy.mockRestore();
    });
    it("should invoke reset_all_data command",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(true);
        await openDataModal();
        const btn=document.getElementById("reset-all-btn")as HTMLButtonElement;
        expect(btn).not.toBeNull();
        if(btn&&btn.onclick){
            await (btn.onclick as unknown as EventListener)(new MouseEvent("click"));
        }
        expect(invoke).toHaveBeenCalledWith("reset_all_data");
        confirmSpy.mockRestore();
    });
});
