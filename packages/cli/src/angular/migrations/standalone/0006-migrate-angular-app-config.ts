import type { ObjectLiteralExpression, Project, SourceFile } from "ts-morph";
import { SyntaxKind } from "ts-morph";
import type { CliOptions } from "../../../types/cli-options";
import { saveFileChanges } from "../../utils/log-utils";
import { migrateProvideIonicAngularImportDeclarations } from "../../utils/ionic-utils";

export const migrateAngularAppConfig = async (
  project: Project,
  cliOptions: CliOptions,
) => {
  const sourceFile = project
    .getSourceFiles()
    .find((sourceFile) => sourceFile.getFilePath().endsWith("app.config.ts"));

  if (sourceFile === undefined) {
    return;
  }

  const appConfigVariableStatement = sourceFile
    .getVariableStatements()
    .find((variableStatement) => {
      const declarationList = variableStatement.getDeclarationList();
      const variableDeclaration = declarationList.getDeclarations()[0];
      return variableDeclaration.getName() === "appConfig";
    });

  if (appConfigVariableStatement === undefined) {
    return;
  }

  const appConfigVariableStatementDeclarationList =
    appConfigVariableStatement.getDeclarationList();
  const appConfigVariableDeclaration =
    appConfigVariableStatementDeclarationList.getDeclarations()[0];
  const appConfigInitializer = appConfigVariableDeclaration.getInitializer();
  if (appConfigInitializer === undefined) {
    return;
  }

  const appConfigObjectLiteralExpression =
    appConfigInitializer as ObjectLiteralExpression;
  const providersPropertyAssignment =
    appConfigObjectLiteralExpression.getProperty("providers");
  if (providersPropertyAssignment === undefined) {
    return;
  }

  const providersArray = providersPropertyAssignment.getFirstChildByKind(
    SyntaxKind.ArrayLiteralExpression,
  );

  if (providersArray === undefined) {
    return;
  }

  const importProvidersFromFunctionCall = providersArray
    .getChildrenOfKind(SyntaxKind.CallExpression)
    .find((callExpression) => {
      const identifier = callExpression.getFirstChildByKind(
        SyntaxKind.Identifier,
      );
      return (
        identifier !== undefined &&
        identifier.getText() === "importProvidersFrom"
      );
    });

  if (importProvidersFromFunctionCall === undefined) {
    return;
  }

  const importProvidersFromFunctionCallIdentifier =
    importProvidersFromFunctionCall.getFirstChildByKind(SyntaxKind.Identifier);

  if (importProvidersFromFunctionCallIdentifier === undefined) {
    return;
  }

  if (
    importProvidersFromFunctionCallIdentifier.getText() !==
    "importProvidersFrom"
  ) {
    return;
  }

  const importProvidersFromFunctionCallArguments =
    importProvidersFromFunctionCall.getArguments();

  if (importProvidersFromFunctionCallArguments.length === 0) {
    return;
  }

  const importProvidersFromFunctionCallIonicModuleForRootCallExpression =
    importProvidersFromFunctionCallArguments.find((argument) => {
      return argument.getText().includes("IonicModule.forRoot");
    });

  if (
    importProvidersFromFunctionCallIonicModuleForRootCallExpression ===
    undefined
  ) {
    return;
  }

  if (
    importProvidersFromFunctionCallIonicModuleForRootCallExpression.isKind(
      SyntaxKind.CallExpression,
    )
  ) {
    const importProvidersFromFunctionCallIonicModuleForRootCallExpressionArguments =
      importProvidersFromFunctionCallIonicModuleForRootCallExpression.getArguments();
    const ionicConfigObjectLiteralExpression =
      importProvidersFromFunctionCallIonicModuleForRootCallExpressionArguments[0];

    const ionicConfigValue = ionicConfigObjectLiteralExpression
      ? ionicConfigObjectLiteralExpression.getText()
      : "";

    providersArray.addElement(`provideIonicAngular(${ionicConfigValue})`);

    // Remove the IonicModule.forRoot from the importProvidersFrom function call.
    importProvidersFromFunctionCall.removeArgument(
      importProvidersFromFunctionCallIonicModuleForRootCallExpression,
    );

    if (importProvidersFromFunctionCall.getArguments().length === 0) {
      // If there are no remaining arguments, remove the importProvidersFrom function call.
      providersArray.removeElement(importProvidersFromFunctionCall);
    }

    providersArray.formatText();

    migrateProvideIonicAngularImportDeclarations(sourceFile);

    return await saveFileChanges(sourceFile, cliOptions);
  }
};
