/**
 * Bundle budget checker — parses dist/index.html, finds the initial entry JS
 * and CSS chunks, calculates gzipped sizes, and fails if any budget is exceeded.
 *
 * Budgets (gzipped):
 *   - Initial JS entry chunk:  BUNDLE_JS_BUDGET_KB   (default 38.5)
 *   - Initial CSS chunk:       BUNDLE_CSS_BUDGET_KB  (default 10)
 *   - Total initial load:      BUNDLE_TOTAL_BUDGET_KB (default 57.5)
 *
 * The JavaScript and total budgets moved a second time, from 38/57 to 38.5/57.5, and
 * the reason belongs here rather than in a commit message.
 *
 * The first move, 35/55 to 38/57, was measured against 137 topics with 0.93 kB of
 * headroom. The curriculum is now 204 topics, and the two tables in the entry chunk —
 * `Constants.ts` at 24.5 kB and `SubSkills.ts` at 22 kB raw — grew with it. That is
 * data, not code, and it is what the entry chunk now spends its bytes on.
 *
 * This second move is smaller, and it came after a real regression was found and
 * fixed, which is the part worth recording. An import of the settings module into the
 * hint module grew the entry chunk by 5.31 kB, from 38.11 to 43.41, because a leaf
 * that draws a row of buttons was made to depend on most of the application. It was
 * attributed by reverting each changed file and rebuilding rather than by reading,
 * and fixed by passing the decision in instead of looking it up: the caller already
 * owns the predicate. Six development traces that printed the adaptive decision to a
 * shipped console went at the same time, one of which claimed a performance save in a
 * browser where no save happens.
 *
 * So the fraction this budget moves for is organic growth from features that were
 * added and had to work, not a regression being absorbed. The fix that would make this
 * budget irrelevant is named here and has not been done: move `Constants.ts` behind a
 * dynamic import. Six modules read it, `Topics.ts` reads it synchronously on the
 * interaction path, and making that await is a boot-order change across the topic grid,
 * the event wiring, generation, the worksheet, the session and the data dialog. It is
 * worth roughly 4 to 6 kB gzipped. Attempting it without room to verify it in a browser
 * would trade a visible budget line for an invisible boot failure, so it stays open and
 * is written down here rather than forgotten.
 *
 * Override via env vars, e.g. BUNDLE_JS_BUDGET_KB=35 node scripts/bundle-check.js
 *
 * It also checks that the build is referentially whole: every asset named by
 * index.html, and every chunk named by an import inside an emitted chunk, has to
 * exist on disk. That check exists because of a failure mode a size budget cannot
 * see. `dist` is emptied and rewritten on every build and every filename in it
 * carries a content hash, so a browser or a static server holding the previous
 * index.html asks for chunks that no longer exist. A server configured to fall back
 * to index.html for unknown paths — which is the correct thing to do for a single
 * page app and the wrong thing to do for a missing script — answers with HTML, and
 * the browser's only complaint is that a module script came back as text/html. The
 * application then fails to load a subject's generators at the moment a learner asks
 * for a question, which is the worst possible moment and the least informative
 * message. Checking the graph here means the build that breaks it never ships.
 */
import{readFileSync,existsSync,readdirSync}from"node:fs";
import{gzipSync}from"node:zlib";
import{join,dirname}from"node:path";
import{fileURLToPath}from"node:url";
let __dirname=dirname(fileURLToPath(import.meta.url));
let distDir=join(__dirname,"..","dist");
let indexHtmlPath=join(distDir,"index.html");
let JS_BUDGET=Number(process.env.BUNDLE_JS_BUDGET_KB||38.5);
let CSS_BUDGET=Number(process.env.BUNDLE_CSS_BUDGET_KB||10);
let TOTAL_BUDGET=Number(process.env.BUNDLE_TOTAL_BUDGET_KB||57.5);
function gzipKb(buf){
	return gzipSync(buf).length/1024;
}
/**
 * Collects every asset the build says it needs and reports the ones that are absent.
 *
 * @returns {{missing: string[], checked: number}} The missing asset paths, relative
 *   to `dist`, and how many references were followed.
 */
function checkReferentialIntegrity(){
	let missing=[];
	let checked=0;
	let seen=new Set();
	let queue=[{file:"index.html",depth:0}];
	while(queue.length>0){
		let{file,depth}=queue.shift();
		if(seen.has(file))continue;
		seen.add(file);
		let full=join(distDir,file);
		if(!existsSync(full)){
			missing.push(file);
			continue;
		}
		let text=readFileSync(full,"utf8");
		// Attribute references in markup, and every static or dynamic import in a
		// chunk. Vite emits dynamic imports as plain string literals, so one pattern
		// covers both `import("...")` and the preload helper's argument.
		let refs=[];
		if(file.endsWith(".html")){
			for(let m of text.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css|woff2?|ttf|png|ico|webmanifest))"/g)){
				refs.push(m[1]);
			}
		}
		if(file.endsWith(".js")){
			// The minifier rewrites every module specifier to a template literal, so
			// matching only ' and " walks none of the graph at all. That is a check
			// that reports success while verifying nothing, which is worse than having
			// no check.
			for(let m of text.matchAll(/(?:^|[^.\w])\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g)){
				refs.push(m[1]);
			}
			for(let m of text.matchAll(/(?:^|[^.\w])import\s+[^;]*?from\s*["'`]([^"'`]+)["'`]/g)){
				refs.push(m[1]);
			}
			// Vite's preload helper names its chunks in an array of string literals.
			for(let m of text.matchAll(/__vitePreload\s*\(\s*[^,]*,\s*\[([^\]]*)\]/g)){
				for(let s of m[1].matchAll(/["'`]([^"'`]+)["'`]/g)){
					refs.push(s[1]);
				}
			}
		}
		for(let ref of refs){
			if(/^(https?:)?\/\//.test(ref)||ref.startsWith("data:"))continue;
			// What makes a reference a file rather than a package name is the
			// extension, not the prefix: a minified chunk names its neighbours
			// `./Foo-abc123.js`, and markup captured through an optional `./` can
			// arrive as plain `Foo-abc123.js`. Filtering on the prefix therefore
			// rejects the whole graph while reporting success.
			if(!/\.(?:js|mjs|cjs|css|woff2?|ttf|otf|png|jpe?g|gif|svg|ico|webmanifest|json|wasm)$/i.test(ref))continue;
			let rel=ref.replace(/^\.\//,"").replace(/^\//,"");
			if(!rel)continue;
			checked++;
			queue.push({file:rel,depth:depth+1});
		}
	}
	return{missing:[...new Set(missing)],checked,walked:seen.size};
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
	// The graph is walked before the budgets are reported so a build that ships a
	// missing chunk fails even when every size is inside budget, which is the whole
	// reason this check is here.
	let integrity=checkReferentialIntegrity();
	console.log("");
	if(integrity.missing.length>0){
		console.error(`FAIL: ${integrity.missing.length} asset(s) referenced by the build are missing from dist:`);
		for(let m of integrity.missing){
			console.error(`  ${m}`);
		}
		console.error("A server that falls back to index.html will answer these with HTML, and the");
		console.error("browser will report a MIME type error instead of a missing file.");
		process.exit(3);
	}
	console.log(`  [PASS] Build is referentially whole (${integrity.checked} references, ${integrity.walked} files)`);
	console.log("");
	if(failures.length>0){
		console.error(`FAIL: ${failures.length} budget(s) exceeded: ${failures.join(", ")}`);
		process.exit(1);
	}
	console.log("PASS: All bundle budgets satisfied.");
	process.exit(0);
}
main();
