import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { CliOptions } from "../../../types/cli-options";

// @ts-ignore
import { parse } from '@angular-eslint/template-parser';
import { getDecoratorArgument } from "../../utils/decorator-utils";

import * as p from '@clack/prompts';
import { addImportToComponentDecorator, addImportToNgModuleDecorator, findComponentTypescriptFileForTemplateFile, findNgModuleClassForComponent, getAngularComponentDecorator, isAngularComponentClass, isAngularComponentStandalone } from "../../utils/angular-utils";
import { IONIC_COMPONENTS } from "../../utils/ionic-utils";
import { toCamelCase, toPascalCase } from "../../utils/string-utils";
import { addImportToClass, getOrCreateConstructor } from "../../utils/typescript-utils";
import { saveFileChanges } from "../../utils/log-utils";


export const parseAngularComponentTemplates = (directory: string, cliOptions: CliOptions) => {
  const sourceDirectory = `${directory}/src`;
  const project = new Project({ libFolderPath: sourceDirectory });

  project.addSourceFilesAtPaths(`${sourceDirectory}/**/*.html`);
  project.addSourceFilesAtPaths(`${sourceDirectory}/**/*.ts`);

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().endsWith('.html')) {
      const htmlAsString = sourceFile.getFullText();

      const { skippedIconsHtml, ionIcons, ionicComponents } = detectIonicComponentsAndIcons(htmlAsString, sourceFile.getFilePath());

      if (ionicComponents.length > 0 || ionIcons.length > 0) {
        const tsSourceFile = findComponentTypescriptFileForTemplateFile(sourceFile);

        if (tsSourceFile) {
          migrateAngularComponentClass(tsSourceFile, ionicComponents, ionIcons, skippedIconsHtml, cliOptions);

          saveFileChanges(tsSourceFile, cliOptions);
        }
      }
    } else if (sourceFile.getFilePath().endsWith('.ts')) {
      const templateAsString = getComponentTemplateAsString(sourceFile);
      if (templateAsString) {
        const { skippedIconsHtml, ionIcons, ionicComponents } = detectIonicComponentsAndIcons(templateAsString, sourceFile.getFilePath());

        migrateAngularComponentClass(sourceFile, ionicComponents, ionIcons, skippedIconsHtml, cliOptions);

        if (ionicComponents.length > 0 || ionIcons.length > 0) {
          saveFileChanges(sourceFile, cliOptions);
        }
      }
    }
  }
}

function migrateAngularComponentClass(sourceFile: SourceFile, ionicComponents: string[], ionIcons: string[], skippedIconsHtml: string[], cliOptions: CliOptions) {
  let ngModuleSourceFile: SourceFile | undefined;
  let modifiedNgModule = false;

  if (!isAngularComponentStandalone(sourceFile)) {
    ngModuleSourceFile = findNgModuleClassForComponent(sourceFile);
  }

  const hasIcons = ionIcons.length > 0;

  if (hasIcons) {
    addImportToClass(sourceFile, 'addIcons', 'ionicons');

    for (const ionIcon of ionIcons) {
      const iconName = toCamelCase(ionIcon);
      addImportToClass(sourceFile, iconName, 'ionicons/icons');
    }

    insertAddIconsIntoConstructor(sourceFile, ionIcons.map(i => toCamelCase(i)));
  }

  for (const ionicComponent of ionicComponents) {
    if (isAngularComponentStandalone(sourceFile)) {
      const componentClassName = toPascalCase(ionicComponent);
      addImportToComponentDecorator(sourceFile, componentClassName);
      addImportToClass(sourceFile, componentClassName, '@ionic/angular/standalone');
    } else if (ngModuleSourceFile) {
      const componentClassName = toPascalCase(ionicComponent);

      addImportToClass(ngModuleSourceFile, componentClassName, '@ionic/angular/standalone');
      addImportToNgModuleDecorator(ngModuleSourceFile, componentClassName);

      modifiedNgModule = true;
    }
  }

  if (skippedIconsHtml.length > 0) {
    p.log.warning('--------------------------------------------------');
    p.log.warning(`Dynamic ion-icon name detected in component template: ${sourceFile.getFilePath()}`);
    p.log.warning(`Ionic is unable to automatically migrate these icons.`);
    p.log.warning(`You will need to manually import these icons into your component:`);

    for (const skippedIcon of skippedIconsHtml) {
      p.log.warning(`\t${skippedIcon}`);
    }

    p.log.warning('--------------------------------------------------');
  }

  if (modifiedNgModule && ngModuleSourceFile) {
    saveFileChanges(ngModuleSourceFile, cliOptions);
  }
}

function insertAddIconsIntoConstructor(sourceFile: SourceFile, icons: string[]) {
  const constructor = getOrCreateConstructor(sourceFile);
  constructor.addStatements(`addIcons({ ${icons.join(', ')} });`);
}

function detectIonicComponentsAndIcons(htmlAsString: string, filePath: string) {
  const ast = parse(htmlAsString, { filePath });
  const nodes = ast.templateNodes;

  const ionicComponents: string[] = [];
  const ionIcons: string[] = [];
  const skippedIconsHtml: string[] = [];

  const recursivelyFindIonicComponents = (node: any) => {
    if (node.type === 'Element$1') {

      if (IONIC_COMPONENTS.includes(node.name)) {
        if (!ionicComponents.includes(node.name)) {
          ionicComponents.push(node.name);
        }
      }

      if (node.name === 'ion-icon') {
        // TODO need to check for <ion-icon icon="user"></ion-icon as well.
        const staticNameAttribute = node.attributes.find((a: any) => a.name === 'name');

        if (staticNameAttribute) {
          const iconName = staticNameAttribute.value;
          if (!ionIcons.includes(iconName)) {
            ionIcons.push(iconName);
          }
        } else {
          const boundNameAttribute = node.inputs.find((a: any) => a.name === 'name');

          if (boundNameAttribute) {
            const skippedIcon = node.sourceSpan.toString();

            const iconNameRegex = /{{\s*'([^']+)'\s*}}/;
            /**
             * Attempt to find the icon name from the bound name attribute
             * when the developer has a template like this:
             * <ion-icon name="'user'"></ion-icon>
             */
            const iconNameMatch = skippedIcon.match(iconNameRegex);

            if (iconNameMatch) {
              if (!ionIcons.includes(iconNameMatch[1])) {
                ionIcons.push(iconNameMatch[1]);
              }
            } else {
              // IonIcon name is a calculated value from a variable or function.
              // We can't determine the value of the name at this time.
              // The developer will need to manually import these icons.
              skippedIconsHtml.push(skippedIcon);
            }
          }
        }
      }

      if (node.children.length > 0) {
        for (const childNode of node.children) {
          recursivelyFindIonicComponents(childNode);
        }
      }
    }
  }

  for (const node of nodes) {
    recursivelyFindIonicComponents(node);
  }

  return {
    ionicComponents,
    ionIcons,
    skippedIconsHtml
  }
}

/**
 * Returns the template string value for an Angular component.
 * 
 * For example:
 * ```
 * @Component({
 *  template: '<p>Testing</p>'
 * })
 * ```
 * 
 * Would return:
 * ```
 * <p>Testing</p>
 * ```
 * 
 * @param sourceFile The source file to parse.
 */
function getComponentTemplateAsString(sourceFile: SourceFile) {
  if (isAngularComponentClass(sourceFile)) {
    const componentDecorator = getAngularComponentDecorator(sourceFile)!;
    const templatePropertyAssignment = getDecoratorArgument(componentDecorator, 'template');

    if (!templatePropertyAssignment) {
      return;
    }

    return templatePropertyAssignment.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral)[0]?.getLiteralValue();
  }
}