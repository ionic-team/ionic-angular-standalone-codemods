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

  });

  const dir = cwd();


  const project = new Project({
    tsConfigFilePath: `${dir}/tsconfig.json`
  });

  p.log.info(`Migrating project at ${dir}`)

  // migrate(dir);

  runStandaloneMigration(project);

}

main().catch(console.error);


function migrate(directory: string) {
  const project = new Project({
    tsConfigFilePath: `${directory}/tsconfig.json`
  });

  const mainTs = project.getSourceFile('src/main.ts');

  if (mainTs !== undefined) {
    console.log('we have a match!');
    const bootstrapApplication = mainTs.getFunction('bootstrapApplication');

    if (bootstrapApplication !== undefined) {
      console.log('we have a bootstrapApplication!');
    } else {
      console.log('no bootstrap sorry');
    }
  }
}