import type { SourceFile } from "ts-morph";
import type { CliOptions } from "../../types/cli-options";

import * as p from '@clack/prompts';

/**
 * Saves the changes to a source file. If the `dryRun` option is set, the changes will be logged to the console instead.
 * @param sourceFile The source file to save.
 * @param cliOptions The CLI options.
 * @returns A promise that resolves when the file has been saved.
 */
export function saveFileChanges(sourceFile: SourceFile, cliOptions: CliOptions): Promise<void> {
  if (cliOptions.dryRun) {
    p.log.info('[Dry Run] Writing changes to: ' + sourceFile.getFilePath());
    p.log.info(sourceFile.getFullText());
    return Promise.resolve();
  } else {
    return sourceFile.save();
  }
}