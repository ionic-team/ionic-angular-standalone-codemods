import { describe, expect, it } from "vitest";
import { Project } from "ts-morph";
import { dedent } from "ts-dedent";

import { migrateImportStatements } from "./0004-migrate-import-statements";

describe("migrateImportStatements", () => {
  it("should migrate import statements", async () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const service = dedent(`
      import { Injectable } from '@angular/core';
      import { ModalController } from '@ionic/angular';

      @Injectable()
      export class MyService {
        constructor(private modalController: ModalController) { }
      }
    `);

    const serviceSourceFile = project.createSourceFile(
      "my.service.ts",
      service,
    );

    await migrateImportStatements(project, { dryRun: false });

    expect(dedent(serviceSourceFile.getText())).toBe(
      dedent(`
      import { Injectable } from '@angular/core';
      import { ModalController } from '@ionic/angular/standalone';

      @Injectable()
      export class MyService {
          constructor(private modalController: ModalController) { }
      }
    `),
    );
  });
});
