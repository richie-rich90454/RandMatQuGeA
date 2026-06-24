import{DomRegistry}from"./domRegistry";
import*as questionState from"./questionState";
import{type CorrectAnswer}from"../../types/global.d";
export class QuestionRenderer{
    private registry: DomRegistry;
    constructor(registry: DomRegistry){
        this.registry=registry;
    }
    render(html: string): void{
        let area=this.registry.getQuestionArea();
        if(!area)return;
        area.innerHTML=html;
        this.typeset();
    }
    setExpectedFormat(text: string): void{
        questionState.setExpectedFormat(text);
    }
    typeset(): void{
        if(window.MathJax&&window.MathJax.typesetPromise){
            let area=this.registry.getQuestionArea();
            if(area){
                window.MathJax.typesetPromise([area]).catch((err: any)=>console.log("MathJax typeset error:",err));
            }
        }
    }
    clear(): void{
        let area=this.registry.getQuestionArea();
        if(area){
            area.innerHTML="";
        }
    }
    setAnswer(answer: CorrectAnswer): void{
        questionState.setAnswer(answer);
    }
    setHasQuestion(v: boolean): void{
        questionState.setHasQuestion(v);
    }
}
export let renderer=new QuestionRenderer(new DomRegistry());