/**
 * AppImage AppDir checker — verifies that a built AppImage contains the files
 * the AppImageHub catalog test requires, in particular a .DirIcon that resolves
 * inside the AppDir.
 *
 * Tauri's AppImage bundler before 2.11.4 wrote .DirIcon as an absolute symlink
 * into the build machine's target directory. appimagetool preserves the link,
 * so the packaged AppImage shipped a dangling link that AppImageHub reports as
 * "FATAL: .DirIcon is missing". This check runs on the actual artifact after
 * the Linux release build, so a regression fails the release instead of the
 * catalog submission.
 *
 * Run it on Linux:
 *   node scripts/check-appimage.js path/to/App.AppImage
 *
 * Exit codes:
 *   0  the AppImage extracts, and its AppDir has a usable .DirIcon and desktop entry
 *   1  a required file is missing, dangling, absolute, or inconsistent
 *   2  the check could not run: not Linux, no argument, or extraction failed
 */
import{execFileSync}from"node:child_process";
import{existsSync,lstatSync,mkdtempSync,readFileSync,readlinkSync,readdirSync,rmSync,statSync}from"node:fs";
import{tmpdir}from"node:os";
import{isAbsolute,join,relative,resolve}from"node:path";
let failures=[];
/**
 * Record a problem and keep checking, so one run reports every broken file.
 * @param {string} message - what is wrong and where
 */
function fail(message){
    failures.push(message);
}
/**
 * Read the [Desktop Entry] section of a desktop file into a map.
 * @param {string} path - absolute path of the .desktop file
 * @returns {Map<string,string>} keys from the main section, first value wins
 */
function readDesktopEntry(path){
    let entries=new Map();
    let inMain=false;
    for(let line of readFileSync(path,"utf8").split(/\r?\n/)){
        if(/^\s*\[.*\]\s*$/.test(line)){
            inMain=line.trim()==="[Desktop Entry]";
            continue;
        }
        if(!inMain)continue;
        let separator=line.indexOf("=");
        if(separator<0)continue;
        let key=line.slice(0,separator).trim();
        let value=line.slice(separator+1).trim();
        if(key&&!entries.has(key))entries.set(key,value);
    }
    return entries;
}
/**
 * Read the dimensions out of a PNG header.
 * @param {string} path - file to inspect
 * @returns {{width:number,height:number}|null} null when the file is not a PNG
 */
function pngSize(path){
    let bytes=readFileSync(path);
    if(bytes.length<24)return null;
    let signature=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
    if(!bytes.subarray(0,8).equals(signature))return null;
    let width=bytes.readUInt32BE(16);
    let height=bytes.readUInt32BE(20);
    if(width<=0||height<=0)return null;
    return{width,height};
}
/**
 * Find the icon a desktop entry names in the hicolor theme.
 * @param {string} appDir - extracted AppDir root
 * @param {string} iconName - value of the desktop entry's Icon key
 * @returns {string|null} the icon path, or null when no size provides it
 */
function findHicolorIcon(appDir,iconName){
    let base=join(appDir,"usr","share","icons","hicolor");
    if(!existsSync(base))return null;
    for(let size of readdirSync(base)){
        for(let extension of["png","svg"]){
            let candidate=join(base,size,"apps",`${iconName}.${extension}`);
            if(existsSync(candidate))return candidate;
        }
    }
    return null;
}
/**
 * Check the .DirIcon, AppRun, desktop entry, executable and icon of an AppDir.
 * @param {string} appDir - extracted AppDir root
 */
function checkAppDir(appDir){
    let dirIcon=join(appDir,".DirIcon");
    let resolvedIcon="";
    let dirIconStat=null;
    try{
        dirIconStat=lstatSync(dirIcon);
    }catch(error){
        if(error.code!=="ENOENT")throw error;
    }
    if(!dirIconStat){
        fail(".DirIcon is missing from the AppDir root");
    }else{
        let stat=dirIconStat;
        if(stat.isSymbolicLink()){
            let target=readlinkSync(dirIcon);
            if(isAbsolute(target)){
                fail(`.DirIcon is an absolute symlink (${target}); it only resolves on the build machine`);
            }else{
                let targetPath=resolve(appDir,target);
                let inside=relative(appDir,targetPath);
                if(inside.startsWith("..")||isAbsolute(inside)){
                    fail(`.DirIcon points outside the AppDir (${target})`);
                }else if(!existsSync(targetPath)){
                    fail(`.DirIcon is a dangling symlink (${target})`);
                }else if(!statSync(targetPath).isFile()){
                    fail(`.DirIcon does not resolve to a file (${target})`);
                }else{
                    resolvedIcon=targetPath;
                    console.log(`  .DirIcon:     relative -> ${target}`);
                }
            }
        }else if(stat.isFile()){
            resolvedIcon=dirIcon;
            console.log("  .DirIcon:     regular file");
        }else{
            fail(".DirIcon is neither a file nor a symlink");
        }
    }
    if(resolvedIcon){
        let size=pngSize(resolvedIcon);
        if(!size)fail(`.DirIcon target is not a valid PNG (${relative(appDir,resolvedIcon)})`);
        else console.log(`  icon:         ${size.width}x${size.height} PNG`);
    }
    let appRun=join(appDir,"AppRun");
    if(!existsSync(appRun)){
        fail("AppRun is missing");
    }else if((statSync(appRun).mode&0o111)===0){
        fail("AppRun is not executable");
    }
    let desktopFiles=readdirSync(appDir).filter(name=>name.endsWith(".desktop"));
    if(desktopFiles.length!==1){
        fail(`expected exactly one .desktop file at the AppDir root, found ${desktopFiles.length}`);
        return;
    }
    let desktopPath=join(appDir,desktopFiles[0]);
    let desktopStat=lstatSync(desktopPath);
    if(desktopStat.isSymbolicLink()){
        let target=readlinkSync(desktopPath);
        if(isAbsolute(target))fail(`the AppDir .desktop symlink is absolute (${target})`);
        else if(!existsSync(resolve(appDir,target)))fail(`the AppDir .desktop symlink is dangling (${target})`);
    }
    let desktop=readDesktopEntry(desktopPath);
    for(let key of["Type","Name","Exec","Icon","Categories"]){
        if(!desktop.has(key))fail(`desktop entry is missing ${key}`);
    }
    if(desktop.get("Type")!=="Application")fail("desktop entry Type is not Application");
    if(!desktop.get("Categories"))fail("desktop entry Categories is empty");
    let exec=desktop.get("Exec")||"";
    let execName=exec.split(/\s+/)[0].replace(/^"|"$/g,"");
    let execPath=join(appDir,"usr","bin",execName);
    if(!execName){
        fail("desktop entry Exec is empty");
    }else if(!existsSync(execPath)){
        fail(`desktop entry Exec ${execName} is not packaged at usr/bin/${execName}`);
    }else if((statSync(execPath).mode&0o111)===0){
        fail(`packaged executable usr/bin/${execName} is not executable`);
    }
    let iconName=desktop.get("Icon")||"";
    let desktopIcon="";
    if(!iconName){
        fail("desktop entry Icon is empty");
    }else{
        let topLevel=join(appDir,`${iconName}.png`);
        if(existsSync(topLevel))desktopIcon=topLevel;
        else desktopIcon=findHicolorIcon(appDir,iconName)||"";
        if(!desktopIcon)fail(`desktop entry Icon ${iconName} has no matching icon file`);
    }
    if(desktopIcon&&!pngSize(desktopIcon)){
        fail(`desktop entry icon is not a valid PNG (${relative(appDir,desktopIcon)})`);
    }
    console.log(`  desktop:      ${desktopFiles[0]} (Exec=${execName}, Icon=${iconName}, Categories=${desktop.get("Categories")})`);
    if(desktopIcon)console.log(`  desktop icon: ${relative(appDir,desktopIcon)}`);
}
/**
 * Extract the AppImage with its own runtime. This works without FUSE and does
 * not depend on unsquashfs or the offset of the SquashFS payload.
 * @param {string} appImage - absolute path of the AppImage to extract
 * @param {string} workDir - empty directory that receives squashfs-root
 * @returns {boolean} true when squashfs-root was produced
 */
function extractAppImage(appImage,workDir){
    try{
        execFileSync(appImage,["--appimage-extract"],{cwd:workDir,stdio:"pipe",maxBuffer:64*1024*1024});
    }catch(error){
        console.error(`ERROR: could not extract ${appImage} with its own AppImage runtime.`);
        if(error.stderr)console.error(error.stderr.toString().trim());
        else console.error(error.message);
        process.exitCode=2;
        return false;
    }
    if(!existsSync(join(workDir,"squashfs-root"))){
        console.error("ERROR: the AppImage runtime did not produce squashfs-root.");
        process.exitCode=2;
        return false;
    }
    return true;
}
function main(){
    let appImage=process.argv[2]?resolve(process.argv[2]):"";
    if(process.platform!=="linux"){
        console.error("ERROR: this check executes the AppImage runtime, so it must run on Linux.");
        process.exitCode=2;
        return;
    }
    if(!appImage){
        console.error("Usage: node scripts/check-appimage.js path/to/App.AppImage");
        process.exitCode=2;
        return;
    }
    if(!existsSync(appImage)){
        console.error(`ERROR: ${appImage} not found.`);
        process.exitCode=2;
        return;
    }
    let workDir=mkdtempSync(join(tmpdir(),"randmatqugea-appimage-"));
    try{
        if(!extractAppImage(appImage,workDir))return;
        console.log("\n=== AppImage AppDir Check ===\n");
        console.log(`  artifact:     ${appImage}`);
        checkAppDir(join(workDir,"squashfs-root"));
        console.log("");
        if(failures.length>0){
            for(let failure of failures)console.error(`FAIL: ${failure}`);
            process.exitCode=1;
            return;
        }
        console.log("PASS: The AppImage has a usable .DirIcon, AppRun, executable and desktop entry.");
    }finally{
        rmSync(workDir,{recursive:true,force:true});
    }
}
main();
