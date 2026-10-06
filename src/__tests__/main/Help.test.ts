/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("../../main/core/DomRegistry",()=>{
    const confidenceRow=document.createElement("div");
    const buttons=["low","medium","high"].map(value=>{
        const button=document.createElement("button");
        button.dataset.confidence=value;
        return button;
    });
    const showHintBtn=document.createElement("button");
    const showSolutionBtn=document.createElement("button");
    const hintPanel=document.createElement("div");
    const dom={
        help:{showHintBtn, showSolutionBtn, hintPanel, confidenceRow, confidenceButtons:buttons},
        displays:{hintPanel},
        inputs:{},
        buttons:{showHintBtn, showSolutionBtn},
        modals:{},
        get appWindow(){return null;}
    };
    return{dom};
});
vi.mock("../../main/core/QuestionState",()=>({
    questionState:{subSkill:undefined, confidence:undefined}
}));
vi.mock("../../main/services/ReviewStore",()=>({
    recordReview:vi.fn(()=>Promise.resolve({topicId:"t",due:0,priority:1,intervalDays:0,reason:"not practiced"})),
}));
import*as help from"../../main/services/Help.js";
import{recordReview}from"../../main/services/ReviewStore";
import*as domRegistry from"../../main/core/DomRegistry";
import{questionState}from"../../main/core/QuestionState";
let dom:any=(domRegistry as unknown as{dom:unknown}).dom;
const LONG_ENOUGH_MS=9000;
describe("help confidence",()=>{
    beforeEach(()=>{
        // The row ships hidden in the markup, and starting it hidden is what makes
        // "was not revealed" a meaningful assertion rather than the absence of one.
        dom.help.confidenceRow.hidden=true;
        dom.help.confidenceRow.classList.add("hidden");
        for (const button of dom.help.confidenceButtons){
            button.classList.remove("selected");
        }
        questionState.confidence=undefined;
    });
    describe("ask",()=>{
        it('reveals the row where adaptive can run',()=>{
            help.ask(true, LONG_ENOUGH_MS, true);
            expect(dom.help.confidenceRow.classList.contains("hidden")).toBe(false);
        });
        it('reveals nothing where it cannot',()=>{
            // Its only reader is the scheduler's overconfidence correction, so
            // elsewhere the question is asked for nothing: the answer would be
            // collected, stored and never looked at.
            help.ask(true, LONG_ENOUGH_MS, false);
            expect(dom.help.confidenceRow.classList.contains("hidden")).toBe(true);
        });
        it('stays out of the way when the answer was too quick to be informative',()=>{
            help.ask(true, 10, true);
            expect(dom.help.confidenceRow.classList.contains("hidden")).toBe(true);
        });
    });
    describe("recordConfidence",()=>{
        it('keeps the value it was given',()=>{
            // The bug this covers: the function set the value and then called the
            // helper that clears it, so the confidence was destroyed inside the same
            // synchronous call and no record could ever have carried it — on any
            // platform, including the desktop where the row is shown.
            help.ask(true, LONG_ENOUGH_MS, true);
            help.recordConfidence("medium", true);
            expect(questionState.confidence).toBe("medium");
        });
        it('hides the row afterwards',()=>{
            help.ask(true, LONG_ENOUGH_MS, true);
            help.recordConfidence("high", true);
            expect(dom.help.confidenceRow.classList.contains("hidden")).toBe(true);
        });
        it('marks the button that was chosen',()=>{
            help.ask(true, LONG_ENOUGH_MS, true);
            help.recordConfidence("low", true);
            const chosen=dom.help.confidenceButtons.filter((b:HTMLElement)=>b.classList.contains("selected"));
            expect(chosen).toHaveLength(1);
            expect(chosen[0].dataset.confidence).toBe("low");
        });
        it('writes nothing where adaptive cannot run',()=>{
            // The row can be revealed and the mode changed before the learner answers,
            // so the click has to be told again rather than trusting what is on screen.
            help.ask(true, LONG_ENOUGH_MS, true);
            help.recordConfidence("low", false);
            expect(questionState.confidence).toBeUndefined();
        });
    });
    describe("deferred review",()=>{
        beforeEach(()=>{
            help.discardPendingReview();
            vi.mocked(recordReview).mockClear();
            questionState.confidence=undefined;
        });
        it('holds the review until confidence is answered',async()=>{
            help.queueReview({topicId:"add",correct:true,responseMs:LONG_ENOUGH_MS},true);
            expect(recordReview).not.toHaveBeenCalled();
            help.ask(true, LONG_ENOUGH_MS, true);
            help.recordConfidence("high", true);
            await new Promise<void>(resolve=>setTimeout(resolve,0));
            expect(recordReview).toHaveBeenCalledTimes(1);
            expect(recordReview).toHaveBeenCalledWith(expect.objectContaining({topicId:"add",correct:true,confidence:"high"}));
        });
        it('writes without confidence when the next question arrives',async()=>{
            help.queueReview({topicId:"add",correct:false,responseMs:LONG_ENOUGH_MS},true);
            help.prepare({latex:"x",correct:"1"});
            await new Promise<void>(resolve=>setTimeout(resolve,0));
            expect(recordReview).toHaveBeenCalledTimes(1);
            expect(vi.mocked(recordReview).mock.calls[0][0].confidence).toBeUndefined();
        });
        it('writes without confidence on a short timeout',async()=>{
            vi.useFakeTimers();
            try{
                help.queueReview({topicId:"add",correct:true,responseMs:LONG_ENOUGH_MS},true);
                expect(recordReview).not.toHaveBeenCalled();
                await vi.advanceTimersByTimeAsync(6000);
                expect(recordReview).toHaveBeenCalledTimes(1);
            }
            finally{
                vi.useRealTimers();
            }
        });
        it('writes exactly once per answer',async()=>{
            help.queueReview({topicId:"add",correct:true,responseMs:LONG_ENOUGH_MS},true);
            help.ask(true, LONG_ENOUGH_MS, true);
            help.recordConfidence("low", true);
            await new Promise<void>(resolve=>setTimeout(resolve,0));
            help.prepare({latex:"x",correct:"1"});
            await new Promise<void>(resolve=>setTimeout(resolve,0));
            expect(recordReview).toHaveBeenCalledTimes(1);
        });
        it('queues nothing where adaptive cannot run',async()=>{
            help.queueReview({topicId:"add",correct:true,responseMs:LONG_ENOUGH_MS},false);
            help.prepare({latex:"x",correct:"1"});
            await new Promise<void>(resolve=>setTimeout(resolve,0));
            expect(recordReview).not.toHaveBeenCalled();
        });
    });
});