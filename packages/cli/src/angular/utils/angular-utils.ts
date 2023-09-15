import { SyntaxKind, type SourceFile } from "ts-morph";
import { getDecoratorArgument, insertIntoDecoratorArgArray } from "./decorator-utils";

export function findComponentTypescriptFileForTemplateFile(templateFile: SourceFile) {
  // Given an HTML file, try to find the corresponding typescript file for the component class.
  // We can check for files in the same directory with a similar name and additionally check
  // if the matched ts file has a @Component decorator. If it does, then we can assume that
  // it is the component class for the HTML file.

  const templateFilePath = templateFile.getFilePath();
  const templateFileName = templateFile.getBaseNameWithoutExtension();

  const sourceFiles = templateFile.getProject().getSourceFiles();

  const componentTypescriptFile = sourceFiles.find(f => {
    const filePath = f.getFilePath();
    const fileName = f.getBaseNameWithoutExtension();

    if (filePath === templateFilePath) {
      return false;
    }

    if (fileName !== templateFileName) {
      return false;
    }

    if (!isAngularComponentClass(f)) {
      return false;
    }

    return true;
  });

  return componentTypescriptFile;
}


export function addImportToComponentDecorator(sourceFile: SourceFile, importName: string) {
  if (!isAngularComponentStandalone(sourceFile)) {
    console.warn('[Ionic Dev] Cannot add import to component decorator. Component is not standalone.');
    return;
  }

  const componentDecorator = getAngularComponentDecorator(sourceFile)!;

  insertIntoDecoratorArgArray(componentDecorator, 'imports', importName);
}

/**
 * Checks if the source file is an Angular component using
 * the standalone: true option in the @Component decorator.
 * @param sourceFile The source file to check. 
 */
export function isAngularComponentStandalone(sourceFile: SourceFile) {
  if (!isAngularComponentClass(sourceFile)) {
    return false;
  }

  const componentDecorator = getAngularComponentDecorator(sourceFile);
  if (!componentDecorator) {
    return false;
  }

  const standalonePropertyAssignment = getDecoratorArgument(componentDecorator, 'standalone');
  if (!standalonePropertyAssignment) {
    return false;
  }

  const standalonePropertyValue = standalonePropertyAssignment.getInitializerIfKind(SyntaxKind.TrueKeyword);

  if (!standalonePropertyValue) {
    return false;
  }

  return true;
}

/**
 * Checks if the source file is an Angular component class.
 * @param sourceFile The source file to check.
 */
export function isAngularComponentClass(sourceFile: SourceFile) {
  const componentDecorator = getAngularComponentDecorator(sourceFile);

  if (!componentDecorator) {
    return false;
  }

  const importDeclaration = sourceFile.getImportDeclaration('@angular/core');

  if (!importDeclaration) {
    return false;
  }

  const namedImports = importDeclaration.getNamedImports();
  const componentImportSpecifier = namedImports.find(n => n.getName() === 'Component');

  if (!componentImportSpecifier) {
    return false;
  }

  return true;
}

/**
 * Returns the Angular component decorator.
 * @param sourceFile The source file to check.
 */
export function getAngularComponentDecorator(sourceFile: SourceFile) {
  const componentDecorator = sourceFile.getClasses()[0]?.getDecorator('Component');
  return componentDecorator;
}