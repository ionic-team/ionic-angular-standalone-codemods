// TODO rename this file to the last migration that it performs.

import type { Project } from "ts-morph";
import type { CliOptions } from "../../../types/cli-options";

import * as p from '@clack/prompts';

export const migrateImportStatements = (project: Project, cliOptions: CliOptions) => {
  // Get all typescript source files in the project and update any @ionic/angular imports to @ionic/angular/standalone
  project.getSourceFiles().forEach(sourceFile => {
    let hasChanges = false;

    const importDeclarations = sourceFile.getImportDeclarations();
    importDeclarations.forEach(importDeclaration => {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
      if (moduleSpecifier === '@ionic/angular') {
        importDeclaration.setModuleSpecifier('@ionic/angular/standalone');
        hasChanges = true;
      }
    });

    if (hasChanges) {
      if (cliOptions.dryRun) {
        p.log.info(`[Dry Run] Writing changes to: ${sourceFile.getFilePath()}`);
        p.log.info(sourceFile.getFullText());
      } else {
        sourceFile.saveSync();
      }
    }
  });

}