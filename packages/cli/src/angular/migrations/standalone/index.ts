import type { Project } from "ts-morph";
import { migrateAppModule } from "./0001-migrate-app-module";


export const runStandaloneMigration = (project: Project) => {
  migrateAppModule(project);
};