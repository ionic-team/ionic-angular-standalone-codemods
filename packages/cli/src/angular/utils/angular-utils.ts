import { SyntaxKind, type SourceFile, ts } from "ts-morph";
import { deleteFromDecoratorArgArray, getDecoratorArgument, insertIntoDecoratorArgArray } from "./decorator-utils";


/**
 * Finds the NgModule class that declares a given component.
 * 
 * For example, if the source file is a component called `MyComponent`,
 * this function will find the declaring NgModule class, for example `MyComponentModule`.
 * It does this by finding the NgModule that declares the component in its `declarations` array.
 * 
 * @param sourceFile The component source file to find the NgModule class for.
 */
export function findNgModuleClassForComponent(sourceFile: SourceFile) {
  const componentClassName = sourceFile.getClasses()[0]?.getName();

  if (!componentClassName) {
    return;
  }

  const sourceFiles = sourceFile.getProject().getSourceFiles();

  const ngModuleClass = sourceFiles.find(f => {
    const ngModuleDecorator = f.getClasses()[0]?.getDecorator('NgModule');

    if (!ngModuleDecorator) {
      return false;
    }

    const declarationsProperty = getDecoratorArgument(ngModuleDecorator, 'declarations');

    if (!declarationsProperty) {
      return false;
    }

    const declarationsArray = declarationsProperty.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);

    if (!declarationsArray) {
      return false;
    }

    const componentClass = declarationsArray.getElements().find(e => {
      const identifier = e.compilerNode as ts.Identifier;
      return identifier.getText() === componentClassName;
    });

    if (!componentClass) {
      return false;
    }

    return true;
  });

  return ngModuleClass;
}

/**
 * Finds the Angular component class for a given template file. 
 * @param templateFile The template file to find the component class for.
 */
export function findComponentTypescriptFileForTemplateFile(templateFile: SourceFile) {
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

    // TODO could make this even more accurate by 
    // checking if the templateUrl matches the templateFile.

    return true;
  });

  return componentTypescriptFile;
}


/**
 * Adds a new import to the imports array in the Component decorator.
 * @param sourceFile The source file to add the import to.
 * @param importName The name of the import to add.
 */
export function addImportToComponentDecorator(sourceFile: SourceFile, importName: string) {
  if (!isAngularComponentStandalone(sourceFile)) {
    console.warn('[Ionic Dev] Cannot add import to component decorator. Component is not standalone.');
    return;
  }

  const componentDecorator = getAngularComponentDecorator(sourceFile)!;

  insertIntoDecoratorArgArray(componentDecorator, 'imports', importName);

  sourceFile.formatText();
}

/**
 * Adds a new import to the imports array in the NgModule decorator.
 * @param sourceFile The source file to add the import to. 
 * @param importName The name of the import to add.
 */
export const addImportToNgModuleDecorator = (sourceFile: SourceFile, importName: string) => {
  const ngModuleDecorator = getAngularNgModuleDecorator(sourceFile);

  if (ngModuleDecorator) {
    insertIntoDecoratorArgArray(ngModuleDecorator, 'imports', importName);

    sourceFile.formatText();
  }
}

export const removeImportFromNgModuleDecorator = (sourceFile: SourceFile, importName: string) => {
  const ngModuleDecorator = getAngularNgModuleDecorator(sourceFile);

  if (ngModuleDecorator) {
    deleteFromDecoratorArgArray(ngModuleDecorator, 'imports', importName);
  }
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

/**
 * Returns the Angular NgModule decorator.
 * @param sourceFile The source file to check.
 */
export function getAngularNgModuleDecorator(sourceFile: SourceFile) {
  const ngModuleDecorator = sourceFile.getClasses()[0]?.getDecorator('NgModule');
  return ngModuleDecorator;
}