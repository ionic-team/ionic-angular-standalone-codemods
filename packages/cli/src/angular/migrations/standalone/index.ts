import type { Project } from "ts-morph";
import { migrateAppModule } from "./0001-migrate-app-module";
import { CliOptions } from "../../../types/cli-options";
import { migrateImportStatements } from "./000X-migrate-import-statements";
import { parseAngularComponentTemplates } from "./0002-import-standalone-component";

interface StandaloneMigrationOptions {
  project: Project;
  cliOptions: CliOptions;
  directory: string;
}

export const runStandaloneMigration = ({
  project,
  cliOptions,
  directory
}: StandaloneMigrationOptions) => {
  // migrateAppModule(project, cliOptions);


  parseAngularComponentTemplates(directory, cliOptions);
  // This should happen as the last migration.
  // Otherwise we won't be able to tell if the migration has already been run.
  // migrateImportStatements(project, cliOptions);
};