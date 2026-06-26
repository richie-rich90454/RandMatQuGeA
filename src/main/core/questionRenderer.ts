import{DomRegistry,dom}from"./domRegistry";
import{questionState}from"./questionState";
import{type CorrectAnswer}from"../../types/global";
export class QuestionRenderer{
    private registry: DomRegistry;
    constructor(registry: DomRegistry){
        this.registry=registry;
    }
    render(html: string): void{
        let area=this.registry.displays.questionArea;
        if(!area)return;
        area.innerHTML=html;
        this.typeset();
    }
    setExpectedFormat(text: string): void{
        questionState.expectedFormat=text;
    }
    async typeset(): Promise<void>{
        if(!window.MathJax||!window.MathJax.typesetPromise)return;
        let area=this.registry.displays.questionArea;
        if(!area)return;
        try{
            if(window.MathJax.startup&&window.MathJax.startup.promise){
                await window.MathJax.startup.promise;
            }
            if(window.MathJax.typesetPromise){
                await window.MathJax.typesetPromise([area]);
            }
        }
        catch(err){
            console.log("MathJax typeset error:",err);
        }
    }
    clear(): void{
        let area=this.registry.displays.questionArea;
        if(area){
            area.innerHTML="";
        }
    }
    setAnswer(answer: CorrectAnswer): void{
        questionState.correctAnswer=answer;
    }
    setHasQuestion(v: boolean): void{
        questionState.hasQuestion=v;
    }
}
export let renderer=new QuestionRenderer(dom);