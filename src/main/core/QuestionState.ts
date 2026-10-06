import type{CorrectAnswer}from"../../types/global";
import type{Confidence}from"../services/Scheduler";
export class QuestionState{
    private _correctAnswer: CorrectAnswer;
    private _expectedFormat: string;
    private _hasQuestion: boolean;
    private _subSkill: string|undefined;
    private _confidence: Confidence|undefined;
    constructor(){
        this._correctAnswer={ correct: "", alternate: "", display: "" };
        this._expectedFormat="";
        this._hasQuestion=false;
        window.correctAnswer=this._correctAnswer;
        window.expectedFormat=this._expectedFormat;
        window.hasQuestion=this._hasQuestion;
    }
    /**
     * The procedure within the topic that this question practiced, when the
     * generator named one. The scheduler needs it to record the review against
     * the skill rather than against the topic as a whole.
     */
    get subSkill(): string|undefined{
        return this._subSkill;
    }
    set subSkill(value: string|undefined){
        this._subSkill=value;
    }
    /**
     * The confidence the learner reported for the answer just given, which the
     * overconfidence half of the schedule is built from.
     */
    get confidence(): Confidence|undefined{
        return this._confidence;
    }
    set confidence(value: Confidence|undefined){
        this._confidence=value;
    }
    get correctAnswer(): CorrectAnswer{
        return this._correctAnswer;
    }
    set correctAnswer(value: CorrectAnswer){
        this._correctAnswer=value;
        window.correctAnswer=value;
    }
    get expectedFormat(): string{
        return this._expectedFormat;
    }
    set expectedFormat(value: string){
        this._expectedFormat=value;
        window.expectedFormat=value;
    }
    get hasQuestion(): boolean{
        return this._hasQuestion;
    }
    set hasQuestion(value: boolean){
        this._hasQuestion=value;
        window.hasQuestion=value;
    }
    get hasCorrectAnswer(): boolean{
        return this._correctAnswer.correct.length>0;
    }
    get correctAnswerText(): string{
        return this._correctAnswer.correct;
    }
    get displayText(): string{
        return this._correctAnswer.display||this._correctAnswer.correct;
    }
    get alternateText(): string{
        return this._correctAnswer.alternate||"";
    }
    get choices(): string[]{
        return this._correctAnswer.choices||[];
    }
    get hasChoices(): boolean{
        return this._correctAnswer.choices!==undefined&&this._correctAnswer.choices.length>0;
    }
    get choiceCount(): number{
        return this._correctAnswer.choices?this._correctAnswer.choices.length:0;
    }
    getExpectedFormat(): string{
        return this._expectedFormat;
    }
    getHasQuestion(): boolean{
        return this._hasQuestion;
    }
    reset(): void{
        this._correctAnswer={ correct: "", alternate: "", display: "" };
        this._expectedFormat="";
        this._hasQuestion=false;
        this._subSkill=undefined;
        this._confidence=undefined;
        window.correctAnswer=this._correctAnswer;
        window.expectedFormat=this._expectedFormat;
        window.hasQuestion=this._hasQuestion;
    }
}
export const questionState=new QuestionState();
