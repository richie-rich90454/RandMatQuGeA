/**
 * @file The small synchronous constants.
 * @description The curriculum tables used to live here with them, and at 24.5 kB raw
 * they were a sixth of the initial payload. They now live in TopicData, which arrives
 * through a dynamic import that boot awaits, so only these two exports load with the
 * entry chunk: the order scopes widen in, and the one storage key the migration must
 * know. Everything that needs the tables reads them through Topics, never by importing
 * TopicData statically: a static import anywhere in the shipped sources would put the
 * tables back in the entry chunk the split took them out of.
 */
/**
 * The scopes from narrowest to widest, which is the order the scope control lists
 * them in.
 *
 * Declared beside the scopes rather than read from the control's options because
 * it is also the order a question is answered in: when a category can only be
 * reached by widening the scope, the narrowest scope that reaches it is the one to
 * widen to, and that is the first entry here containing one of its topics.
 */
export const scopeLadder=["simple","algebra","precalc","calc","all"];

export let SESSION_STORAGE_KEY="mentalSessionSnapshot";
