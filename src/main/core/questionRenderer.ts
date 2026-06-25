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
    typeset(): void{
        if(window.MathJax&&window.MathJax.typesetPromise){
            let area=this.registry.displays.questionArea;
            if(area){
                window.MathJax.typesetPromise([area]).catch((err: any)=>console.log("MathJax typeset error:",err));
            }
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