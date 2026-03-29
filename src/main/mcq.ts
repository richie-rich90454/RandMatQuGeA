import * as state from "./state";
import * as settings from "./settings";
import {evaluate} from "mathjs";

export function generateDistractors(correctAnswer: string, count: number): string[]{
    let num: number|null=null;
    try{
        const evaluated=evaluate(correctAnswer);
        if (typeof evaluated==="number"&&!isNaN(evaluated)){
            num=evaluated;
        }
    }catch(e){}
    const distractors=new Set<string>();
    distractors.add(correctAnswer);
    if (num!==null){
        const ops=[
            ()=>num+(Math.random()*20-10),
            ()=>num*(Math.random()*2+0.5),
            ()=>num+(Math.random()>0.5?1:-1),
            ()=>-num,
            ()=>Math.round(num*(Math.random()*0.5+0.75)*100)/100,
            ()=>Math.pow(num,0.5),
            ()=>num+Math.random()*5
        ];
        while(distractors.size<count){
            const op=ops[Math.floor(Math.random()*ops.length)];
            let variant=op();
            variant=Math.round(variant*100)/100;
            const str=variant.toString();
            if (str!==correctAnswer&&!distractors.has(str)&&!isNaN(variant)){
                distractors.add(str);
            }
        }
    }
    else{
        const variations=[
            correctAnswer.toUpperCase(),
            correctAnswer.toLowerCase(),
            correctAnswer.replace(/[0-9]/g,''),
            correctAnswer+'?',
            correctAnswer.replace(/\s/g,'')
        ];
        for (let v of variations){
            if (v!==correctAnswer&&!distractors.has(v)) distractors.add(v);
            if (distractors.size>=count) break;
        }
        while(distractors.size<count){
            distractors.add("??");
        }
    }
    distractors.delete(correctAnswer);
    const all=Array.from(distractors);
    const correctPos=Math.floor(Math.random()*(all.length+1));
    all.splice(correctPos,0,correctAnswer);
    return all.slice(0,count);
}
export function generateChoicesForCurrentQuestion(): void{
    if (!state.mcqMode) return;
    const correct=window.correctAnswer.correct;
    if (!correct) return;
    const count=settings.settings.mcqChoicesCount;
    const choices=generateDistractors(correct,count);
    state.setMcqChoices(choices);
    import("./ui").then(ui=>ui.renderMcqChoices(choices));
}