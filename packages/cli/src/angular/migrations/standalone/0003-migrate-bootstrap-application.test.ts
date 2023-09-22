import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { dedent } from 'ts-dedent';

import { migrateBootstrapApplication } from './0003-migrate-bootstrap-application';

describe('migrateBootstrapApplication', () => {

  it('should migrate bootstrapApplication', async () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const main = dedent(`
    import { enableProdMode, importProvidersFrom } from '@angular/core';
    import { bootstrapApplication } from '@angular/platform-browser';
    import { RouteReuseStrategy, provideRouter } from '@angular/router';
    import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

    import { routes } from './app/app.routes';
    import { AppComponent } from './app/app.component';
    import { environment } from './environments/environment';

    if (environment.production) {
      enableProdMode();
    }

    bootstrapApplication(AppComponent, {
      providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        importProvidersFrom(IonicModule.forRoot({ mode: 'ios' })),
        provideRouter(routes),
      ],
    });
    `);

    const mainSourceFile = project.createSourceFile('src/main.ts', main);

    await migrateBootstrapApplication(project, { dryRun: false });

    expect(dedent(mainSourceFile.getText())).toBe(dedent(`
    import { enableProdMode, importProvidersFrom } from '@angular/core';
    import { bootstrapApplication } from '@angular/platform-browser';
    import { RouteReuseStrategy, provideRouter } from '@angular/router';
    import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

    import { routes } from './app/app.routes';
    import { AppComponent } from './app/app.component';
    import { environment } from './environments/environment';

    if (environment.production) {
        enableProdMode();
    }

    bootstrapApplication(AppComponent, {
        providers: [
            { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
            provideRouter(routes),
            provideIonicAngular({ mode: 'ios' })
        ],
    });
    `));
  });

});