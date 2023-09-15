#!/usr/bin/env node

import * as p from '@clack/prompts';
import color from 'picocolors';

import { Project } from 'ts-morph';

import { cwd } from 'node:process';
import { runStandaloneMigration } from './angular/migrations/standalone';

async function main() {
  console.clear();

  p.intro(`${color.bgCyan(color.black(' Ionic Migrate '))}`);

  const cli = await p.group({
    // Add a CLI option for dry running
    dryRun: () => p.confirm({
      message: 'Dry run?',
      initialValue: true,
    })
  });

  // const dir = cwd();

  const dir = '/Users/sean/documents/ionic/ionic-migrate/ionic-migrate/apps/angular/ionic-angular-modules';

  const project = new Project({
    tsConfigFilePath: `${dir}/tsconfig.json`
  });

  p.log.info(`Migrating project at ${dir}`)

  runStandaloneMigration(project, cli);

  p.outro('Migration complete!');

}

main().catch(console.error);