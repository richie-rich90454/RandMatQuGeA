import type { CorrectAnswer } from "../../types/global.d.ts";
export class QuestionState{
    private _correctAnswer: CorrectAnswer;
    private _expectedFormat: string;
    private _hasQuestion: boolean;
    constructor(){
        this._correctAnswer={ correct: "", alternate: "", display: "" };
        this._expectedFormat="";
        this._hasQuestion=false;
    }
    get correctAnswer(): CorrectAnswer{
        return this._correctAnswer;
    }
    set correctAnswer(value: CorrectAnswer){
        this._correctAnswer=value;
    }
    get expectedFormat(): string{
        return this._expectedFormat;
    }
    set expectedFormat(value: string){
        this._expectedFormat=value;
    }
    get hasQuestion(): boolean{
        return this._hasQuestion;
    }
    set hasQuestion(value: boolean){
        this._hasQuestion=value;
    }
}
export const questionState=new QuestionState();