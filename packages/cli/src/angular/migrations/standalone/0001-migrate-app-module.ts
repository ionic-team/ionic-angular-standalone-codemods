import { Project, SyntaxKind, ts } from "ts-morph";
import { CliOptions } from "../../../types/cli-options";

import { saveFileChanges } from "../../utils/log-utils";

export const migrateAppModule = async (
  project: Project,
  cliOptions: CliOptions,
) => {
  const appModule = project.getSourceFile("app.module.ts");

  if (appModule === undefined) {
    // If the project does not have an app.module.ts file, do nothing.
    return;
  }

  /**
   * Steps for migrating an @ionic/angular application to @ionic/angular/standalone:
   *
   * 1. Migrate the import statement for @ionic/angular to @ionic/angular/standalone.
   * 2. Remove the IonicModule from the import statement.
   * 3. Add provideIonicAngular to the import statement.
   * 4. Remove the IonicModule from the imports array in the NgModule decorator.
   * 5. Add the provideIonicAngular to the providers array in the NgModule decorator.
   */

  const importDeclaration = appModule.getImportDeclaration("@ionic/angular");

  if (!importDeclaration) {
    // If the @ionic/angular import does not exist, then this is not an @ionic/angular application.
    // This migration only applies to @ionic/angular applications.
    return;
  }

  // Update the import statement to import from @ionic/angular/standalone.
  importDeclaration.setModuleSpecifier("@ionic/angular/standalone");

  const namedImports = importDeclaration.getNamedImports();
  const importSpecifier = namedImports.find(
    (n) => n.getName() === "IonicModule",
  );

  if (importSpecifier) {
    // Remove the IonicModule import specifier.
    importSpecifier.remove();
  }

  // Add the provideIonicAngular import specifier.
  importDeclaration.addNamedImport("provideIonicAngular");

  const ngModuleDecorator = appModule
    .getClass("AppModule")
    ?.getDecorator("NgModule");

  if (!ngModuleDecorator) {
    // If the AppModule class does not have an NgModule decorator, do nothing.
    return;
  }

  const ngModuleDecoratorArguments = ngModuleDecorator.getArguments()[0];

  const importsProperty = ngModuleDecoratorArguments
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((n) => n.compilerNode.name.getText() === "imports");

  // The IonicModule.forRoot() call expression (the Ionic Config).
  let ionicModuleForRootCallExpression: ts.CallExpression | undefined;

  if (importsProperty) {
    const importsPropertyAssignment = importsProperty.getInitializerIfKind(
      SyntaxKind.ArrayLiteralExpression,
    );

    if (importsPropertyAssignment) {
      const ionicModule = importsPropertyAssignment.getElements().find((e) => {
        if (ts.isCallExpression(e.compilerNode)) {
          const identifier = e.compilerNode.expression as ts.Identifier;
          if (identifier.getText() === "IonicModule.forRoot") {
            return true;
          }
        }
        return false;
      });

      if (ionicModule) {
        // Cache the Ionic config value to pass to provideIonicAngular.
        ionicModuleForRootCallExpression =
          ionicModule.compilerNode as ts.CallExpression;
        // Remove IonicModule.forRoot() from the imports array.
        importsPropertyAssignment.removeElement(ionicModule);
      }
    }
  }

  let providersProperty = ngModuleDecoratorArguments
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((n) => n.compilerNode.name.getText() === "providers");

  if (!providersProperty) {
    // If the NgModule decorator does not have a providers property, create one.
    providersProperty = ngModuleDecoratorArguments
      .asKind(SyntaxKind.ObjectLiteralExpression)!
      .addPropertyAssignment({
        name: "providers",
        initializer: "[]",
      });
  }

  const providersPropertyAssignment = providersProperty.getInitializerIfKind(
    SyntaxKind.ArrayLiteralExpression,
  );
  // Add the provideIonicAngular with the developer's Ionic config to the providers array.
  providersPropertyAssignment?.addElement(
    `provideIonicAngular(${ionicModuleForRootCallExpression?.arguments
      ?.map((a) => a.getText())
      .join(", ")})`,
  );

  return await saveFileChanges(appModule, cliOptions);
};
