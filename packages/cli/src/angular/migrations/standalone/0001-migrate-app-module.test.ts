import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { dedent } from "ts-dedent";

import { migrateAppModule } from "./0001-migrate-app-module";

describe("migrateAppModule", () => {
  it("should migrate an @ionic/angular application to @ionic/angular/standalone", async () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const appModuleSourceFile = project.createSourceFile(
      "app.module.ts",
      dedent(`
      import { NgModule } from '@angular/core';
      import { IonicModule } from '@ionic/angular';

      @NgModule({
        imports: [IonicModule.forRoot({ mode: 'md' })]
      })
      export class AppModule {}
      `),
    );

    await migrateAppModule(project, { dryRun: false });

    expect(dedent(appModuleSourceFile.getText())).toBe(
      dedent(`
    import { NgModule } from '@angular/core';
    import { provideIonicAngular } from '@ionic/angular/standalone';

    @NgModule({
        imports: [],
        providers: [provideIonicAngular({ mode: 'md' })]
    })
    export class AppModule { }
    `),
    );
  });
});
