import {questionArea} from "../../../script.js";
/**
 * Generates a modeling question using logarithmic scales: Richter scale, pH, or decibels.
 * @returns void
 */
export function generateLogarithmicModeling(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["richter","ph","decibel"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";

	const intensity=Math.floor(Math.random()*1000)+100;

	switch (type){
		case "richter":{
			questionArea.innerHTML=`An earthquake has intensity ${intensity} times the reference intensity. Find its magnitude on the Richter scale (M = log(I/I0)).`;
			const mag=Math.log10(intensity);
			window.correctAnswer={
				correct:mag.toFixed(2),
				alternate:mag.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "ph":{
			const hConc=Math.pow(10,-Math.floor(Math.random()*7)-1).toExponential(1);
			questionArea.innerHTML=`A solution has [H+] = ${hConc} M. Find its pH (pH = -log[H+]).`;
			const ph=-Math.log10(parseFloat(hConc));
			window.correctAnswer={
				correct:ph.toFixed(2),
				alternate:ph.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "decibel":{
			const power=Math.floor(Math.random()*1000)+10;
			questionArea.innerHTML=`A sound has intensity ${power} times the threshold. Find the sound level in decibels (dB = 10 log(I/I0)).`;
			const db=10*Math.log10(power);
			window.correctAnswer={
				correct:db.toFixed(2),
				alternate:db.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}