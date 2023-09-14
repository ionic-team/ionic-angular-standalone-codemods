import { migrateBootstrapApplication } from '.';

describe('Migrate standalone main.ts', () => {

  it('should add a new import statement for provideIonicAngular from @ionic/angular/standalone', () => {
    const sourceText = `
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
          importProvidersFrom(IonicModule.forRoot({})),
          provideRouter(routes),
        ],
      });
  `;

    const expectedSourceText = `
    import { enableProdMode } from '@angular/core';
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
        provideIonicAngular({}),
        provideRouter(routes),
      ],
    });
    `;

    const context = {
      logger: {
        debug: (msg: any) => console.log(msg)
      }
    } as any;

    const result = migrateBootstrapApplication(sourceText, context);

    expect(result).toBe(expectedSourceText);
  });

});