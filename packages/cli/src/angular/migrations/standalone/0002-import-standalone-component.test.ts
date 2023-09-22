import { describe, it, expect, vi } from 'vitest';

import { migrateComponents } from './0002-import-standalone-component';
import { Project } from 'ts-morph';
import dedent from 'ts-dedent';

describe('migrateComponents', () => {

  describe('migrating projects using ionic components', () => {

    it('should migrate components using inline templates', async () => {
      const project = new Project();

      const component = `
        import { Component } from "@angular/core";

        @Component({
          selector: 'my-component',
          template: \`
            <ion-header>
              <ion-toolbar>
                <ion-title>My Component</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <ion-list>
                <ion-item>
                  <ion-label>My Item</ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
          \`,
          standalone: true
        }) 
        export class MyComponent { }
      `;

      project.createSourceFile('foo.component.ts', dedent(component));

      const result = await migrateComponents(project, { dryRun: true });

      expect(dedent(result!)).toBe(dedent(`
        import { Component } from "@angular/core";
        import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            template: \`
            <ion-header>
              <ion-toolbar>
                <ion-title>My Component</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <ion-list>
                <ion-item>
                  <ion-label>My Item</ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
          \`,
            standalone: true,
            imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel]
        })
        export class MyComponent { }
      `));
    });

    it('should migrate components using external templates', async () => {
      const project = new Project();

      const component = `
      import { Component } from "@angular/core";

        @Component({
          selector: 'my-component',
          templateUrl: './my-component.component.html',
          standalone: true
        }) 
        export class MyComponent { }
      `;

      const template = `
      <ion-header>
        <ion-toolbar>
          <ion-title>My Component</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item>
            <ion-label>My Item</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
      `;

      project.createSourceFile('foo.component.ts', dedent(component));
      project.createSourceFile('foo.component.html', dedent(template));

      const result = await migrateComponents(project, { dryRun: true });

      expect(dedent(result!)).toBe(dedent(`
        import { Component } from "@angular/core";
        import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            templateUrl: './my-component.component.html',
            standalone: true,
            imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel]
        })
        export class MyComponent { }
      `));
    });

    it.only('should detect and import icons used in the template', async () => {
      const project = new Project();

      const component = `
        import { Component } from "@angular/core";

        @Component({
          selector: 'my-component',
          template: '<ion-icon name="logo-ionic"></ion-icon>',
          standalone: true
        }) 
        export class MyComponent { }
      `;

      project.createSourceFile('foo.component.ts', dedent(component));

      const result = await migrateComponents(project, { dryRun: true });

      expect(dedent(result!)).toBe(dedent(`
        import { Component } from "@angular/core";
        import { addIcons } from "ionicons";
        import { logoIonic } from "ionicons/icons";
        import { IonIcon } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            template: '<ion-icon name="logo-ionic"></ion-icon>',
            standalone: true,
            imports: [IonIcon]
        })
        export class MyComponent {
            constructor() {
                addIcons({ logoIonic });
            }
        }
      `));
    });

  });


});