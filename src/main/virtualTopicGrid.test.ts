/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
const mocks=vi.hoisted(()=>{
    let mockTopicGrid={
        innerHTML:"",
        scrollTop:0,
        clientHeight:400,
        addEventListener:vi.fn(),
    };
    return{mockTopicGrid};
});
vi.mock("./core/domRegistry",()=>{
    return{
        dom:{
            displays:{
                topicGrid:mocks.mockTopicGrid
            }
        }
    };
});
import{initVirtualGrid,refreshVirtualGrid}from"./ui/virtualTopicGrid";
describe("virtualTopicGrid",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        mocks.mockTopicGrid.innerHTML="";
    });
    it("should init with elements",()=>{
        let elements=[
            document.createElement("button"),
            document.createElement("button"),
            document.createElement("button"),
        ];
        initVirtualGrid(elements);
        expect(mocks.mockTopicGrid.innerHTML).toBeDefined();
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