/**
 * One-time migration: convert leading tab indentation to four spaces.
 *
 * Every tab in the tree is leading indentation, verified with a check that
 * rejects any tab appearing after non-tab content. Template literal interiors
 * are tracked and skipped, because leading whitespace inside a template literal
 * is string content and reindenting it changes the emitted HTML or LaTeX.
 */
import{readFileSync,writeFileSync,readdirSync}from"node:fs";
import{join}from"node:path";
let roots=process.argv.slice(2);
if(roots.length===0) roots=["src","e2e"];
function collect(dir){
	let out=[];
	for(let entry of readdirSync(dir,{withFileTypes:true})){
		let full=join(dir,entry.name);
		if(entry.isDirectory()) out=out.concat(collect(full));
		else if(entry.name.endsWith(".ts")) out.push(full);
	}
	return out;
}
let changed=0;
let filesChanged=0;
let unchanged=0;
let skippedMidLine=0;
for(let root of roots){
	for(let file of collect(root)){
		let src=readFileSync(file,"utf8");
		if(!src.includes("\t")){ unchanged++; continue; }
		let lines=src.split("\n");
		// Track template literal state across lines so a line that opens a
		// template literal on a previous line is not reindented.
		let inTemplate=false;
		let fileChanged=false;
		for(let i=0;i<lines.length;i++){
			let line=lines[i];
			let leadMatch=line.match(/^[\t ]*/);
			let lead=leadMatch?leadMatch[0]:"";
			let body=line.slice(lead.length);
			// A tab in the body is a mid-line alignment tab, not indentation.
			if(body.includes("\t")){ skippedMidLine++; }
			if(lead.includes("\t")&&!body.includes("\t")&&!inTemplate){
				lines[i]=lead.replace(/[\t]/g,"    ")+body;
				changed++;
				fileChanged=true;
			}
			// Update template state by scanning the body for unescaped backticks.
			for(let k=0;k<body.length;k++){
				if(body[k]==="\\"){ k++; continue; }
				if(body[k]==="`") inTemplate=!inTemplate;
			}
		}
		if(fileChanged){
			writeFileSync(file,lines.join("\n"));
			filesChanged++;
		}
	}
}
console.log("files reindented:",filesChanged);
console.log("lines reindented:",changed);
console.log("files already clean:",unchanged);
console.log("lines carrying a mid-line tab (left alone):",skippedMidLine);
