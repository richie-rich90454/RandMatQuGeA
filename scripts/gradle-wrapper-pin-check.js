/**
 * Gradle wrapper pin checker — asserts that the Android Gradle wrapper pins the
 * distribution it downloads, and that the pinned value is the checksum Gradle
 * publishes for the configured distributionUrl.
 *
 * A wrapper with no distributionSha256Sum unpacks whatever the URL serves, so a
 * hijacked or mirrored distribution becomes a build that runs someone else's
 * code. The pin turns that into a failed build instead. A pin nobody checks,
 * though, is a comment: it is one deleted line away from gone, and nothing in
 * the build would notice.
 *
 * Run it directly. It is not wired into any npm script:
 *   node scripts/gradle-wrapper-pin-check.js
 *
 * Exit codes:
 *   0  the pin is present and matches the published checksum
 *   1  the pin is absent, unusable, or does not match what Gradle publishes
 *   2  the check could not run: no properties file, or no reachable checksum
 *
 * GRADLE_WRAPPER_PROPERTIES points the check at a different properties file,
 * which is how the failure modes get exercised without editing the real one.
 * GRADLE_PIN_TIMEOUT_MS sets the request timeout, default 15000.
 */
import{readFileSync,existsSync}from"node:fs";
import{join,dirname}from"node:path";
import{fileURLToPath}from"node:url";
let __dirname=dirname(fileURLToPath(import.meta.url));
let propertiesPath=process.env.GRADLE_WRAPPER_PROPERTIES||join(__dirname,"..","src-tauri","gen","android","gradle","wrapper","gradle-wrapper.properties");
let timeoutMs=Number(process.env.GRADLE_PIN_TIMEOUT_MS||15000);
/**
 * Read a Java properties file into a map.
 * @param {string} path - absolute path of the properties file to read
 * @returns {Map<string,string>} every key=value pair, comments and blank lines dropped
 */
function readProperties(path){
    let props=new Map();
    for(let line of readFileSync(path,"utf8").split(/\r?\n/)){
        let trimmed=line.trim();
        if(!trimmed||trimmed.startsWith("#")||trimmed.startsWith("!"))continue;
        let separator=trimmed.indexOf("=");
        if(separator<0)continue;
        props.set(trimmed.slice(0,separator).trim(),trimmed.slice(separator+1).trim());
    }
    return props;
}
/**
 * Ask Gradle what the checksum of a distribution is.
 * @param {string} url - the distribution URL, already unescaped
 * @returns {Promise<string>} the published sha256, lowercased
 * @throws {Error} when the checksum cannot be fetched or is not a sha256
 */
async function fetchPublishedChecksum(url){
    let response=await fetch(`${url}.sha256`,{signal:AbortSignal.timeout(timeoutMs)});
    // Read the body before judging the status, so the socket is drained either
    // way and nothing is left left open when this script exits.
    let body=await response.text();
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    let published=body.trim().split(/\s+/)[0].toLowerCase();
    if(!/^[0-9a-f]{64}$/.test(published))throw new Error(`response was '${body.trim().slice(0,80)}', not a sha256`);
    return published;
}
async function main(){
    console.log("\n=== Gradle Wrapper Pin Check ===\n");
    // Every path below sets process.exitCode and returns instead of calling
    // process.exit(). An explicit exit while a fetched socket is still closing
    // aborts the process on Windows with a libuv assertion, and the shell sees
    // a crash code instead of the verdict.
    if(!existsSync(propertiesPath)){
        console.error(`ERROR: ${propertiesPath} not found. There is no pin to check.`);
        process.exitCode=2;
        return;
    }
    let props=readProperties(propertiesPath);
    // Java properties escape the colon in a URL, and an escaped one is not a URL
    // anything can fetch or a checksum can be looked up against.
    let url=(props.get("distributionUrl")||"").replace(/^https\\:/,"https:");
    let pinned=(props.get("distributionSha256Sum")||"").toLowerCase();
    console.log(`  properties:   ${propertiesPath}`);
    console.log(`  distribution: ${url||"(absent)"}`);
    console.log(`  pinned:       ${pinned||"(absent)"}`);
    if(!url){
        console.error("ERROR: distributionUrl is absent, so there is nothing to pin.");
        process.exitCode=1;
        return;
    }
    if(!pinned){
        console.error("ERROR: distributionSha256Sum is absent. The wrapper would unpack whatever the URL serves. Restore the pin.");
        process.exitCode=1;
        return;
    }
    if(!/^https:\/\//.test(url)){
        console.error(`ERROR: distributionUrl is not https, so its published checksum cannot be trusted to describe it: ${url}`);
        process.exitCode=1;
        return;
    }
    let published="";
    try{
        published=await fetchPublishedChecksum(url);
    }
    catch(error){
        // Reporting success here would be the one thing this check exists to
        // prevent: an unreachable checksum must not read as a sound pin.
        console.error(`ERROR: could not read the published checksum from ${url}.sha256 (${error.message}). Cannot confirm the pin.`);
        process.exitCode=2;
        return;
    }
    console.log(`  published:    ${published}`);
    if(published!==pinned){
        console.error(`FAIL: distributionSha256Sum does not match the checksum Gradle publishes for ${url}`);
        process.exitCode=1;
        return;
    }
    console.log("");
    console.log("PASS: The wrapper pins the distribution to the checksum Gradle publishes.");
}
main();
