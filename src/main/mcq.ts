import {appState} from "./core/stateStore";
import {questionState} from "./core/questionState";
import {dom} from "./core/domRegistry";
import * as settings from "./settings";
import * as ui from "./ui";
import type { RngFn } from "../types/global";
let mathjsModule: any=null;
async function ensureMathjs(): Promise<any>{
    if(mathjsModule) return mathjsModule;
    mathjsModule=await import("mathjs");
    return mathjsModule;
}
export async function generateDistractors(correctAnswer: string, count: number, rng?: RngFn): Promise<string[]>{
    let r: RngFn = rng ?? Math.random;
    let num: number|null=null;
    try{
        let evaluated=(await ensureMathjs()).evaluate(correctAnswer);
        if (typeof evaluated==="number" && !isNaN(evaluated)){
            num=evaluated;
        }
    } catch(e){}
    if (num!==null){
        return generateNumericDistractors(num, correctAnswer, count, r);
    }
    let patternDistractors=generatePatternDistractors(correctAnswer, count, r);
    if (patternDistractors.length>=count){
        return patternDistractors;
    }
    return generateTextFallbackDistractors(correctAnswer, count, r);
}
function generateNumericDistractors(num: number, original: string, count: number, rng: RngFn): string[]{
    let distractors=new Set<string>();
    distractors.add(original);
    let ops=[
        ()=>num+(rng()*20-10),
        ()=>num*(rng()*2+0.5),
        ()=>num+(rng()>0.5?1:-1),
        ()=>-num,
        ()=>Math.round(num*(rng()*0.5+0.75)*100)/100,
        ()=>num>=0?Math.pow(num,0.5):num+rng()*5,
        ()=>num+rng()*5
    ];
    while(distractors.size<count){
        let op=ops[Math.floor(rng()*ops.length)];
        let variant=op();
        variant=Math.round(variant*100)/100;
        let str=variant.toString();
        if (str!==original && !distractors.has(str) && !isNaN(variant)){
            distractors.add(str);
        }
    }
    distractors.delete(original);
    let all=Array.from(distractors);
    let correctPos=Math.floor(rng()*(all.length+1));
    all.splice(correctPos,0,original);
    let result=all.slice(0,count);
    if (!result.includes(original)){
        result[result.length-1]=original;
    }
    return result;
}
function generatePatternDistractors(answer: string, count: number, rng: RngFn): string[]{
    let distractors=new Set<string>();
    distractors.add(answer);
    let match=answer.match(/center\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*,\s*radius\s*(-?\d+(?:\.\d+)?)/i);
    if (match){
        let [_, hStr, kStr, rStr]=match;
        let h=parseFloat(hStr);
        let k=parseFloat(kStr);
        let r=parseFloat(rStr);
            let variations=[
            `center (${h+1}, ${k}), radius ${r}`,
            `center (${h-1}, ${k}), radius ${r}`,
            `center (${h}, ${k+1}), radius ${r}`,
            `center (${h}, ${k-1}), radius ${r}`,
            `center (${h}, ${k}), radius ${r+1}`,
            `center (${h}, ${k}), radius ${r-1}`,
            `center (${h+1}, ${k+1}), radius ${r}`,
            `center (${h-1}, ${k-1}), radius ${r}`,
            `center (${h+0.5}, ${k}), radius ${r}`,
        ];
        for (let v of variations){
            if (v!==answer && !distractors.has(v)) distractors.add(v);
            if (distractors.size>=count) break;
        }
    }
    if (distractors.size<count){
        match=answer.match(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\)/);
        if (match){
            let x=parseFloat(match[1]);
            let y=parseFloat(match[2]);
        let variations=[
                `(${x+1}, ${y})`,
                `(${x-1}, ${y})`,
                `(${x}, ${y+1})`,
                `(${x}, ${y-1})`,
                `(${x+0.5}, ${y})`,
                `(${x}, ${y+0.5})`,
                `(${x+1}, ${y+1})`,
                `(${x-1}, ${y-1})`,
            ];
            for (let v of variations){
                if (v!==answer && !distractors.has(v)) distractors.add(v);
                if (distractors.size>=count) break;
            }
        }
    }
    if (distractors.size<count){
        let quadrantMatch=answer.match(/^(I|II|III|IV|on an axis)$/i);
        if (quadrantMatch){
            let allQuadrants=["I","II","III","IV","on an axis"];
            for (let q of allQuadrants){
                if (q.toLowerCase()!==answer.toLowerCase() && !distractors.has(q)){
                    distractors.add(q);
                    if (distractors.size>=count) break;
                }
            }
        }
    }
    distractors.delete(answer);
    let all=Array.from(distractors);
    let correctPos=Math.floor(rng()*(all.length+1));
    all.splice(correctPos,0,answer);
    return all.slice(0,count);
}
function generateTextFallbackDistractors(answer: string, count: number, rng: RngFn): string[]{
    let distractors=new Set<string>();
    distractors.add(answer);
    let variations=[
        answer.toUpperCase(),
        answer.toLowerCase(),
        answer.replace(/[0-9]/g,''),
        answer+'?',
        answer.replace(/\s/g,'')
    ];
    for (let v of variations){
        if (v!==answer && !distractors.has(v)) distractors.add(v);
        if (distractors.size>=count) break;
    }
    let fillerIdx=0;
    while(distractors.size<count){
        let filler=fillerIdx===0?"??":`?${fillerIdx}`;
        if (filler!==answer && !distractors.has(filler)){
            distractors.add(filler);
        }
        fillerIdx++;
        if (fillerIdx>count+10) break;
    }
    distractors.delete(answer);
    let all=Array.from(distractors);
    let correctPos=Math.floor(rng()*(all.length+1));
    all.splice(correctPos,0,answer);
    let result=all.slice(0,count);
    if (!result.includes(answer)){
        result[result.length-1]=answer;
    }
    return result;
}
export async function generateChoicesForCurrentQuestion(rng?: RngFn): Promise<void>{
    if (!appState.mcqMode) return;
    let r: RngFn = rng ?? Math.random;
    let correctObj=questionState.correctAnswer;
    if (!correctObj || !correctObj.correct){
        if (dom.displays.mcqChoicesContainer){
            dom.displays.mcqChoicesContainer.innerHTML='<div class="empty-state"><p>No correct answer available — try another topic.</p></div>';
        }
        return;
    }
    let count=settings.settings.mcqChoicesCount;
    let choices: string[];
    if (correctObj.choices && Array.isArray(correctObj.choices) && correctObj.choices.length>=count){
        choices=[...correctObj.choices];
        for (let i=choices.length-1;i>0;i--){
            let j=Math.floor(r()*(i+1));
            [choices[i], choices[j]]=[choices[j], choices[i]];
        }
        if (!choices.includes(correctObj.correct)){
            choices[Math.floor(r()*choices.length)]=correctObj.correct;
        }
        if (choices.length>count){
            choices=choices.slice(0,count);
            if (!choices.includes(correctObj.correct)){
                choices[Math.floor(r()*choices.length)]=correctObj.correct;
            }
        }
    }
    else{
        choices=await generateDistractors(correctObj.correct, count, r);
    }
    appState.mcqChoices=choices;
    ui.renderMcqChoices(choices);
}
