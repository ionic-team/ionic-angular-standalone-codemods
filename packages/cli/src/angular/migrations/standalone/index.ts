import type { Project } from "ts-morph";
import type { CliOptions } from "../../../types/cli-options";
import { migrateAppModule } from "./0001-migrate-app-module";
import { migrateImportStatements } from "./0004-migrate-import-statements";
import { migrateComponents } from "./0002-import-standalone-component";
import { migrateBootstrapApplication } from "./0003-migrate-bootstrap-application";
import { migrateAngularJsonAssets } from "./0005-migrate-angular-json-assets";

import { group, confirm, log, spinner } from '@clack/prompts';
import { getActualPackageVersion } from "../../utils/package-utils";

interface StandaloneMigrationOptions {
  project: Project;
  cliOptions: CliOptions;
  /**
   * The user-specified directory for running the migration.
   */
  dir: string;

  spinner: ReturnType<typeof spinner>;
}

export const runStandaloneMigration = async ({
  project,
  cliOptions,
  dir,
  spinner
}: StandaloneMigrationOptions) => {
  const hasIonicAngularMinVersion = await checkInstalledIonicVersion(dir);
  if (!hasIonicAngularMinVersion) {
    return false;
  }

  spinner.start(`Migrating project located at: ${dir}`);

  await migrateAppModule(project, cliOptions);
  await migrateBootstrapApplication(project, cliOptions);

  await migrateComponents(project, cliOptions);

  await migrateImportStatements(project, cliOptions);

  await migrateAngularJsonAssets(project, cliOptions);

  spinner.stop(`Project migration at ${dir} completed successfully.`);

  log.success(
    "We recommend reviewing the changes made by this migration and formatting your code (e.g., with Prettier) before committing.",
  );

  return true;
};

async function checkInstalledIonicVersion(dir: string) {
  const ionicAngularVersion = await getActualPackageVersion(dir, '@ionic/angular');

  if (!ionicAngularVersion) {
    log.warn('We could not detect the version of @ionic/angular installed in your project.');
    log.warn('This migration requires @ionic/angular version of 7.5.0 or later.');
    log.warn('Do you want to proceed anyway?');

    const { continue: shouldContinue } = await group({
      continue: () => confirm({
        message: 'Continue?',
        initialValue: false
      }),
    });

    if (!shouldContinue || typeof shouldContinue !== 'boolean') {
      log.info('Migration canceled.');
      return false;
    }
  } else {
    const [major, minor] = ionicAngularVersion.split('.');
    const majorVersion = parseInt(major);
    const minorVersion = parseInt(minor);

    const logVersionError = () => {
      log.error('This migration requires an @ionic/angular version of v7.5.0 or greater.');
      log.error('Install the latest version of @ionic/angular and try again.');
      log.error('Exiting migration.');
    }

    if (majorVersion < 7) {
      logVersionError();
      return false;
    }

    if (minorVersion < 5) {
      logVersionError();
      return false;
    }
  }
  return true;
}