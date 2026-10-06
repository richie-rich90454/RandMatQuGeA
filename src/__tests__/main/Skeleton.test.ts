/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
const mocks=vi.hoisted(()=>{
    let mockQuestionArea=document.createElement("div");
    mockQuestionArea.id="question-area";
    document.body.appendChild(mockQuestionArea);
    return{mockQuestionArea};
});
vi.mock("../../main/core/DomRegistry",()=>{
    return{
        dom:{
            displays:{
                questionArea:mocks.mockQuestionArea
            }
        }
    };
});
import{showQuestionSkeleton,hideQuestionSkeleton,isSkeletonActive}from"../../main/ui/Skeleton";
describe("skeleton",()=>{
    beforeEach(()=>{
        vi.useFakeTimers();
        vi.clearAllMocks();
        mocks.mockQuestionArea.innerHTML="";
    });
    afterEach(()=>{
        vi.useRealTimers();
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
        expect(isSkeletonActive()).toBe(true);
        vi.advanceTimersByTime(500);
        hideQuestionSkeleton();
        vi.advanceTimersByTime(500);
        expect(isSkeletonActive()).toBe(false);
    });
});