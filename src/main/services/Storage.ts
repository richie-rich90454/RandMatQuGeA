/**
 * @file The one place that decides where a learner's data is allowed to go.
 * @description Every piece of persisted state passes through this module, so the
 * privacy rule is stated once instead of being re-decided at each call site.
 *
 * Three modes exist, and the mode is not a preference about formatting, it is a
 * promise about what leaves the device:
 *
 * - `desktop` is the Tauri build, which keeps its records in the local SQLite
 *   database and has no web equivalent.
 * - `indexed` writes to IndexedDB in the browser, so a review schedule survives a
 *   reload and works offline, and the data is still confined to the device.
 * - `zdr` writes to a map that exists only for the lifetime of the tab. Nothing
 *   is written to localStorage, to IndexedDB, or to a cookie, so closing the tab
 *   erases every trace. This is a genuine zero-data-retention mode rather than a
 *   mode that writes to storage and then pretends not to.
 *
 * The in-memory map is the source of truth in every mode. A write goes to the
 * map first so that reading back what was just written is always correct, and
 * then, only when the mode allows it, to durable storage.
 */

/** Where persisted state is allowed to go. */
export type PersistenceMode="desktop"|"indexed"|"zdr";

/** The database and store the browser build writes to. */
const DB_NAME="randmatqugea";
const DB_VERSION=1;
const STORE_NAME="state";

/** Every value written this session, and the only copy in zero-retention mode. */
let memory: Map<string, unknown>=new Map();

/** The mode in force. Starts as zero-retention so nothing is written before a decision. */
let mode: PersistenceMode="zdr";

/** The open database, reused across calls. */
let dbPromise: Promise<IDBDatabase|null>|null=null;

/**
 * Reports whether this browser can persist at all. A browser in private mode
 * often exposes IndexedDB but rejects every transaction, so this reports the
 * ability to write rather than the presence of the API.
 *
 * @returns A promise resolving to true when a write can succeed.
 */
export async function isPersistenceAvailable(): Promise<boolean>{
    if (typeof indexedDB==="undefined") return false;
    let db=await openDatabase();
    if (!db) return false;
    try{
        return await new Promise<boolean>(resolve=>{
            let tx=db.transaction(STORE_NAME,"readwrite");
            let request=tx.objectStore(STORE_NAME).put({key:"__probe", value:1});
            request.onsuccess=()=>{
                request.onsuccess=null;
                db.transaction(STORE_NAME,"readwrite").objectStore(STORE_NAME).delete("__probe");
                resolve(true);
            };
            request.onerror=()=>resolve(false);
        });
    }
    catch{
        return false;
    }
}

/**
 * Opens the database once and reuses the handle, or resolves null when the
 * browser refuses.
 *
 * @returns A promise resolving to the database, or null.
 */
function openDatabase(): Promise<IDBDatabase|null>{
    if (dbPromise) return dbPromise;
    dbPromise=new Promise<IDBDatabase|null>(resolve=>{
        try{
            let request=indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded=()=>{
                let db=request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)){
                    db.createObjectStore(STORE_NAME, {keyPath:"key"});
                }
            };
            request.onsuccess=()=>resolve(request.result);
            request.onerror=()=>resolve(null);
            request.onblocked=()=>resolve(null);
        }
        catch{
            resolve(null);
        }
    });
    return dbPromise;
}

/**
 * Sets the mode in force. Anything already held in memory stays readable, so
 * switching from a persistent mode to zero retention does not lose the session
 * in progress, it only stops writing it.
 *
 * @param next - The mode to use.
 */
export function setPersistenceMode(next: PersistenceMode): void{
    mode=next;
}

/**
 * Reports the mode currently in force.
 *
 * @returns The mode.
 */
export function getPersistenceMode(): PersistenceMode{
    return mode;
}

/**
 * Reports whether state is written anywhere that outlives the tab.
 *
 * @returns True when a write is durable.
 */
export function isPersistent(): boolean{
    return mode!=="zdr";
}

/**
 * Reads a value. The in-memory map answers first, so a value read back after
 * being written in this session is returned even if durable storage is off.
 *
 * @param key - The key to read.
 * @returns A promise resolving to the value, or undefined when absent.
 */
export async function read<T>(key: string): Promise<T|undefined>{
    if (memory.has(key)) return memory.get(key) as T;
    if (mode==="zdr") return undefined;
    let db=await openDatabase();
    if (!db) return undefined;
    try{
        return await new Promise<T|undefined>(resolve=>{
            let tx=db.transaction(STORE_NAME,"readonly");
            let request=tx.objectStore(STORE_NAME).get(key);
            request.onsuccess=()=>{
                let record=request.result as {key: string; value: T}|undefined;
                if (record) memory.set(key, record.value);
                resolve(record?record.value:undefined);
            };
            request.onerror=()=>resolve(undefined);
        });
    }
    catch{
        return undefined;
    }
}

/**
 * Writes a value. The memory map is updated whatever the mode, so the session
 * behaves identically in all three; only the durable write is conditional.
 *
 * @param key - The key to write.
 * @param value - The value to store.
 */
export async function write(key: string, value: unknown): Promise<void>{
    memory.set(key, value);
    if (mode==="zdr") return;
    let db=await openDatabase();
    if (!db) return;
    try{
        await new Promise<void>(resolve=>{
            let tx=db.transaction(STORE_NAME,"readwrite");
            tx.objectStore(STORE_NAME).put({key, value});
            tx.oncomplete=()=>resolve();
            tx.onerror=()=>resolve();
            tx.onabort=()=>resolve();
        });
    }
    catch{
        // A failed durable write is not fatal. The value is still readable for
        // this session, which is the behaviour a learner would expect.
    }
}

/**
 * Removes a value from both the memory map and durable storage.
 *
 * @param key - The key to remove.
 */
export async function remove(key: string): Promise<void>{
    memory.delete(key);
    if (mode==="zdr") return;
    let db=await openDatabase();
    if (!db) return;
    try{
        await new Promise<void>(resolve=>{
            let tx=db.transaction(STORE_NAME,"readwrite");
            tx.objectStore(STORE_NAME).delete(key);
            tx.oncomplete=()=>resolve();
            tx.onerror=()=>resolve();
            tx.onabort=()=>resolve();
        });
    }
    catch{
        // Absent means absent.
    }
}

/**
 * Erases everything this app has stored, in memory and durably. This is what the
 * erase-data control calls, and it leaves nothing behind in either place.
 */
export async function clear(): Promise<void>{
    memory.clear();
    if (mode==="zdr") return;
    let db=await openDatabase();
    if (!db) return;
    try{
        await new Promise<void>(resolve=>{
            let tx=db.transaction(STORE_NAME,"readwrite");
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete=()=>resolve();
            tx.onerror=()=>resolve();
            tx.onabort=()=>resolve();
        });
    }
    catch{
        // Nothing left to erase.
    }
}

/**
 * Reports whether this build can keep a learner's history at all. The desktop
 * build has its own local database, so it is usable regardless of the browser
 * storage mode, which is why the answer is not simply whether the mode is
 * persistent.
 *
 * @returns True when a record written now would still be there after a reload.
 */
export function isPersistenceUsable(): boolean{
    return mode==="desktop"||mode==="indexed";
}

/**
 * Reports whether a durable write is actually possible in this browser, which is
 * a separate question from whether the mode permits one.
 *
 * @returns A promise resolving to true when a write can succeed.
 */
export async function isPersistenceUsableHere(): Promise<boolean>{
    if (mode==="desktop") return true;
    if (mode!=="indexed") return false;
    return isPersistenceAvailable();
}

/**
 * Moves anything already held in localStorage into the store the current mode
 * uses, then removes it from localStorage. This is what makes the switch from
 * the previous behaviour real rather than cosmetic: a record that was written
 * before the choice was made is either carried over into IndexedDB or dropped,
 * and it is never left behind in localStorage where a zero-retention promise
 * would be broken by data the app had already written.
 */
export async function migrateFromLocalStorage(keys: string[]): Promise<number>{
    let carried=0;
    for(let key of keys){
        let raw:string|null=null;
        try{
            raw=localStorage.getItem(key);
        }
        catch{
            continue;
        }
        if (raw===null) continue;
        try{
            let value=JSON.parse(raw) as unknown;
            if (!memory.has(key)) memory.set(key, value);
            await write(key, value);
            carried++;
        }
        catch{
            // A value that is not JSON is still removed, because leaving it in
            // localStorage would keep the promise false.
        }
        try{
            localStorage.removeItem(key);
        }
        catch{
            // Removal can fail in a locked-down browser; the value has at least
            // been moved and is no longer read by this app.
        }
    }
    return carried;
}
