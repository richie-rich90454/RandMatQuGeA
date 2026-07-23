export interface TopicEntry{
    id: string;
    scope: string;
    fn: string;
}
export class TopicRegistry{
    private _topics: Map<string, TopicEntry>=new Map();
    registerTopic(id: string, scope: string, fn: string): void{
        this._topics.set(id, {id, scope, fn});
    }
    getTopic(id: string): TopicEntry|undefined{
        return this._topics.get(id);
    }
    hasTopic(id: string): boolean{
        return this._topics.has(id);
    }
    getAllTopics(): Map<string, TopicEntry>{
        return this._topics;
    }
    clear(): void{
        this._topics.clear();
    }
    count(): number{
        return this._topics.size;
    }
    hasTopics(): boolean{
        return this._topics.size>0;
    }
    getScopeCount(scope: string): number{
        let count=0;
        for(let entry of this._topics.values()){
            if(entry.scope===scope) count++;
        }
        return count;
    }
    getScopes(): string[]{
        let scopes=new Set<string>();
        for(let entry of this._topics.values()){
            scopes.add(entry.scope);
        }
        return Array.from(scopes);
    }
    getTopicsByScope(scope: string): TopicEntry[]{
        let result: TopicEntry[]=[];
        for (let entry of this._topics.values()){
            if (entry.scope===scope){
                result.push(entry);
            }
        }
        return result;
    }
}
export let topicRegistry: TopicRegistry=new TopicRegistry();
export function registerTopic(id: string, scope: string, fn: string): void{
    topicRegistry.registerTopic(id, scope, fn);
}