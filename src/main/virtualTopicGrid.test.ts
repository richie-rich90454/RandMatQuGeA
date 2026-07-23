/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
let mockTopicGrid: any=null;
vi.mock("./core/domRegistry",()=>{
    mockTopicGrid={
        innerHTML:"",
        scrollTop:0,
        clientHeight:400,
        addEventListener:vi.fn(),
    };
    return{
        dom:{
            displays:{
                topicGrid:mockTopicGrid
            }
        }
    };
});
import{initVirtualGrid,refreshVirtualGrid}from"./ui/virtualTopicGrid";
describe("virtualTopicGrid",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        if(mockTopicGrid) mockTopicGrid.innerHTML="";
    });
    it("should init with elements",()=>{
        let elements=[
            document.createElement("button"),
            document.createElement("button"),
            document.createElement("button"),
        ];
        initVirtualGrid(elements);
        expect(mockTopicGrid.innerHTML).toBeDefined();
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