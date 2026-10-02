/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("../../main/Ui.js",()=>({
    showNotification:vi.fn(),
}));
vi.mock("../../main/Session.js",()=>({
    updateLeaderboard:vi.fn(),
}));
vi.mock("@tauri-apps/api/core",()=>({
    invoke:vi.fn(),
}));
vi.mock("@tauri-apps/plugin-dialog",()=>({
    save:vi.fn(),
    open:vi.fn(),
}));
import{invoke}from"@tauri-apps/api/core";
import{save,open}from"@tauri-apps/plugin-dialog";
import{showNotification}from"../../main/Ui.js";
import{openDataModal,initDataModal,exportRecord,importRecord,readRecord}from"../../main/DataManagement.js";
import * as storage from"../../main/services/Storage.js";
declare const process: { on: (e: string, h: Function) => void; off: (e: string, h: Function) => void; };
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
    it("should erase the whole record, not only the aggregate the list shows",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(true);
        await openDataModal();
        const btn=document.getElementById("delete-all-btn") as HTMLButtonElement;
        expect(btn).not.toBeNull();
        if(btn&&btn.onclick){
            await (btn.onclick as unknown as EventListener)(new MouseEvent("click"));
        }
        // The command removes the schedule and every recorded answer alongside the
        // aggregate, because the list a learner is shown is only part of what is
        // kept and an erase that leaves the rest behind is not an erase.
        expect(invoke).toHaveBeenCalledWith("clear_performance");
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

/** A record as the desktop reads it back out of the database. */
function desktopRecord(overrides: Record<string, unknown>={}): Record<string, unknown>{
    return{
        app:"randmatqugea",
        version:1,
        exported_at:1700000000000,
        review:null,
        stats:[],
        attempts:[{
            id:7,
            topic_id:"linear_eq",
            sub_skill:"two_step",
            difficulty:"medium",
            correct:1,
            response_ms:4200,
            confidence:"high",
            error_type:null,
            answered_at:1700000000000
        }],
        skills:[{
            topic_id:"linear_eq",
            sub_skill:"two_step",
            stability:4.5,
            difficulty:6,
            last_review:1700000000000,
            due:1700600000000,
            reviews:3,
            correct_reviews:2,
            aoa:0.25
        }],
        ...overrides
    };
}

/**
 * Answers the commands an import path makes, so a test can assert on the import
 * itself rather than on whatever the rest of the reload happens to ask for.
 *
 * @param summary - What the import command reports it wrote.
 * @returns A mock implementation for the invoke seam.
 */
function answeringImport(summary: Record<string, unknown>): (cmd: string)=>Promise<unknown>{
    return (cmd: string)=>{
        if(cmd==="import_learning_record") return Promise.resolve(summary);
        if(cmd==="get_performance_stats"||cmd==="load_skill_schedule") return Promise.resolve([]);
        return Promise.resolve(undefined);
    };
}

describe("readRecord",()=>{
    beforeEach(()=>{
        vi.mocked(invoke).mockReset();
        vi.mocked(save).mockReset();
        vi.mocked(open).mockReset();
    });
    it("should ask the desktop command for the whole record",async()=>{
        const record=desktopRecord();
        vi.mocked(invoke).mockResolvedValue(record);
        const result=await readRecord();
        expect(invoke).toHaveBeenCalledWith("export_learning_record",{path:null});
        expect(result.attempts).toHaveLength(1);
        expect(result.skills).toHaveLength(1);
    });
    it("should carry a browser's review record and leave the desktop tables empty",async()=>{
        const restoreDesktop=useBrowserBuild();
        try{
            await storage.setPersistenceMode("indexed");
            await storage.write("reviewRecords",{
                version:2,
                records:{"linear_eq":{stability:2.5,difficulty:5,reviews:2,correctReviews:1,aoa:0}}
            });
            const result=await readRecord();
            expect(invoke).not.toHaveBeenCalled();
            expect(result.app).toBe("randmatqugea");
            expect(result.version).toBe(1);
            expect(result.attempts).toEqual([]);
            expect(result.skills).toEqual([]);
            expect(result.review!.records.linear_eq.reviews).toBe(2);
        }
        finally{
            restoreDesktop();
            await storage.clear();
        }
    });
});

describe("exportRecord",()=>{
    beforeEach(()=>{
        vi.mocked(invoke).mockReset();
        vi.mocked(save).mockReset();
        vi.mocked(open).mockReset();
        vi.mocked(showNotification).mockReset();
    });
    it("should write the file the learner chose on the desktop",async()=>{
        vi.mocked(save).mockResolvedValue("C:/chosen/record.json");
        vi.mocked(invoke).mockResolvedValue(desktopRecord());
        await exportRecord();
        expect(save).toHaveBeenCalledWith(expect.objectContaining({defaultPath:"randmatqugea-learning-record.json"}));
        expect(invoke).toHaveBeenCalledWith("export_learning_record",{path:"C:/chosen/record.json"});
        expect(vi.mocked(showNotification).mock.calls[0][0]).toContain("1 recorded answers");
    });
    it("should do nothing on the desktop when the learner cancels the save dialog",async()=>{
        vi.mocked(save).mockResolvedValue(null);
        await exportRecord();
        expect(invoke).not.toHaveBeenCalled();
    });
    it("should report an export the desktop command refused",async()=>{
        const consoleErrSpy=vi.spyOn(console,"error").mockImplementation(()=>{});
        vi.mocked(save).mockResolvedValue("C:/chosen/record.json");
        vi.mocked(invoke).mockRejectedValue(new Error("Could not write C:/chosen/record.json"));
        await exportRecord();
        expect(vi.mocked(showNotification).mock.calls[0][0]).toContain("Could not write");
        expect(vi.mocked(showNotification).mock.calls[0][1]).toBe("warning");
        consoleErrSpy.mockRestore();
    });
});

describe("importRecord on the desktop",()=>{
    beforeEach(()=>{
        vi.mocked(invoke).mockReset();
        vi.mocked(save).mockReset();
        vi.mocked(open).mockReset();
        vi.mocked(showNotification).mockReset();
    });
    it("should hand the chosen file and the chosen mode to the desktop command",async()=>{
        vi.mocked(open).mockResolvedValue("C:/chosen/record.json");
        vi.mocked(invoke).mockImplementation(answeringImport({mode:"replace",attempts:2,skills:3,stats:1,records:0}));
        await importRecord("replace");
        expect(invoke).toHaveBeenCalledWith("import_learning_record",{path:"C:/chosen/record.json",mode:"replace"});
    });
    it("should do nothing when the learner cancels the open dialog",async()=>{
        vi.mocked(open).mockResolvedValue(null);
        await importRecord("merge");
        expect(invoke).not.toHaveBeenCalled();
    });
    it("should report an import the desktop command refused",async()=>{
        const consoleErrSpy=vi.spyOn(console,"error").mockImplementation(()=>{});
        vi.mocked(open).mockResolvedValue("C:/chosen/record.json");
        vi.mocked(invoke).mockRejectedValue(new Error("That file is version 2 and this build reads version 1"));
        await importRecord("merge");
        expect(vi.mocked(showNotification).mock.calls[0][0]).toContain("version 2");
        expect(vi.mocked(showNotification).mock.calls[0][1]).toBe("warning");
        consoleErrSpy.mockRestore();
    });
});

describe("importRecord in a browser",()=>{
    let restoreDesktop:()=>void;
    let stopPicker:()=>void;
    beforeEach(async()=>{
        vi.mocked(invoke).mockReset();
        vi.mocked(save).mockReset();
        vi.mocked(open).mockReset();
        vi.mocked(showNotification).mockReset();
        await storage.setPersistenceMode("indexed");
        await storage.clear();
        restoreDesktop=useBrowserBuild();
        stopPicker=answerFilePickerWith("");
    });
    afterEach(()=>{
        stopPicker();
        restoreDesktop();
    });
    /** A record whose review document the browser can read. */
    function browserPayload(overrides: Record<string, unknown>={}): string{
        return JSON.stringify(desktopRecord({
            review:{
                version:2,
                records:{"linear_eq":{stability:2.5,difficulty:5,reviews:2,correctReviews:1,aoa:0}}
            },
            ...overrides
        }));
    }
    it("should write an imported review record through the storage module",async()=>{
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload());
        await importRecord("replace");
        const stored=await storage.read<{records: {[key: string]: {reviews: number}}}>("reviewRecords");
        expect(stored!.records.linear_eq.reviews).toBe(2);
    });
    it("should never reach the desktop commands",async()=>{
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload());
        await importRecord("replace");
        expect(invoke).not.toHaveBeenCalled();
    });
    it("should keep the skills a merged file does not mention",async()=>{
        await storage.write("reviewRecords",{
            version:2,
            records:{
                "geometry":{stability:1,difficulty:5,reviews:1,correctReviews:0,aoa:0},
                "calculus":{stability:3,difficulty:5,reviews:4,correctReviews:3,aoa:0.1}
            }
        });
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload());
        await importRecord("merge");
        const stored=await storage.read<{records: {[key: string]: {reviews: number}}}>("reviewRecords");
        expect(Object.keys(stored!.records).sort()).toEqual(["calculus","geometry","linear_eq"]);
    });
    it("should make the file the whole record when replacing",async()=>{
        await storage.write("reviewRecords",{
            version:2,
            records:{"geometry":{stability:1,difficulty:5,reviews:1,correctReviews:0,aoa:0}}
        });
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload());
        await importRecord("replace");
        const stored=await storage.read<{records: {[key: string]: unknown}}>("reviewRecords");
        expect(Object.keys(stored!.records)).toEqual(["linear_eq"]);
    });
    it("should refuse a payload that is not JSON and write nothing",async()=>{
        const consoleErrSpy=vi.spyOn(console,"error").mockImplementation(()=>{});
        stopPicker();
        stopPicker=answerFilePickerWith("this is not json at all");
        await importRecord("merge");
        expect(vi.mocked(showNotification).mock.calls[0][0]).toBe("That file is not a learning record.");
        expect(await storage.read("reviewRecords")).toBeUndefined();
        consoleErrSpy.mockRestore();
    });
    it("should refuse a payload from a different application and write nothing",async()=>{
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload({app:"something-else"}));
        await importRecord("merge");
        expect(vi.mocked(showNotification).mock.calls[0][0]).toContain("not a learning record this build can read");
        expect(await storage.read("reviewRecords")).toBeUndefined();
    });
    it("should refuse a payload from a later version and write nothing",async()=>{
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload({version:2}));
        await importRecord("merge");
        expect(vi.mocked(showNotification).mock.calls[0][0]).toContain("expected randmatqugea version 1");
        expect(await storage.read("reviewRecords")).toBeUndefined();
    });
    it("should refuse a payload with no review record and write nothing",async()=>{
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload({review:null}));
        await importRecord("merge");
        expect(vi.mocked(showNotification).mock.calls[0][0]).toContain("carries no review record");
        expect(await storage.read("reviewRecords")).toBeUndefined();
    });
    it("should skip a record whose fields are not numbers",async()=>{
        stopPicker();
        stopPicker=answerFilePickerWith(browserPayload({
            review:{
                version:2,
                records:{
                    "linear_eq":{stability:2.5,difficulty:5,reviews:2,correctReviews:1,aoa:0},
                    "geometry":{stability:"very stable",difficulty:5,reviews:1,correctReviews:1,aoa:0}
                }
            }
        }));
        await importRecord("replace");
        const stored=await storage.read<{records: {[key: string]: unknown}}>("reviewRecords");
        expect(Object.keys(stored!.records)).toEqual(["linear_eq"]);
    });
});

describe("the data modal controls",()=>{
    let exportBtn:HTMLButtonElement;
    let importBtn:HTMLButtonElement;
    let importMode:HTMLSelectElement;
    let modal:HTMLElement;
    let dataList:HTMLElement;
    beforeEach(()=>{
        modal=document.createElement("div");
        modal.id="data-modal";
        dataList=document.createElement("div");
        dataList.id="data-list";
        exportBtn=document.createElement("button");
        exportBtn.id="export-data-btn";
        importBtn=document.createElement("button");
        importBtn.id="import-data-btn";
        importMode=document.createElement("select");
        importMode.id="import-mode";
        importMode.innerHTML='<option value="merge">Merge</option><option value="replace">Replace</option>';
        document.body.appendChild(modal);
        document.body.appendChild(dataList);
        document.body.appendChild(exportBtn);
        document.body.appendChild(importBtn);
        document.body.appendChild(importMode);
        vi.mocked(invoke).mockReset();
        vi.mocked(save).mockReset();
        vi.mocked(open).mockReset();
        vi.mocked(showNotification).mockReset();
        vi.mocked(invoke).mockResolvedValue([]);
    });
    afterEach(()=>{
        modal.remove();
        dataList.remove();
        exportBtn.remove();
        importBtn.remove();
        importMode.remove();
    });
    it("should wire the export control when the modal is opened",async()=>{
        await openDataModal();
        expect(typeof exportBtn.onclick).toBe("function");
    });
    it("should wire the import control when the modal is opened",async()=>{
        await openDataModal();
        expect(typeof importBtn.onclick).toBe("function");
    });
    it("should import in the mode the learner chose",async()=>{
        importMode.value="replace";
        vi.mocked(open).mockResolvedValue("C:/chosen/record.json");
        vi.mocked(invoke).mockImplementation(answeringImport({mode:"replace",attempts:1,skills:1,stats:0,records:0}));
        await openDataModal();
        importBtn.click();
        await new Promise<void>((r)=>setTimeout(r,0));
        expect(invoke).toHaveBeenCalledWith("import_learning_record",{path:"C:/chosen/record.json",mode:"replace"});
    });
    it("should merge by default rather than replace",async()=>{
        vi.mocked(open).mockResolvedValue("C:/chosen/record.json");
        vi.mocked(invoke).mockImplementation(answeringImport({mode:"merge",attempts:1,skills:1,stats:0,records:0}));
        await openDataModal();
        importBtn.click();
        await new Promise<void>((r)=>setTimeout(r,0));
        expect(invoke).toHaveBeenCalledWith("import_learning_record",{path:"C:/chosen/record.json",mode:"merge"});
    });
    it("should show a browser its own review record rather than refusing to open",async()=>{
        let restoreDesktop=useBrowserBuild();
        try{
            await storage.setPersistenceMode("indexed");
            await storage.write("reviewRecords",{
                version:2,
                records:{"linear_eq/two_step":{stability:2.5,difficulty:5,reviews:4,correctReviews:3,aoa:0}}
            });
            await openDataModal();
            expect(dataList.innerHTML).toContain("Linear Equations");
            expect(dataList.innerHTML).toContain("75.0%");
            expect(dataList.innerHTML).toContain("two_step");
        }
        finally{
            restoreDesktop();
            await storage.clear();
        }
    });
    it("should wire a delete button without searching the document for it",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"add",difficulty:"easy",accuracy:0.8,attempts:5,avg_time_ms:1200}]);
        const confirmSpy=vi.spyOn(window,"confirm").mockReturnValue(false);
        const queryAllSpy=vi.spyOn(document,"querySelectorAll");
        await openDataModal();
        const deleteBtn=dataList.querySelector(".delete-record")as HTMLElement;
        expect(deleteBtn).not.toBeNull();
        deleteBtn.click();
        expect(confirmSpy).toHaveBeenCalledWith("Delete all records for add (easy)?");
        expect(queryAllSpy).not.toHaveBeenCalled();
        queryAllSpy.mockRestore();
        confirmSpy.mockRestore();
    });
});

/**
 * Makes this build look like a browser for the duration of a test, which is what
 * selects the storage path rather than the desktop commands. The global is what
 * the environment check reads, so removing it is the seam.
 *
 * @returns A function that puts the desktop environment back.
 */
function useBrowserBuild(): ()=>void{
    let saved=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
    delete (globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
    return ()=>{
        (globalThis as Record<string, unknown>).__TAURI_INTERNALS__=saved;
    };
}

/**
 * Answers the file picker the browser path opens, with a file holding the given
 * text. A picker cannot be driven from a test, so the click it makes is turned
 * into the change event a real one would eventually fire.
 *
 * @param text - What the chosen file contains.
 * @returns A function that stops answering the picker.
 */
function answerFilePickerWith(text: string): ()=>void{
    let file=new File([text],"record.json",{type:"application/json"});
    let createSpy=vi.spyOn(document,"createElement").mockImplementation(((tag: string)=>{
        let el=document.createElementNS("http://www.w3.org/1999/xhtml",tag) as HTMLElement;
        if(tag==="input"){
            let input=el as HTMLInputElement;
            input.type="file";
            Object.defineProperty(input,"files",{value:[file],configurable:true});
        }
        return el;
    }) as unknown as typeof document.createElement);
    let clickSpy=vi.spyOn(HTMLInputElement.prototype,"click").mockImplementation(function(this: HTMLInputElement){
        this.dispatchEvent(new Event("change"));
    });
    return ()=>{
        clickSpy.mockRestore();
        createSpy.mockRestore();
    };
}
