import{DomRegistry,dom}from"./DomRegistry";
import{questionState}from"./QuestionState";
import{type CorrectAnswer,type QuestionDto}from"../../types/global";
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
    renderWithCleanup(html: string): void{
        this.clear();
        this.render(html);
    }
    applyQuestionDto(dto: QuestionDto): void{
        let area=this.registry.displays.questionArea;
        if(area){
            area.innerHTML=dto.latex;
        }
        let answer: CorrectAnswer={
            correct: dto.correct,
            alternate: dto.alternate,
            display: dto.display,
            choices: dto.choices
        };
        this.setAnswer(answer);
        if(dto.expectedFormat!==undefined){
            this.setExpectedFormat(dto.expectedFormat);
        }
        this.setHasQuestion(true);
        let mcqContainer=this.registry.displays.mcqChoicesContainer;
        if(mcqContainer){
            mcqContainer.innerHTML="";
            if(dto.choices&&dto.choices.length>0){
                for(let choice of dto.choices){
                    let btn=document.createElement("button");
                    btn.className="mcq-choice";
                    btn.textContent=choice;
                    btn.dataset.value=choice;
                    mcqContainer.appendChild(btn);
                }
                mcqContainer.classList.remove("hidden");
            }
            else{
                mcqContainer.classList.add("hidden");
            }
        }
        if(dto.hint){
            let hintArea=this.registry.displays.previewDiv;
            if(hintArea){
                hintArea.setAttribute("data-hint", dto.hint);
            }
        }
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
    getQuestionArea(): HTMLElement|null{
        return this.registry.displays.questionArea;
    }
    hasContent(): boolean{
        let area=this.registry.displays.questionArea;
        return area!==null&&area.innerHTML.length>0;
    }
    getInnerHtml(): string{
        let area=this.registry.displays.questionArea;
        return area?area.innerHTML:"";
    }
    setQuestionHtml(html: string): void{
        let area=this.registry.displays.questionArea;
        if(area){
            area.innerHTML=html;
        }
    }
    showErrorInQuestionArea(title: string,message: string): void{
        let area=this.registry.displays.questionArea;
        if(area){
            area.innerHTML="<div class=\"error-card\"><h3 class=\"error-title\">"+title+"</h3><p class=\"error-message\">"+message+"</p></div>";
        }
    }
    getExpectedFormat(): string{
        return questionState.expectedFormat;
    }
    getHasQuestion(): boolean{
        return questionState.hasQuestion;
    }
    setQuestionText(text: string): void{
        let area=this.registry.displays.questionArea;
        if(area){
            area.textContent=text;
        }
    }
    clearAndRender(html: string): void{
        this.clear();
        this.render(html);
    }
    getQuestionAreaHeight(): number{
        let area=this.registry.displays.questionArea;
        return area?area.offsetHeight:0;
    }
    async refreshTypeset(): Promise<void>{
        await this.typeset();
    }
    getQuestionAreaElement(): HTMLDivElement|null{
        return this.registry.displays.questionArea;
    }
    isQuestionAreaEmpty(): boolean{
        let area=this.registry.displays.questionArea;
        return area===null||area.innerHTML.length===0;
    }
    setExpectedFormatAndRender(format: string,html: string): void{
        this.setExpectedFormat(format);
        this.render(html);
    }
    setAnswerWithFormat(answer: CorrectAnswer,format: string): void{
        this.setAnswer(answer);
        this.setExpectedFormat(format);
    }
}
export let renderer=new QuestionRenderer(dom);