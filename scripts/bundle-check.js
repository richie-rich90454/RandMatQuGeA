/**
 * Bundle budget checker — parses dist/index.html, finds the initial entry JS
 * and CSS chunks, calculates gzipped sizes, and fails if any budget is exceeded.
 *
 * Budgets (gzipped):
 *   - Initial JS entry chunk:  BUNDLE_JS_BUDGET_KB   (default 35)
 *   - Initial CSS chunk:       BUNDLE_CSS_BUDGET_KB  (default 10)
 *   - Total initial load:      BUNDLE_TOTAL_BUDGET_KB (default 55)
 *
 * Override via env vars, e.g. BUNDLE_JS_BUDGET_KB=40 node scripts/bundle-check.js
 */
import{readFileSync,existsSync}from"node:fs";
import{gzipSync}from"node:zlib";
import{join,dirname}from"node:path";
import{fileURLToPath}from"node:url";
let __dirname=dirname(fileURLToPath(import.meta.url));
let distDir=join(__dirname,"..","dist");
let indexHtmlPath=join(distDir,"index.html");
let JS_BUDGET=Number(process.env.BUNDLE_JS_BUDGET_KB||35);
let CSS_BUDGET=Number(process.env.BUNDLE_CSS_BUDGET_KB||10);
let TOTAL_BUDGET=Number(process.env.BUNDLE_TOTAL_BUDGET_KB||55);
function gzipKb(buf){
	return gzipSync(buf).length/1024;
}
function extractMainAsset(regex){
	let html=readFileSync(indexHtmlPath,"utf8");
	let match=html.match(regex);
	if(!match||!match[1])return null;
	let assetPath=match[1].replace(/^\.\//,"");
	let fullPath=join(distDir,assetPath);
	if(!existsSync(fullPath))return null;
	return{path:assetPath,fullPath,gzipKb:gzipKb(readFileSync(fullPath))};
}
function main(){
	if(!existsSync(indexHtmlPath)){
		console.error("ERROR: dist/index.html not found. Run 'npm run build:web' first.");
		process.exit(2);
	}
	let htmlGzip=gzipKb(readFileSync(indexHtmlPath));
	let jsAsset=extractMainAsset(/<script[^>]+src="(\.\/index-[^"]+\.js)"/);
	let cssAsset=extractMainAsset(/<link[^>]+href="(\.\/index-[^"]+\.css)"/);
	if(!jsAsset){
		console.error("ERROR: Could not find main JS entry in dist/index.html");
		process.exit(2);
	}
	if(!cssAsset){
		console.error("ERROR: Could not find main CSS link in dist/index.html");
		process.exit(2);
	}
	let totalGzip=htmlGzip+jsAsset.gzipKb+cssAsset.gzipKb;
	let failures=[];
	let pass=(label,actual,budget)=>{
		let ok=actual<=budget;
		let status=ok?"PASS":"FAIL";
		console.log(`  [${status}] ${label}: ${actual.toFixed(2)} kB / ${budget} kB`);
		if(!ok)failures.push(label);
	};
	console.log("\n=== Bundle Budget Check ===\n");
	console.log(`  HTML (index.html):      ${htmlGzip.toFixed(2)} kB gzipped`);
	console.log(`  JS  (${jsAsset.path}):  ${jsAsset.gzipKb.toFixed(2)} kB gzipped`);
	console.log(`  CSS (${cssAsset.path}): ${cssAsset.gzipKb.toFixed(2)} kB gzipped`);
	console.log("");
	pass("Initial JS budget",jsAsset.gzipKb,JS_BUDGET);
	pass("Initial CSS budget",cssAsset.gzipKb,CSS_BUDGET);
	pass("Total initial-load budget",totalGzip,TOTAL_BUDGET);
	console.log("");
	if(failures.length>0){
		console.error(`FAIL: ${failures.length} budget(s) exceeded: ${failures.join(", ")}`);
		process.exit(1);
	}
	console.log("PASS: All bundle budgets satisfied.");
	process.exit(0);
}
main();
