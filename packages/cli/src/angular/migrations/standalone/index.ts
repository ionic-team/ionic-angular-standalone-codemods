import type { Project } from "ts-morph";
import { migrateAppModule } from "./0001-migrate-app-module";
import { CliOptions } from "../../../types/cli-options";
import { migrateImportStatements } from "./000X-migrate-import-statements";
import { parseAngularComponentTemplates } from "./0002-import-standalone-component";

interface StandaloneMigrationOptions {
  project: Project;
  cliOptions: CliOptions
}

export const runStandaloneMigration = async ({
  project,
  cliOptions
}: StandaloneMigrationOptions) => {
  await migrateAppModule(project, cliOptions);

  await parseAngularComponentTemplates(project, cliOptions);

  await migrateImportStatements(project, cliOptions);
};