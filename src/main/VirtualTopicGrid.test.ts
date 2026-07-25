/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
const mocks=vi.hoisted(()=>{
    let mockTopicGrid=document.createElement("div");
    mockTopicGrid.id="topic-grid";
    return{mockTopicGrid};
});
vi.mock("./core/DomRegistry",()=>{
    return{
        dom:{
            displays:{
                topicGrid:mocks.mockTopicGrid
            }
        }
    };
});
import{initVirtualGrid,refreshVirtualGrid}from"./ui/VirtualTopicGrid";
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
        expect(mocks.mockTopicGrid.childNodes.length).toBeGreaterThan(0);
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