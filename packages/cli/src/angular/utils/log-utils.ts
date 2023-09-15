import type { SourceFile } from "ts-morph";
import type { CliOptions } from "../../types/cli-options";

import * as p from '@clack/prompts';

export function saveFileChanges(sourceFile: SourceFile, cliOptions: CliOptions): Promise<void> {
  if (cliOptions.dryRun) {
    p.log.info('[Dry Run] Writing changes to: ' + sourceFile.getFilePath());
    p.log.info(sourceFile.getFullText());
    return Promise.resolve();
  } else {
    return sourceFile.save();
  }
}