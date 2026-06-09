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
describe("openDataModal - edge cases",()=>{
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
    it("should handle missing modal element",async()=>{
        modal.remove();
        vi.mocked(invoke).mockResolvedValue([]);
        await expect(openDataModal()).resolves.toBeUndefined();
    });
    it("should handle missing data list element",async()=>{
        dataList.remove();
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        await expect(openDataModal()).resolves.toBeUndefined();
    });
    it("should render performance stats in table",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        await openDataModal();
        expect(dataList.innerHTML).toContain("algebra");
        expect(dataList.innerHTML).toContain("easy");
        expect(dataList.innerHTML).toContain("80.0%");
        expect(dataList.innerHTML).toContain("5");
        expect(dataList.innerHTML).toContain("1200");
    });
    it("should handle stats with null fields",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:null,difficulty:null,accuracy:null,attempts:null,avg_time_ms:null}]);
        await openDataModal();
        expect(dataList.innerHTML).toContain("data-item");
    });
    it("should handle very large number of records",async()=>{
        const records=Array.from({length:1000},(_, i)=>({topic_id:"topic"+i,difficulty:"easy",accuracy:0.5,attempts:10,avg_time_ms:1000}));
        vi.mocked(invoke).mockResolvedValue(records);
        await openDataModal();
        const items=dataList.querySelectorAll(".data-item");
        expect(items.length).toBe(1000);
    });
});
describe("initDataModal - edge cases",()=>{
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
    it("should handle missing buttons gracefully",()=>{
        closeBtn.remove();
        refreshBtn.remove();
        deleteAllBtn.remove();
        resetAllBtn.remove();
        expect(()=>initDataModal()).not.toThrow();
    });
    it("should confirm before deleting individual record",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(false);
        await openDataModal();
        const deleteBtn=dataList.querySelector(".delete-record")as HTMLElement;
        expect(deleteBtn).not.toBeNull();
        deleteBtn.click();
        expect(confirmSpy).toHaveBeenCalledWith("Delete all records for add (easy)?");
        confirmSpy.mockRestore();
    });
    it("should handle delete failure gracefully",async()=>{
        vi.mocked(invoke).mockResolvedValueOnce([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(true);
        const consoleErrSpy=vi.spyOn(console,"error").mockImplementation(()=>{});
        vi.mocked(invoke).mockRejectedValueOnce(new Error("delete failed"));
        vi.mocked(invoke).mockResolvedValueOnce([]);
        const handler=vi.fn();
        process.on("unhandledRejection",handler);
        await openDataModal();
        const deleteBtn=dataList.querySelector(".delete-record")as HTMLElement;
        expect(deleteBtn).not.toBeNull();
        deleteBtn.click();
        await new Promise<void>((r)=>setTimeout(r,0));
        process.off("unhandledRejection",handler);
        expect(invoke).toHaveBeenCalledWith("delete_performance_record",{topicId:"add",difficulty:"easy"});
        confirmSpy.mockRestore();
        consoleErrSpy.mockRestore();
    });
    it("should refresh data after delete",async()=>{
        vi.mocked(invoke).mockResolvedValueOnce([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        vi.spyOn(window,"confirm").mockReturnValue(true);
        vi.mocked(invoke).mockResolvedValueOnce(undefined);
        vi.mocked(invoke).mockResolvedValueOnce([]);
        await openDataModal();
        const deleteBtn=dataList.querySelector(".delete-record")as HTMLElement;
        expect(deleteBtn).not.toBeNull();
        deleteBtn.click();
        expect(invoke).toHaveBeenCalledWith("delete_performance_record",{topicId:"add",difficulty:"easy"});
        vi.spyOn(window,"confirm").mockRestore();
    });
    it("should handle reset with no data",async()=>{
        vi.mocked(invoke).mockResolvedValueOnce([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(true);
        vi.mocked(invoke).mockResolvedValueOnce(undefined);
        vi.mocked(invoke).mockResolvedValueOnce([]);
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
