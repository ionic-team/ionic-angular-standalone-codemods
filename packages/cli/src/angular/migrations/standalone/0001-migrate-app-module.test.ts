import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { dedent } from 'ts-dedent';

import { CliOptions } from '../../../types/cli-options';

import { migrateAppModule } from './0001-migrate-app-module';

describe('migrateAppModule', () => {

  it('should migrate an @ionic/angular application to @ionic/angular/standalone', async () => {
    const project = new Project();

    const appModule = project.createSourceFile(
      'app.module.ts',
      dedent(`
      import { NgModule } from '@angular/core';
      import { IonicModule } from '@ionic/angular';

      @NgModule({
        imports: [IonicModule.forRoot({ mode: 'md' })]
      })
      export class AppModule {}
      `)
    );

    const cliOptions: CliOptions = {
      dryRun: true
    }

    const result = await migrateAppModule(project, cliOptions);

    expect(dedent(result!)).toBe(dedent(`
    import { NgModule } from '@angular/core';
    import { provideIonicAngular } from '@ionic/angular/standalone';

    @NgModule({
        imports: [],
        providers: [provideIonicAngular({ mode: 'md' })]
    })
    export class AppModule { }
    `));

  });

});