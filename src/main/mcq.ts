import * as state from "./state";
import * as settings from "./settings";
import {evaluate} from "mathjs";
import * as ui from "./ui";
export function generateDistractors(correctAnswer: string, count: number): string[]{
	let num: number|null=null;
	try{
		const evaluated=evaluate(correctAnswer);
		if (typeof evaluated==="number" && !isNaN(evaluated)){
			num=evaluated;
		}
	} catch(e){}
	if (num!==null){
		return generateNumericDistractors(num, correctAnswer, count);
	}
	const patternDistractors=generatePatternDistractors(correctAnswer, count);
	if (patternDistractors.length>=count){
		return patternDistractors;
	}
	return generateTextFallbackDistractors(correctAnswer, count);
}
function generateNumericDistractors(num: number, original: string, count: number): string[]{
	const distractors=new Set<string>();
	distractors.add(original);
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
		if (str!==original && !distractors.has(str) && !isNaN(variant)){
			distractors.add(str);
		}
	}
	distractors.delete(original);
	const all=Array.from(distractors);
	const correctPos=Math.floor(Math.random()*(all.length+1));
	all.splice(correctPos,0,original);
	return all.slice(0,count);
}
function generatePatternDistractors(answer: string, count: number): string[]{
	const distractors=new Set<string>();
	distractors.add(answer);
	let match=answer.match(/center\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*,\s*radius\s*(-?\d+(?:\.\d+)?)/i);
	if (match){
		let [_, hStr, kStr, rStr]=match;
		let h=parseFloat(hStr);
		let k=parseFloat(kStr);
		let r=parseFloat(rStr);
		const variations=[
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
			const variations=[
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
		const quadrantMatch=answer.match(/^(I|II|III|IV|on an axis)$/i);
		if (quadrantMatch){
			const allQuadrants=["I","II","III","IV","on an axis"];
			for (let q of allQuadrants){
				if (q.toLowerCase()!==answer.toLowerCase() && !distractors.has(q)){
					distractors.add(q);
					if (distractors.size>=count) break;
				}
			}
		}
	}
	distractors.delete(answer);
	const all=Array.from(distractors);
	const correctPos=Math.floor(Math.random()*(all.length+1));
	all.splice(correctPos,0,answer);
	return all.slice(0,count);
}
function generateTextFallbackDistractors(answer: string, count: number): string[]{
	const distractors=new Set<string>();
	distractors.add(answer);
	const variations=[
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
	while(distractors.size<count){
		distractors.add("??");
	}
	distractors.delete(answer);
	const all=Array.from(distractors);
	const correctPos=Math.floor(Math.random()*(all.length+1));
	all.splice(correctPos,0,answer);
	return all.slice(0,count);
}
export function generateChoicesForCurrentQuestion(): void{
	if (!state.mcqMode) return;
	const correctObj=window.correctAnswer;
	if (!correctObj || !correctObj.correct) return;
	const count=settings.settings.mcqChoicesCount;
	let choices: string[];
	if (correctObj.choices && Array.isArray(correctObj.choices) && correctObj.choices.length>=count){
		choices=[...correctObj.choices];
		for (let i=choices.length-1;i>0;i--){
			const j=Math.floor(Math.random()*(i+1));
			[choices[i], choices[j]]=[choices[j], choices[i]];
		}
		if (!choices.includes(correctObj.correct)){
			choices[Math.floor(Math.random()*choices.length)]=correctObj.correct;
		}
		if (choices.length>count) choices=choices.slice(0,count);
		else if (choices.length<count){
			const fallback=generateDistractors(correctObj.correct, count-choices.length);
			choices.push(...fallback);
		}
	}
	else{
		choices=generateDistractors(correctObj.correct, count);
	}
	state.setMcqChoices(choices);
	ui.renderMcqChoices(choices);
}