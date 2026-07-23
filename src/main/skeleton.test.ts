/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
let mockQuestionArea: any=null;
vi.mock("./core/domRegistry",()=>{
    mockQuestionArea={
        innerHTML:"",
        classList:{
            add:vi.fn(),
            remove:vi.fn(),
        }
    };
    return{
        dom:{
            displays:{
                questionArea:mockQuestionArea
            }
        }
    };
});
import{showQuestionSkeleton,hideQuestionSkeleton,isSkeletonActive}from"./ui/skeleton";
describe("skeleton",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        mockQuestionArea.innerHTML="";
    });
    it("should start inactive",()=>{
        expect(isSkeletonActive()).toBe(false);
    });
    it("should set skeleton active",()=>{
        showQuestionSkeleton();
        expect(isSkeletonActive()).toBe(true);
    });
    it("should render skeleton HTML",()=>{
        showQuestionSkeleton();
        expect(mockQuestionArea.innerHTML).toContain("skeleton-container");
    });
    it("should clear skeleton on hide",()=>{
        showQuestionSkeleton();
        hideQuestionSkeleton();
        expect(isSkeletonActive()).toBe(false);
    });
});