/**
 * Probability questions generator with MCQ distractors
 * @fileoverview Generates various probability questions (basic, conditional, independent, mutually exclusive, Bayes, binomial, expected value, complement, permutation/combination, geometric). Displays question in questionArea and sets window.correctAnswer with correct value, alternate representation, display LaTeX, and plausible wrong answers for MCQ mode.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {getMaxN, nPr, nCr, getOrdinal, factorial} from "./discreteUtils.js";
export function generateProbability(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["basic","conditional","independent","mutually_exclusive","bayes","binomial","expected_value","complement","permutation_combination","geometric"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let plainCorrectAnswer: string;
	let content: string[]=[];
	let scale=getMaxN(difficulty);
	let hint="";
	let choices: string[]=[];
	switch (questionType){
		case "basic":{
			let total=Math.floor(Math.random()*50)+10*scale/8;
			let favorable=Math.floor(Math.random()*(total-1))+1;
			let prob=favorable/total;
			let probStr=prob.toFixed(2);
			content.push(`A bag contains <span class="math">\\(${total}\\)</span> marbles, <span class="math">\\(${favorable}\\)</span> of which are red. What is the probability of drawing a red marble?`);
			plainCorrectAnswer=probStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `${favorable}/${total}`,
				display: `\\frac{${favorable}}{${total}}`
			};
			hint="Enter a decimal or fraction";
			choices=[
				plainCorrectAnswer,
				((favorable+1)/total).toFixed(2),
				((favorable-1)/total).toFixed(2),
				(1-prob).toFixed(2),
				(favorable/total).toFixed(1)
			];
			break;
		}
		case "conditional":{
			let total=Math.floor(Math.random()*100)+50*scale/8;
			let eventA=Math.floor(Math.random()*(total-10))+10;
			let eventB=Math.floor(Math.random()*(eventA-5))+5;
			let prob=eventB/eventA;
			let probStr=prob.toFixed(2);
			content.push(`Given <span class="math">\\(${total}\\)</span> items, <span class="math">\\(${eventA}\\)</span> are type A, and <span class="math">\\(${eventB}\\)</span> of those are also type B. Find the probability of type B given type A.`);
			plainCorrectAnswer=probStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `${eventB}/${eventA}`,
				display: `\\frac{${eventB}}{${eventA}}`
			};
			hint="Enter a decimal or fraction";
			choices=[
				plainCorrectAnswer,
				((eventB+1)/eventA).toFixed(2),
				((eventB-1)/eventA).toFixed(2),
				(eventB/total).toFixed(2),
				(eventA/total).toFixed(2)
			];
			break;
		}
		case "independent":{
			let probA=Math.random()*0.8+0.1;
			let probB=Math.random()*0.8+0.1;
			let probBoth=probA*probB;
			let probAStr=probA.toFixed(2);
			let probBStr=probB.toFixed(2);
			let probBothStr=probBoth.toFixed(2);
			content.push(`The probability of event A is <span class="math">\\(${probAStr}\\)</span>, and event B is <span class="math">\\(${probBStr}\\)</span>. If A and B are independent, find the probability of both occurring.`);
			plainCorrectAnswer=probBothStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `${probAStr} \\times ${probBStr}`,
				display: `${probAStr} \\times ${probBStr}`
			};
			hint="Enter a decimal";
			choices=[
				plainCorrectAnswer,
				(probA+probB).toFixed(2),
				Math.max(probA, probB).toFixed(2),
				Math.min(probA, probB).toFixed(2),
				(probA*probB+0.1).toFixed(2)
			];
			break;
		}
		case "mutually_exclusive":{
			let probA=Math.random()*0.5+0.2;
			let probB=Math.random()*(0.9-probA)+0.1;
			let probEither=probA+probB;
			let probAStr=probA.toFixed(2);
			let probBStr=probB.toFixed(2);
			let probEitherStr=probEither.toFixed(2);
			content.push(`Events A and B are mutually exclusive with <span class="math">\\(P(A)=${probAStr}\\)</span> and <span class="math">\\(P(B)=${probBStr}\\)</span>. Find the probability of A or B occurring.`);
			plainCorrectAnswer=probEitherStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `${probAStr}+${probBStr}`,
				display: `${probAStr} + ${probBStr}`
			};
			hint="Enter a decimal";
			choices=[
				plainCorrectAnswer,
				(probA*probB).toFixed(2),
				Math.max(probA, probB).toFixed(2),
				Math.min(probA, probB).toFixed(2),
				(probA-probB).toFixed(2)
			];
			break;
		}
		case "bayes":{
			let probA=Math.random()*0.5+0.2;
			let probB=Math.random()*0.5+0.2;
			let probBgivenA=Math.random()*0.8+0.1;
			let probAgivenB=(probBgivenA*probA)/probB;
			let probAStr=probA.toFixed(2);
			let probBStr=probB.toFixed(2);
			let probBgivenAStr=probBgivenA.toFixed(2);
			let probAgivenBStr=probAgivenB.toFixed(2);
			content.push(`Given <span class="math">\\(P(A)=${probAStr}\\)</span>, <span class="math">\\(P(B)=${probBStr}\\)</span>, and <span class="math">\\(P(B|A)=${probBgivenAStr}\\)</span>, find <span class="math">\\(P(A|B)\\)</span>.`);
			plainCorrectAnswer=probAgivenBStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `\\frac{${probBgivenAStr} \\cdot ${probAStr}}{${probBStr}}`,
				display: `\\frac{${probBgivenAStr} \\cdot ${probAStr}}{${probBStr}}`
			};
			hint="Enter a decimal";
			choices=[
				plainCorrectAnswer,
				(probBgivenA*probB).toFixed(2),
				(probBgivenA).toFixed(2),
				(probA/probB).toFixed(2),
				(1-probAgivenB).toFixed(2)
			];
			break;
		}
		case "binomial":{
			let n=Math.floor(Math.random()*5)+5;
			let k=Math.floor(Math.random()*(n-1))+1;
			let p=Math.random()*0.7+0.1;
			let q=1-p;
			let prob=nCr(n, k)*Math.pow(p, k)*Math.pow(q, n-k);
			let pStr=p.toFixed(2);
			let qStr=q.toFixed(2);
			let probStr=prob.toFixed(2);
			content.push(`A trial has a success probability of <span class="math">\\(${pStr}\\)</span>. In <span class="math">\\(${n}\\)</span> trials, find the probability of exactly <span class="math">\\(${k}\\)</span> successes.`);
			plainCorrectAnswer=probStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `C(${n},${k}) \\cdot ${pStr}^{${k}} \\cdot ${qStr}^{${n-k}}`,
				display: `\\binom{${n}}{${k}} \\cdot ${pStr}^{${k}} \\cdot ${qStr}^{${n-k}}`
			};
			hint="Enter a decimal";
			let wrong1=nCr(n, k)*Math.pow(p, k)*Math.pow(p, n-k);
			let wrong2=nCr(n, k)*Math.pow(p, n-k)*Math.pow(q, k);
			let wrong3=nCr(n, k)*Math.pow(p, k);
			let wrong4=Math.pow(p, k);
			choices=[
				plainCorrectAnswer,
				wrong1.toFixed(2),
				wrong2.toFixed(2),
				wrong3.toFixed(2),
				wrong4.toFixed(2)
			];
			break;
		}
		case "expected_value":{
			let values=Array.from({length:3},()=>Math.floor(Math.random()*10)+1);
			let rawProbs=Array.from({length:3},()=>Math.random()*0.3+0.1);
			let sum=rawProbs.reduce((a,b)=>a+b,0);
			let probs=rawProbs.map(p=>p/sum);
			let expected=values.reduce((acc,v,i)=>acc+v*probs[i],0);
			let expectedStr=expected.toFixed(2);
			let valsStr=values.join(", ");
			let probsStr=probs.map(p=>p.toFixed(2)).join(", ");
			content.push(`A random variable takes values <span class="math">\\(${valsStr}\\)</span> with probabilities <span class="math">\\(${probsStr}\\)</span>. Find the expected value.`);
			plainCorrectAnswer=expectedStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: plainCorrectAnswer,
				display: plainCorrectAnswer
			};
			hint="Enter a decimal";
			let wrong1=values.reduce((a,b)=>a+b,0)/3;
			let wrong2=values[0]*probs[0]+values[1]*probs[1];
			let wrong3=(values[0]+values[1]+values[2])*probs[0];
			choices=[
				plainCorrectAnswer,
				wrong1.toFixed(2),
				wrong2.toFixed(2),
				wrong3.toFixed(2),
				(1/expected).toFixed(2)
			];
			break;
		}
		case "complement":{
			let probA=Math.random()*0.8+0.1;
			let probNotA=1-probA;
			let probAStr=probA.toFixed(2);
			let probNotAStr=probNotA.toFixed(2);
			content.push(`If <span class="math">\\(P(A)=${probAStr}\\)</span>, find <span class="math">\\(P(\\text{not } A)\\)</span>.`);
			plainCorrectAnswer=probNotAStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `1-${probAStr}`,
				display: `1 - ${probAStr}`
			};
			hint="Enter a decimal";
			choices=[
				plainCorrectAnswer,
				(1-probA+0.1).toFixed(2),
				(1-probA-0.1).toFixed(2),
				probAStr,
				(1+probA).toFixed(2)
			];
			break;
		}
		case "permutation_combination":{
			let n=Math.floor(Math.random()*8)+5;
			let r=Math.floor(Math.random()*(n-1))+1;
			let isPerm=Math.random()<0.5;
			let answer=isPerm?nPr(n, r):nCr(n, r);
			let answerStr=answer.toString();
			let symbol=isPerm?"P":"C";
			let display=isPerm?`P(${n},${r})`:`\\binom{${n}}{${r}}`;
			content.push(`Calculate <div class="math display">\\[${symbol}(${n}, ${r})\\]</div>`);
			plainCorrectAnswer=answerStr;
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `${symbol}(${n},${r})`,
				display: display
			};
			hint="Enter a number";
			let wrong1=isPerm?nCr(n, r):nPr(n, r);
			let wrong2=Math.pow(n, r);
			let wrong3=factorial(n);
			let wrong4=n*r;
			choices=[
				plainCorrectAnswer,
				wrong1.toString(),
				wrong2.toString(),
				wrong3.toString(),
				wrong4.toString()
			];
			break;
		}
		case "geometric":{
			let p=Math.random()*0.7+0.2;
			let k=Math.floor(Math.random()*5)+1;
			let prob=Math.pow(1-p, k-1)*p;
			let pStr=p.toFixed(2);
			let probStr=prob.toFixed(2);
			content.push(`A trial has success probability <span class="math">\\(${pStr}\\)</span>. Find the probability of the first success on the <span class="math">\\(${k}${getOrdinal(k)}\\)</span> trial.`);
			plainCorrectAnswer=probStr;
			let q=(1-p).toFixed(2);
			window.correctAnswer={
				correct: plainCorrectAnswer,
				alternate: `${pStr} \\cdot ${q}^{${k-1}}`,
				display: `${pStr} \\cdot ${q}^{${k-1}}`
			};
			hint="Enter a decimal";
			let wrong1=Math.pow(1-p, k)*p;
			let wrong2=Math.pow(1-p, k-1);
			let wrong3=p;
			let wrong4=Math.pow(p, k);
			choices=[
				plainCorrectAnswer,
				wrong1.toFixed(2),
				wrong2.toFixed(2),
				wrong3.toFixed(2),
				wrong4.toFixed(2)
			];
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectAnswer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
	}
	window.correctAnswer.choices=uniqueChoices;
	let container=document.createElement("div");
	container.innerHTML=content.join("<br>");
	questionArea.appendChild(container);
	window.expectedFormat=hint;
	window.MathJax?.typesetPromise?.([container]).then(()=>{
		if (window.correctAnswer){
			window.correctAnswer.correct=plainCorrectAnswer.replace(/\s+/g, "").toLowerCase();
		}
	});
}