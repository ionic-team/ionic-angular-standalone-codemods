#!/usr/bin/env node

import {
  intro,
  outro,
  log,
  text,
  confirm,
  group,
  spinner,
} from "@clack/prompts";
import color from "picocolors";

import { Project } from "ts-morph";
import { existsSync } from 'node:fs';

import { cwd } from "node:process";
import { runStandaloneMigration } from "./angular/migrations/standalone";

const IONIC_MIGRATION_GUIDE_URL =
  "https://ionic.io/docs/migration/standalone-components"; // TODO update link
const IONIC_REPOSITORY_ISSUES_URL =
  "https://github.com/ionic-team/migration-utility/issues"; // TODO update link

async function main() {
  console.clear();

  intro(`${color.bgBlue(color.white("Ionic Migrate"))}`);
  intro(
    `${color.bgBlue(
      color.white(
        "This utility will migrate your Ionic Angular project to use the new standalone components from Ionic Framework 7.5.0.",
      ),
    )}`,
  );

  log.warning("--------------------------------------------------");
  log.warning(
    "WARNING: This utility is experimental and developers should manually review the changes made by this utility.",
  );
  log.warning(
    `If you want to manually migrate your project, please see the migration guide at: ${color.underline(
      IONIC_MIGRATION_GUIDE_URL,
    )}`,
  );
  log.warning("--------------------------------------------------");

  const cli = await group({
    dryRun: () =>
      confirm({
        message:
          "Do you want to run this migration as a dry run? This will not write any changes to your project.",
        initialValue: true,
      }),
    dir: () =>
      text({
        message:
          "What is the path to your project? Leave blank to use the current working directory.",
        initialValue: cwd(),
      }),
  });

  const s = spinner();
  s.start(`Migrating project at ${cli.dir}`);

  let project: Project;

  if (existsSync(`${cli.dir}/tsconfig.json`)) {
    project = new Project({
      tsConfigFilePath: `${cli.dir}/tsconfig.json`,
    });
  } else {
    project = new Project();
  }

  project.addSourceFilesAtPaths([
    `${cli.dir}/src/**/*.html`,
    `${cli.dir}/src/**/*.ts`,
    `${cli.dir}/angular.json`,
  ]);

  try {
    const success = await runStandaloneMigration({
      project,
      cliOptions: cli,
      dir: cli.dir,
    });

    if (success) {
      s.stop(`Successfully migrated project at ${cli.dir}`);

      log.info(
        "We recommend that you review the changes made by this migration and run any code formatting (prettier) before committing them to your project.",
      );
    } else {
      s.stop();
    }

    outro(`${color.bgBlue(color.white("Migration completed!"))}`);
  } catch (e: any) {
    s.stop();

    log.error("An error occurred while migrating your project.");
    log.error(e.message);
  }

  log.info(
    `If you find an issue with the migration utility, please report it at: ${color.underline(
      IONIC_REPOSITORY_ISSUES_URL,
    )}`,
  );
}

main().catch(console.error);
