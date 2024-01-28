import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { dedent } from "ts-dedent";

import { migrateBootstrapApplication } from "./0003-migrate-bootstrap-application";

describe("migrateBootstrapApplication", () => {
  it("should migrate bootstrapApplication", async () => {
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

    const mainSourceFile = project.createSourceFile("src/main.ts", main);

    await migrateBootstrapApplication(project, { dryRun: false });

    expect(dedent(mainSourceFile.getText())).toBe(
      dedent(`
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
    `),
    );
  });

  it("order of providers should not impact migration", async () => {
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
        provideRouter(routes),
        importProvidersFrom(IonicModule.forRoot({ mode: 'ios' })),
      ],
    });
    `);

    const mainSourceFile = project.createSourceFile("src/main.ts", main);

    await migrateBootstrapApplication(project, { dryRun: false });

    expect(dedent(mainSourceFile.getText())).toBe(
      dedent(`
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
    `),
    );
  });

  it("should migrate IonicModule.forRoot without explicit config", async () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const main = dedent(`
    import { enableProdMode, importProvidersFrom } from '@angular/core';
    import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


    import { environment } from './environments/environment';
    import { AppComponent } from './app/app.component';
    import { AppRoutingModule } from './app/app-routing.module';
    import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
    import { IonicRouteStrategy, IonicModule } from '@ionic/angular';
    import { RouteReuseStrategy } from '@angular/router';

    if (environment.production) {
      enableProdMode();
    }

    bootstrapApplication(AppComponent, {
        providers: [
            importProvidersFrom(BrowserModule, IonicModule.forRoot(), AppRoutingModule),
            { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
        ]
    })
      .catch(err => console.log(err));
    `);

    const mainSourceFile = project.createSourceFile("src/main.ts", main);

    await migrateBootstrapApplication(project, { dryRun: false });

    expect(dedent(mainSourceFile.getText())).toBe(
      dedent(`
      import { enableProdMode, importProvidersFrom } from '@angular/core';
      import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
      
      
      import { environment } from './environments/environment';
      import { AppComponent } from './app/app.component';
      import { AppRoutingModule } from './app/app-routing.module';
      import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
      import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
      import { RouteReuseStrategy } from '@angular/router';
      
      if (environment.production) {
          enableProdMode();
      }
      
      bootstrapApplication(AppComponent, {
          providers: [
              importProvidersFrom(BrowserModule, AppRoutingModule),
              { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
              provideIonicAngular({})
          ]
      })
          .catch(err => console.log(err));
      `),
    );
  });
});
