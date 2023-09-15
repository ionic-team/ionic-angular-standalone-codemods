import type { Project } from "ts-morph";
import { migrateAppModule } from "./0001-migrate-app-module";
import { CliOptions } from "../../../types/cli-options";


export const runStandaloneMigration = (project: Project, cliOptions: CliOptions) => {
  migrateAppModule(project, cliOptions);
};