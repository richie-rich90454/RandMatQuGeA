/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
const mocks=vi.hoisted(()=>{
    let mockQuestionArea={
        innerHTML:"",
        classList:{
            add:vi.fn(),
            remove:vi.fn(),
        }
    };
    return{mockQuestionArea};
});
vi.mock("./core/domRegistry",()=>{
    return{
        dom:{
            displays:{
                questionArea:mocks.mockQuestionArea
            }
        }
    };
});
import{showQuestionSkeleton,hideQuestionSkeleton,isSkeletonActive}from"./ui/skeleton";
describe("skeleton",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        mocks.mockQuestionArea.innerHTML="";
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
        expect(mocks.mockQuestionArea.innerHTML).toContain("skeleton-container");
    });
    it("should clear skeleton on hide",()=>{
        showQuestionSkeleton();
        hideQuestionSkeleton();
        expect(isSkeletonActive()).toBe(false);
    });
});