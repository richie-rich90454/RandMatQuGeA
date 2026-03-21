/**
 * Probability questions generator
 * @fileoverview Generates various probability questions (basic, conditional, independent, mutually exclusive, Bayes, binomial, expected value, complement, permutation/combination, geometric). Displays question in questionArea and sets window.correctAnswer with correct value, alternate representation, and display LaTeX.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {getMaxN, nPr, nCr, getOrdinal} from "./discreteUtils.js";
/**
 * Generates a random probability question of a specified type.
 * The question is inserted into questionArea, and the answer is stored in window.correctAnswer with:
 * - correct: normalized numeric answer (string)
 * - alternate: alternative symbolic representation (e.g., fraction, expression)
 * - display: LaTeX representation suitable for showing the answer.
 * @param difficulty - optional difficulty level influencing number ranges.
 */
export function generateProbability(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["basic","conditional","independent","mutually_exclusive","bayes","binomial","expected_value","complement","permutation_combination","geometric"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let plainCorrectAnswer: string;
	let content: string[]=[];
	let scale=getMaxN(difficulty);
	let hint="";
	switch (questionType){
		case "basic":{
			let total=Math.floor(Math.random()*50)+10*scale/8;
			let favorable=Math.floor(Math.random()*(total-1))+1;
			let prob=(favorable/total).toFixed(2);
			content.push(`A bag contains <span class="math">\\(${total}\\)</span> marbles, <span class="math">\\(${favorable}\\)</span> of which are red. What is the probability of drawing a red marble?`);
			plainCorrectAnswer=prob;
			window.correctAnswer={ correct: prob, alternate: `${favorable}/${total}`, display: `\\frac{${favorable}}{${total}}` };
			hint="Enter a decimal or fraction";
			break;
		}
		case "conditional":{
			let total=Math.floor(Math.random()*100)+50*scale/8;
			let eventA=Math.floor(Math.random()*(total-10))+10;
			let eventB=Math.floor(Math.random()*(eventA-5))+5;
			let probB=(eventB/eventA).toFixed(2);
			content.push(`Given <span class="math">\\(${total}\\)</span> items, <span class="math">\\(${eventA}\\)</span> are type A, and <span class="math">\\(${eventB}\\)</span> of those are also type B. Find the probability of type B given type A.`);
			plainCorrectAnswer=probB;
			window.correctAnswer={ correct: probB, alternate: `${eventB}/${eventA}`, display: `\\frac{${eventB}}{${eventA}}` };
			hint="Enter a decimal or fraction";
			break;
		}
		case "independent":{
			let probA=(Math.random()*0.8+0.1).toFixed(2);
			let probB=(Math.random()*0.8+0.1).toFixed(2);
			let probBoth=(parseFloat(probA)*parseFloat(probB)).toFixed(2);
			content.push(`The probability of event A is <span class="math">\\(${probA}\\)</span>, and event B is <span class="math">\\(${probB}\\)</span>. If A and B are independent, find the probability of both occurring.`);
			plainCorrectAnswer=probBoth;
			window.correctAnswer={ correct: probBoth, alternate: `${probA} \\times ${probB}`, display: `${probA} \\times ${probB}` };
			hint="Enter a decimal";
			break;
		}
		case "mutually_exclusive":{
			let probA=(Math.random()*0.5+0.2).toFixed(2);
			let probB=(Math.random()*(0.9-parseFloat(probA))+0.1).toFixed(2);
			let probEither=(parseFloat(probA)+parseFloat(probB)).toFixed(2);
			content.push(`Events A and B are mutually exclusive with <span class="math">\\(P(A)=${probA}\\)</span> and <span class="math">\\(P(B)=${probB}\\)</span>. Find the probability of A or B occurring.`);
			plainCorrectAnswer=probEither;
			window.correctAnswer={ correct: probEither, alternate: `${probA}+${probB}`, display: `${probA} + ${probB}` };
			hint="Enter a decimal";
			break;
		}
		case "bayes":{
			let probA=(Math.random()*0.5+0.2).toFixed(2);
			let probB=(Math.random()*0.5+0.2).toFixed(2);
			let probBgivenA=(Math.random()*0.8+0.1).toFixed(2);
			let probAgivenB=(parseFloat(probBgivenA)*parseFloat(probA)/parseFloat(probB)).toFixed(2);
			content.push(`Given <span class="math">\\(P(A)=${probA}\\)</span>, <span class="math">\\(P(B)=${probB}\\)</span>, and <span class="math">\\(P(B|A)=${probBgivenA}\\)</span>, find <span class="math">\\(P(A|B)\\)</span>.`);
			plainCorrectAnswer=probAgivenB;
			window.correctAnswer={ correct: probAgivenB, alternate: `\\frac{${probBgivenA} \\cdot ${probA}}{${probB}}`, display: `\\frac{${probBgivenA} \\cdot ${probA}}{${probB}}` };
			hint="Enter a decimal";
			break;
		}
		case "binomial":{
			let n=Math.floor(Math.random()*5)+5;
			let k=Math.floor(Math.random()*(n-1))+1;
			let p=(Math.random()*0.7+0.1).toFixed(2);
			let q=(1-parseFloat(p)).toFixed(2);
			let prob=(nCr(n, k)*Math.pow(parseFloat(p), k)*Math.pow(parseFloat(q), n-k)).toFixed(2);
			content.push(`A trial has a success probability of <span class="math">\\(${p}\\)</span>. In <span class="math">\\(${n}\\)</span> trials, find the probability of exactly <span class="math">\\(${k}\\)</span> successes.`);
			plainCorrectAnswer=prob;
			window.correctAnswer={ correct: prob, alternate: `C(${n},${k}) \\cdot ${p}^{${k}} \\cdot ${q}^{${n-k}}`, display: `\\binom{${n}}{${k}} \\cdot ${p}^{${k}} \\cdot ${q}^{${n-k}}` };
			hint="Enter a decimal";
			break;
		}
		case "expected_value":{
			let values=Array.from({ length: 3 }, ()=>Math.floor(Math.random()*10)+1);
			let probs=Array.from({ length: 3 }, ()=>(Math.random()*0.3+0.1).toFixed(2));
			let sumProbs=parseFloat(probs[0])+parseFloat(probs[1])+parseFloat(probs[2]);
			probs=probs.map(p=>(parseFloat(p)/sumProbs).toFixed(2));
			let expected=(values[0]*parseFloat(probs[0])+values[1]*parseFloat(probs[1])+values[2]*parseFloat(probs[2])).toFixed(2);
			content.push(`A random variable takes values <span class="math">\\(${values.join(", ")}\\)</span> with probabilities <span class="math">\\(${probs.join(", ")}\\)</span>. Find the expected value.`);
			plainCorrectAnswer=expected;
			window.correctAnswer={ correct: expected, alternate: expected, display: expected };
			hint="Enter a decimal";
			break;
		}
		case "complement":{
			let probA=(Math.random()*0.8+0.1).toFixed(2);
			let probNotA=(1-parseFloat(probA)).toFixed(2);
			content.push(`If <span class="math">\\(P(A)=${probA}\\)</span>, find <span class="math">\\(P(\\text{not } A)\\)</span>.`);
			plainCorrectAnswer=probNotA;
			window.correctAnswer={ correct: probNotA, alternate: `1-${probA}`, display: `1 - ${probA}` };
			hint="Enter a decimal";
			break;
		}
		case "permutation_combination":{
			let n=Math.floor(Math.random()*8)+5;
			let r=Math.floor(Math.random()*(n-1))+1;
			let isPerm=Math.random()<0.5;
			let answer=isPerm?nPr(n, r):nCr(n, r);
			let symbol=isPerm?"P":"C";
			content.push(`Calculate <div class="math display">\\[${symbol}(${n}, ${r})\\]</div>`);
			plainCorrectAnswer=answer.toString();
			let display=isPerm?`P(${n},${r})`:`\\binom{${n}}{${r}}`;
			window.correctAnswer={ correct: answer.toString(), alternate: `${symbol}(${n},${r})`, display: display };
			hint="Enter a number";
			break;
		}
		case "geometric":{
			let p=(Math.random()*0.7+0.2).toFixed(2);
			let k=Math.floor(Math.random()*5)+1;
			let prob=(Math.pow(1-parseFloat(p), k-1)*parseFloat(p)).toFixed(2);
			content.push(`A trial has success probability <span class="math">\\(${p}\\)</span>. Find the probability of the first success on the <span class="math">\\(${k}${getOrdinal(k)}\\)</span> trial.`);
			plainCorrectAnswer=prob;
			let q=(1-parseFloat(p)).toFixed(2);
			window.correctAnswer={ correct: prob, alternate: `${p} \\cdot ${q}^{${k-1}}`, display: `${p} \\cdot ${q}^{${k-1}}` };
			hint="Enter a decimal";
			break;
		}
	}
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