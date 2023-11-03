import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { dedent } from "ts-dedent";

import { migrateAngularAppConfig } from "./0006-migrate-angular-app-config";

describe("migrateAngularAppConfig", () => {
  it("should migrate app.config.ts", async () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const appConfig = dedent(`
    import { ApplicationConfig, importProvidersFrom } from '@angular/core';
    import { provideRouter } from '@angular/router';
    import { IonicModule } from '@ionic/angular';

    import { routes } from './app.routes';

    export const appConfig: ApplicationConfig = {
      providers: [provideRouter(routes), importProvidersFrom(IonicModule.forRoot())]
    };
    `);

    const configSourceFile = project.createSourceFile(
      "src/app/app.config.ts",
      appConfig,
    );

    await migrateAngularAppConfig(project, { dryRun: false });

    expect(dedent(configSourceFile.getText())).toBe(
      dedent(`
    import { ApplicationConfig, importProvidersFrom } from '@angular/core';
    import { provideRouter } from '@angular/router';
    import { provideIonicAngular } from '@ionic/angular/standalone';

    import { routes } from './app.routes';

    export const appConfig: ApplicationConfig = {
        providers: [provideRouter(routes), provideIonicAngular()]
    };
    `),
    );
  });
});
