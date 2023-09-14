import { SchematicContext, Tree } from "@angular-devkit/schematics";
import { tsquery } from "@phenomnomnominal/tsquery";
import ts from 'typescript';
import { createImportStatement } from "../../../../utils/typescript";

import { Project } from 'ts-morph';


export const migrateStandaloneMainTs = (tree: Tree, context: SchematicContext) => {
  tree.getDir('src').visit((path) => {
    /**
     * Angular Standalone applications configure their bootstrap process in main.ts.
     * Prior to using Ionic's standalone support, the main.ts file would look something like this:
     * 
     * ```ts
     * bootstrapApplication(AppComponent, {
     *  providers: importProvidersFrom(IonicModule.forRoot({ mode: 'md' }))
     * });
     * ```
     * 
     * After using Ionic's standalone support, the main.ts file would look something like this:
     * ```ts
     * bootstrapApplication(AppComponent, {
     *  providers: [provideIonicAngular({ mode: 'md' })]
     * });
     * ```
     */
    console.log('path', path);
    if (path === 'main.ts') {
      // const sourceText = tree.readText(path);

      const project = new Project();

      const sourceFile = project.addSourceFileAtPath(path);

      const bootstrapApplication = sourceFile.getFunction('bootstrapApplication');

      if (bootstrapApplication === undefined) {
        context.logger.info('Doesnt exist');
        return;
      }

      context.logger.info('YAY');
      return 'foo';


      // if (migrateBootstrapApplication(sourceText, context)) {
      //   context.logger.info(`Writing changes to: ${path}`);
      //   tree.overwrite(path, sourceText); // todo replace sourceText with new content.
      // }
    }
  });
}

// export const migrateBootstrapApplication = (sourceText: string, context: SchematicContext) => {
//   const sourceFile = tsquery.ast(sourceText);
//   if (tsquery(sourceFile, 'CallExpression > Identifier[name="bootstrapApplication"]').length === -1) {
//     /**
//      * If the file does not contain the bootstrapApplication function, then it is either
//      * not a standalone application or it is another file in the user's project named main.ts.
//      */
//     return false;
//   }

//   context.logger.debug('Migrating bootstrapApplication to use provideIonicAngular...');

//   /**
//    * Do the following:
//    * 1. Add a new import statement for import { provideIonicAngular } from '@ionic/angular/standalone';
//    * 2. Remove the import statement for IonicModule. 
//    * 3. Replace the providers array with a call to provideIonicAngular instead of importProvidersFrom.
//    * 4. Remove the importProvidersFrom import specifier if it is no longer used.
//    */


//   createImportStatement('@ionic/angular/standalone', ts.factory.createNamedImports([
//     ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('provideIonicAngular'))
//   ]), sourceText);

//   // 1. Add a new import statement for provideIonicAngular from @ionic/angular/standalone.
//   // const importPath = '@ionic/angular/standalone';
//   // const namedImports = tsquery(
//   //   sourceFile,
//   //   'ImportDeclaration > ImportSpecifier > Identifier[name="importProvidersFrom"]'
//   // ) as ts.NamedImports;
//   // const importStatement = createImportStatement(importPath, namedImports, sourceText, sourceFile.scriptKind);

// }