import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { CliOptions } from "../../../types/cli-options";

// @ts-ignore
import { parse } from "@angular-eslint/template-parser";
import {
  deleteFromDecoratorArgArray,
  getDecoratorArgument,
} from "../../utils/decorator-utils";

import { log } from "@clack/prompts";
import {
  addImportToComponentDecorator,
  addImportToNgModuleDecorator,
  findComponentTypescriptFileForTemplateFile,
  findNgModuleClassForComponent,
  getAngularComponentDecorator,
  isAngularComponentClass,
  isAngularComponentStandalone,
  removeImportFromComponentDecorator,
} from "../../utils/angular-utils";
import { IONIC_COMPONENTS } from "../../utils/ionic-utils";
import {
  kebabCaseToCamelCase,
  kebabCaseToPascalCase,
} from "../../utils/string-utils";
import {
  addImportToClass,
  getOrCreateConstructor,
  removeImportFromClass,
} from "../../utils/typescript-utils";
import { saveFileChanges } from "../../utils/log-utils";

export const migrateComponents = async (
  project: Project,
  cliOptions: CliOptions,
) => {
  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().endsWith(".html")) {
      const htmlAsString = sourceFile.getFullText();

      const {
        skippedIconsHtml,
        ionIcons,
        ionicComponents,
        hasRouterLink,
        hasRouterLinkWithHref,
      } = detectIonicComponentsAndIcons(htmlAsString, sourceFile.getFilePath());

      if (ionicComponents.length > 0 || ionIcons.length > 0) {
        const tsSourceFile =
          findComponentTypescriptFileForTemplateFile(sourceFile);

        if (tsSourceFile) {
          await migrateAngularComponentClass(
            tsSourceFile,
            ionicComponents,
            ionIcons,
            skippedIconsHtml,
            hasRouterLink,
            hasRouterLinkWithHref,
            cliOptions,
          );

          await saveFileChanges(tsSourceFile, cliOptions);
        }
      }
    } else if (sourceFile.getFilePath().endsWith(".ts")) {
      const templateAsString = getComponentTemplateAsString(sourceFile);
      if (templateAsString) {
        const {
          skippedIconsHtml,
          ionIcons,
          ionicComponents,
          hasRouterLink,
          hasRouterLinkWithHref,
        } = detectIonicComponentsAndIcons(
          templateAsString,
          sourceFile.getFilePath(),
        );

        await migrateAngularComponentClass(
          sourceFile,
          ionicComponents,
          ionIcons,
          skippedIconsHtml,
          hasRouterLink,
          hasRouterLinkWithHref,
          cliOptions,
        );

        if (ionicComponents.length > 0 || ionIcons.length > 0) {
          await saveFileChanges(sourceFile, cliOptions);
        }
      }
    }
  }
};

async function migrateAngularComponentClass(
  sourceFile: SourceFile,
  ionicComponents: string[],
  ionIcons: string[],
  skippedIconsHtml: string[],
  hasRouterLink: boolean,
  hasRouterLinkWithHref: boolean,
  cliOptions: CliOptions,
) {
  let ngModuleSourceFile: SourceFile | undefined;
  let modifiedNgModule = false;

  if (!isAngularComponentStandalone(sourceFile)) {
    ngModuleSourceFile = findNgModuleClassForComponent(sourceFile);
  }

  const hasIcons = ionIcons.length > 0;

  if (hasIcons) {
    addImportToClass(sourceFile, "addIcons", "ionicons");

    for (const ionIcon of ionIcons) {
      const iconName = kebabCaseToCamelCase(ionIcon);
      addImportToClass(sourceFile, iconName, "ionicons/icons");
    }

    insertAddIconsIntoConstructor(
      sourceFile,
      ionIcons.map((i) => kebabCaseToCamelCase(i)),
    );
  }

  if (hasRouterLink) {
    addImportToClass(sourceFile, "IonRouterLink", "@ionic/angular/standalone");
    addImportToComponentDecorator(sourceFile, "IonRouterLink");
  }

  if (hasRouterLinkWithHref) {
    addImportToClass(
      sourceFile,
      "IonRouterLinkWithHref",
      "@ionic/angular/standalone",
    );
    addImportToComponentDecorator(sourceFile, "IonRouterLinkWithHref");
  }

  for (const ionicComponent of ionicComponents) {
    if (isAngularComponentStandalone(sourceFile)) {
      const componentClassName = kebabCaseToPascalCase(ionicComponent);
      addImportToComponentDecorator(sourceFile, componentClassName);
      removeImportFromComponentDecorator(sourceFile, "IonicModule");
      removeImportFromClass(sourceFile, "IonicModule", "@ionic/angular");
      addImportToClass(
        sourceFile,
        componentClassName,
        "@ionic/angular/standalone",
      );
      /**
       * This removes the import from the class, if it is present.
       * An example where it may exist is when the developer has
       * a @ViewChild decorator that references an ionic component.
       */
      removeImportFromClass(sourceFile, componentClassName, "@ionic/angular");
    } else if (ngModuleSourceFile) {
      const componentClassName = kebabCaseToPascalCase(ionicComponent);

      addImportToClass(
        ngModuleSourceFile,
        componentClassName,
        "@ionic/angular/standalone",
      );
      addImportToNgModuleDecorator(ngModuleSourceFile, componentClassName);

      removeIonicModuleFromNgModule(ngModuleSourceFile);

      modifiedNgModule = true;
    }
  }

  if (skippedIconsHtml.length > 0) {
    log.warning("--------------------------------------------------");
    log.warning(
      `Dynamic ion-icon name detected in component template: ${sourceFile.getFilePath()}`,
    );
    log.warning(`Ionic is unable to automatically migrate these icons.`);
    log.warning(
      `You will need to manually import these icons into your component:`,
    );

    for (const skippedIcon of skippedIconsHtml) {
      log.warning(`\t${skippedIcon}`);
    }

    log.warning("--------------------------------------------------");
  }

  if (modifiedNgModule && ngModuleSourceFile) {
    await saveFileChanges(ngModuleSourceFile, cliOptions);
  }
}

function removeIonicModuleFromNgModule(ngModuleSourceFile: SourceFile) {
  const ionicModuleImportDeclaration =
    ngModuleSourceFile.getImportDeclaration("@ionic/angular");

  const ionicModuleImportSpecifier = ionicModuleImportDeclaration
    ?.getNamedImports()
    .find((n) => n.getName() === "IonicModule");

  if (ionicModuleImportSpecifier) {
    // Remove the IonicModule import specifier.
    ionicModuleImportSpecifier.remove();
  }
  if (ionicModuleImportDeclaration?.getNamedImports().length === 0) {
    // Remove the entire import statement if there are no more named imports.
    ionicModuleImportDeclaration.remove();
  }

  const ngModuleDecorator = ngModuleSourceFile
    .getClasses()[0]
    .getDecorator("NgModule");

  if (ngModuleDecorator) {
    deleteFromDecoratorArgArray(ngModuleDecorator, "imports", "IonicModule");
    deleteFromDecoratorArgArray(ngModuleDecorator, "exports", "IonicModule");
  }
}

function insertAddIconsIntoConstructor(
  sourceFile: SourceFile,
  icons: string[],
) {
  const constructor = getOrCreateConstructor(sourceFile);
  constructor.addStatements(`addIcons({ ${icons.join(", ")} });`);
}

function detectIonicComponentsAndIcons(htmlAsString: string, filePath: string) {
  const ast = parse(htmlAsString, { filePath });
  const nodes = ast.templateNodes;

  const ionicComponents: string[] = [];
  const ionIcons: string[] = [];
  const skippedIconsHtml: string[] = [];

  let hasRouterLinkWithHref = false;
  let hasRouterLink = false;

  const recursivelyFindIonicComponents = (node: any) => {
    if (node.type === "Element$1" || node.type === "Template") {
      const tagName = node.type === "Template" ? node.tagName : node.name;

      if (IONIC_COMPONENTS.includes(tagName)) {
        if (!ionicComponents.includes(tagName)) {
          ionicComponents.push(tagName);
        }

        const routerLink =
          node.attributes.find(
            (a: any) =>
              a.name === "routerLink" ||
              a.name == "routerDirection" ||
              a.name === "routerAction",
          ) !== undefined;

        if (!hasRouterLink && routerLink) {
          hasRouterLink = true;
        }
      }

      if (node.name === "ion-icon") {
        const staticNameAttribute = node.attributes.find(
          (a: any) => a.name === "name" || a.name === "icon",
        );

        if (staticNameAttribute) {
          const iconName = staticNameAttribute.value;
          if (!ionIcons.includes(iconName)) {
            ionIcons.push(iconName);
          }
        } else {
          const boundNameAttribute = node.inputs.find(
            (a: any) => a.name === "name" || a.name === "icon",
          );

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

      if (node.name === "a") {
        const routerLinkWithHref =
          node.attributes.find(
            (a: any) =>
              a.name === "routerLink" ||
              a.name == "routerDirection" ||
              a.name === "routerAction",
          ) !== undefined;

        if (!hasRouterLinkWithHref && routerLinkWithHref) {
          hasRouterLinkWithHref = true;
        }
      }

      if (node.children.length > 0) {
        for (const childNode of node.children) {
          recursivelyFindIonicComponents(childNode);
        }
      }
    } else if (node.type === "IfBlock") {
      for (const branch of node.branches) {
        for (const childNode of branch.children) {
          recursivelyFindIonicComponents(childNode);
        }
      }
    } else if (node.type === "ForLoopBlock") {
      for (const childNode of node.children) {
        recursivelyFindIonicComponents(childNode);
      }
    } else if (node.type === "SwitchBlock") {
      for (const c of node.cases) {
        for (const childNode of c.children) {
          recursivelyFindIonicComponents(childNode);
        }
      }
    } else if (node.type === "DeferredBlock") {
      if (node.children) {
        for (const childNode of node.children) {
          recursivelyFindIonicComponents(childNode);
        }
      }

      for (const childKey of Object.keys(node)) {
        if (node[childKey]?.children) {
          for (const childNode of node[childKey].children) {
            recursivelyFindIonicComponents(
              Object.assign(childNode, {
                type: childNode.constructor.name,
              }),
            );
          }
        }
      }
    }
  };

  for (const node of nodes) {
    recursivelyFindIonicComponents(node);
  }

  return {
    ionicComponents,
    ionIcons,
    skippedIconsHtml,
    hasRouterLinkWithHref,
    hasRouterLink,
  };
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
    const templatePropertyAssignment = getDecoratorArgument(
      componentDecorator,
      "template",
    );

    if (!templatePropertyAssignment) {
      return;
    }

    // Usage: template: ``
    const templateLiteral = templatePropertyAssignment
      .getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral)[0]
      ?.getLiteralValue();

    if (templateLiteral) {
      return templateLiteral;
    }

    // Usage: template: ""
    const stringLiteral = templatePropertyAssignment
      .getDescendantsOfKind(SyntaxKind.StringLiteral)[0]
      ?.getLiteralText();

    return stringLiteral;
  }
}
