declare module "import-cost" {
  /** https://github.com/wix/import-cost/tree/master/packages/import-cost */
  import EventEmitter = require("events");

  export const Lang: {
    TYPESCRIPT: "typescript";
    JAVASCRIPT: "javascript";
    VUE: "vue";
    SVELTE: "svelte";
  };

  export type Lang = (typeof Lang)[keyof typeof Lang];

  /**
   * @param fileName This is a string representing the full path to the file that is being processed. We need full file path since we need to look inside node_modules folder of the file in question
   * @param fileContents This is a string which contains the actual content of the file. We need it because in IDE extension it is usually much faster to get contents from IDE then reading it from filesystem. Also, obviously changes to the file might not have been saved yet, we want to work on the file as the user types to it.
   * @param language This effects which AST parser we will use to lookup the imports in the file. As you can see above, you pass either `Lang.JAVASCRIPT`, `Lang.TYPESCRIPT`, `Lang.VUE or` `Lang.SVELTE` to it. Typically IDE can tell you the language of the file, better use the correct API of your IDE then rely on extensions.
   * @param config (optional) - Object containing the following keys: `maxCallTime` - give up after timeout (in milliseconds) if bundle calculation didn't complete, `concurrent` - boolean representing whether calculation should happen in multiple workers.
   *
   * @example
   * emitter.on('error', e => // handle parse error of file, usually just log & ignore);
   * emitter.on('start', packages => // mark those packages as "calculating...");
   * emitter.on('calculated', package => // show size of this single package);
   * emitter.on('done', packages => // show sizes of all those packages);
   * emitter.removeAllListeners(); // ask to stop getting events in case file was updated)
   */
  export function importCost(
    fileName: string,
    fileContents: string,
    language: Lang,
    config?: { maxCallTime: number; concurrent: boolean }
  ): EventEmitter;

  /**When your extension terminates, your IDE will typically send you some notification of that. It is important that you handle this notification and invoke cleanup() in order to kill the thread pool. */
  export function cleanup(): void;
}
