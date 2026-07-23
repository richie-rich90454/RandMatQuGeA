/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("./core/domRegistry",()=>({
    dom:{
        displays:{
            questionArea:{
                innerHTML:"",
                classList:{
                    add:vi.fn(),
                    remove:vi.fn(),
                }
            }
        }
    }
}));
import{showQuestionSkeleton,hideQuestionSkeleton,isSkeletonActive}from"./ui/skeleton";
describe("skeleton",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
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
        let{dom}=require("./core/domRegistry");
        expect(dom.displays.questionArea.innerHTML).toContain("skeleton-container");
    });
    it("should clear skeleton on hide",()=>{
        showQuestionSkeleton();
        hideQuestionSkeleton();
        expect(isSkeletonActive()).toBe(false);
    });
});