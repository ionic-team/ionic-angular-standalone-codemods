import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import dedent from "ts-dedent";

import { migrateComponents } from "./0002-import-standalone-component";

describe("migrateComponents", () => {
  describe("standalone angular components", () => {
    it("should migrate components using inline templates", async () => {
      const project = new Project({ useInMemoryFileSystem: true });

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

      const componentSourceFile = project.createSourceFile(
        "foo.component.ts",
        dedent(component),
      );

      await migrateComponents(project, { dryRun: false });

      expect(dedent(componentSourceFile.getText())).toBe(
        dedent(`
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
      `),
      );
    });

    it("should migrate components using external templates", async () => {
      const project = new Project({ useInMemoryFileSystem: true });

      const component = `
      import { Component } from "@angular/core";
      import { IonicModule } from "@ionic/angular";

        @Component({
          selector: 'my-component',
          templateUrl: './my-component.component.html',
          standalone: true,
          imports: [IonicModule]
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

      const componentSourceFile = project.createSourceFile(
        "foo.component.ts",
        dedent(component),
      );
      project.createSourceFile("foo.component.html", dedent(template));

      await migrateComponents(project, { dryRun: false });

      expect(dedent(componentSourceFile.getText())).toBe(
        dedent(`
        import { Component } from "@angular/core";
        import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            templateUrl: './my-component.component.html',
            standalone: true,
            imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel]
        })
        export class MyComponent { }
      `),
      );
    });

    it("should detect and import icons used in the template", async () => {
      const project = new Project({ useInMemoryFileSystem: true });

      const component = `
        import { Component } from "@angular/core";

        @Component({
          selector: 'my-component',
          template: '<ion-icon name="logo-ionic"></ion-icon>',
          standalone: true
        }) 
        export class MyComponent { }
      `;

      const componentSourceFile = project.createSourceFile(
        "foo.component.ts",
        dedent(component),
      );

      await migrateComponents(project, { dryRun: false });

      expect(dedent(componentSourceFile.getText())).toBe(
        dedent(`
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
      `),
      );
    });

    it("should remove duplicate imports from existing declarations", async () => {
      const project = new Project({ useInMemoryFileSystem: true });

      const component = `
        import { Component, ViewChild } from "@angular/core";
        import { IonContent, IonicModule } from "@ionic/angular";

        @Component({
          selector: 'my-component',
          template: '<ion-content></ion-content>',
          standalone: true,
          imports: [IonicModule]
        }) 
        export class MyComponent {
          @ViewChild(IonContent) content!: IonContent;
        }
      `;

      const componentSourceFile = project.createSourceFile(
        "foo.component.ts",
        dedent(component),
      );

      await migrateComponents(project, { dryRun: false });

      expect(dedent(componentSourceFile.getText())).toBe(
        dedent(`
        import { Component, ViewChild } from "@angular/core";
        import { IonContent } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            template: '<ion-content></ion-content>',
            standalone: true,
            imports: [IonContent]
        })
        export class MyComponent {
            @ViewChild(IonContent) content!: IonContent;
        }
      `),
      );
    });

    it("should detect Ionic components within *ngIf expressions", () => {
      const project = new Project({ useInMemoryFileSystem: true });

      const component = `
        import { Component } from "@angular/core";

        @Component({
          selector: 'my-component',
          template: \`
            <ion-header [translucent]="true">
              <ion-toolbar>
                <ion-title>*ngIf Usage</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content [fullscreen]="true">
              <ion-header collapse="condense">
                <ion-toolbar>
                  <ion-title size="large">*ngIf Usage</ion-title>
                  <ion-buttons *ngIf="isVisible">
                    <ion-button>Toggle</ion-button>
                  </ion-buttons>
                </ion-toolbar>
              </ion-header>
              <div *ngIf="isVisible">
                <ion-label>Visible</ion-label>
              </div>
            </ion-content>
          \`,
          standalone: true
        })
        export class MyComponent {
          isVisible = true;
        }
      `;

      const componentSourceFile = project.createSourceFile(
        "foo.component.ts",
        dedent(component),
      );

      migrateComponents(project, { dryRun: false });

      expect(dedent(componentSourceFile.getText())).toBe(
        dedent(`
        import { Component } from "@angular/core";
        import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonLabel } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            template: \`
            <ion-header [translucent]="true">
              <ion-toolbar>
                <ion-title>*ngIf Usage</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content [fullscreen]="true">
              <ion-header collapse="condense">
                <ion-toolbar>
                  <ion-title size="large">*ngIf Usage</ion-title>
                  <ion-buttons *ngIf="isVisible">
                    <ion-button>Toggle</ion-button>
                  </ion-buttons>
                </ion-toolbar>
              </ion-header>
              <div *ngIf="isVisible">
                <ion-label>Visible</ion-label>
              </div>
            </ion-content>
          \`,
            standalone: true,
            imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonLabel]
        })
        export class MyComponent {
            isVisible = true;
        }
      `),
      );
    });

    describe("hyperlinks", () => {
      it("should detect and import routerLink used in the template", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const component = `
          import { Component } from "@angular/core";
  
          @Component({
            selector: 'my-component',
            template: '<a routerLink="/home">Home</a>',
            standalone: true
          }) 
          export class MyComponent { }
        `;

        const componentSourceFile = project.createSourceFile(
          "foo.component.ts",
          dedent(component),
        );

        await migrateComponents(project, { dryRun: false });

        expect(dedent(componentSourceFile.getText())).toBe(
          dedent(`
          import { Component } from "@angular/core";
          import { IonRouterLinkWithHref } from "@ionic/angular/standalone";

          @Component({
              selector: 'my-component',
              template: '<a routerLink="/home">Home</a>',
              standalone: true,
              imports: [IonRouterLinkWithHref]
          })
          export class MyComponent { }
        `),
        );
      });

      it("should detect and import routerAction used in the template", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const component = `
          import { Component } from "@angular/core";
  
          @Component({
            selector: 'my-component',
            template: '<a routerAction="push">Home</a>',
            standalone: true
          }) 
          export class MyComponent { }
        `;

        const componentSourceFile = project.createSourceFile(
          "foo.component.ts",
          dedent(component),
        );

        await migrateComponents(project, { dryRun: false });

        expect(dedent(componentSourceFile.getText())).toBe(
          dedent(`
          import { Component } from "@angular/core";
          import { IonRouterLinkWithHref } from "@ionic/angular/standalone";

          @Component({
              selector: 'my-component',
              template: '<a routerAction="push">Home</a>',
              standalone: true,
              imports: [IonRouterLinkWithHref]
          })
          export class MyComponent { }
        `),
        );
      });

      it("should detect and import routerDirection used in the template", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const component = `
        import { Component } from "@angular/core";

        @Component({
          selector: 'my-component',
          template: '<a routerDirection="forward">Home</a>',
          standalone: true
        }) 
        export class MyComponent { }
      `;

        const componentSourceFile = project.createSourceFile(
          "foo.component.ts",
          dedent(component),
        );

        await migrateComponents(project, { dryRun: false });

        expect(dedent(componentSourceFile.getText())).toBe(
          dedent(`
        import { Component } from "@angular/core";
        import { IonRouterLinkWithHref } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            template: '<a routerDirection="forward">Home</a>',
            standalone: true,
            imports: [IonRouterLinkWithHref]
        })
        export class MyComponent { }
      `),
        );
      });
    });

    describe("Ionic components", () => {
      it("should detect and import routerLink used in the template", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const component = `
          import { Component } from "@angular/core";
          import { IonicModule } from "@ionic/angular";
  
          @Component({
            selector: 'my-component',
            template: '<ion-button routerLink="/home">Home</ion-button>',
            standalone: true,
            imports: [IonicModule]
          }) 
          export class MyComponent { }
        `;

        const componentSourceFile = project.createSourceFile(
          "foo.component.ts",
          dedent(component),
        );

        await migrateComponents(project, { dryRun: false });

        expect(dedent(componentSourceFile.getText())).toBe(
          dedent(`
          import { Component } from "@angular/core";
          import { IonRouterLink, IonButton } from "@ionic/angular/standalone";

          @Component({
              selector: 'my-component',
              template: '<ion-button routerLink="/home">Home</ion-button>',
              standalone: true,
              imports: [IonRouterLink, IonButton]
          })
          export class MyComponent { }
        `),
        );
      });

      it("should detect and import routerAction used in the template", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const component = `
          import { Component } from "@angular/core";
          import { IonicModule } from "@ionic/angular";
  
          @Component({
            selector: 'my-component',
            template: '<ion-button routerAction="push">Home</ion-button>',
            standalone: true,
            imports: [IonicModule]
          }) 
          export class MyComponent { }
        `;

        const componentSourceFile = project.createSourceFile(
          "foo.component.ts",
          dedent(component),
        );

        await migrateComponents(project, { dryRun: false });

        expect(dedent(componentSourceFile.getText())).toBe(
          dedent(`
          import { Component } from "@angular/core";
          import { IonRouterLink, IonButton } from "@ionic/angular/standalone";

          @Component({
              selector: 'my-component',
              template: '<ion-button routerAction="push">Home</ion-button>',
              standalone: true,
              imports: [IonRouterLink, IonButton]
          })
          export class MyComponent { }
        `),
        );
      });

      it("should detect and import routerDirection used in the template", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const component = `
        import { Component } from "@angular/core";
        import { IonicModule } from "@ionic/angular";

        @Component({
          selector: 'my-component',
          template: '<ion-button routerDirection="forward">Home</ion-button>',
          standalone: true,
          imports: [IonicModule]
        }) 
        export class MyComponent { }
      `;

        const componentSourceFile = project.createSourceFile(
          "foo.component.ts",
          dedent(component),
        );

        await migrateComponents(project, { dryRun: false });

        expect(dedent(componentSourceFile.getText())).toBe(
          dedent(`
        import { Component } from "@angular/core";
        import { IonRouterLink, IonButton } from "@ionic/angular/standalone";

        @Component({
            selector: 'my-component',
            template: '<ion-button routerDirection="forward">Home</ion-button>',
            standalone: true,
            imports: [IonRouterLink, IonButton]
        })
        export class MyComponent { }
      `),
        );
      });
    });
  });

  describe("single component angular modules", () => {
    it("should migrate angular module with Ionic components", async () => {
      const project = new Project({ useInMemoryFileSystem: true });

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
        \`
      })
      export class MyComponent { }`;
      const module = `
      import { NgModule } from "@angular/core";
      import { IonicModule } from "@ionic/angular";

      import { MyComponent } from "./foo.component";
      
      @NgModule({
        imports: [IonicModule],
        declarations: [MyComponent],
        exports: [MyComponent]
      })
      export class MyComponentModule { }
      `;

      project.createSourceFile("foo.component.ts", dedent(component));
      const moduleSourceFile = project.createSourceFile(
        "foo.module.ts",
        dedent(module),
      );

      await migrateComponents(project, { dryRun: false });

      expect(dedent(moduleSourceFile.getText())).toBe(
        dedent(`
      import { NgModule } from "@angular/core";
      import { MyComponent } from "./foo.component";
      import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from "@ionic/angular/standalone";
      
      @NgModule({
          imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel],
          declarations: [MyComponent],
          exports: [MyComponent]
      })
      export class MyComponentModule { }
      `),
      );
    });
  });
});
