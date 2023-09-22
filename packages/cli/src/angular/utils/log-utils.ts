import type { SourceFile } from "ts-morph";
import type { CliOptions } from "../../types/cli-options";

import { log } from "@clack/prompts";

/**
 * Saves the changes to a source file. If the `dryRun` option is set, the changes will be logged to the console instead.
 * @param sourceFile The source file to save.
 * @param cliOptions The CLI options.
 * @returns A promise that resolves the full text of the source file after saving.
 */
export async function saveFileChanges(
  sourceFile: SourceFile,
  cliOptions: CliOptions,
): Promise<string> {
  sourceFile.formatText();
  if (cliOptions.dryRun) {
    log.info("[Dry Run] Writing changes to: " + sourceFile.getFilePath());
    log.info(sourceFile.getFullText());
  } else {
    await sourceFile.save();
  }
  return sourceFile.getFullText();
}
