/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("./core/domRegistry",()=>({
    dom:{
        displays:{
            topicGrid:{
                innerHTML:"",
                scrollTop:0,
                clientHeight:400,
                addEventListener:vi.fn(),
            }
        }
    }
}));
import{initVirtualGrid,refreshVirtualGrid}from"./ui/virtualTopicGrid";
describe("virtualTopicGrid",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
    });
    it("should init with elements",()=>{
        let elements=[
            document.createElement("button"),
            document.createElement("button"),
            document.createElement("button"),
        ];
        initVirtualGrid(elements);
    });
    it("should handle empty elements",()=>{
        initVirtualGrid([]);
    });
    it("should refresh without errors",()=>{
        let elements=[document.createElement("button")];
        initVirtualGrid(elements);
        refreshVirtualGrid();
    });
});