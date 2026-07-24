import type{CorrectAnswer}from"../../types/global";
export class QuestionState{
	private _correctAnswer: CorrectAnswer;
	private _expectedFormat: string;
	private _hasQuestion: boolean;
	constructor(){
		this._correctAnswer={ correct: "", alternate: "", display: "" };
		this._expectedFormat="";
		this._hasQuestion=false;
		window.correctAnswer=this._correctAnswer;
		window.expectedFormat=this._expectedFormat;
		window.hasQuestion=this._hasQuestion;
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
	reset(): void{
		this._correctAnswer={ correct: "", alternate: "", display: "" };
		this._expectedFormat="";
		this._hasQuestion=false;
		window.correctAnswer=this._correctAnswer;
		window.expectedFormat=this._expectedFormat;
		window.hasQuestion=this._hasQuestion;
	}
}
export const questionState=new QuestionState();
