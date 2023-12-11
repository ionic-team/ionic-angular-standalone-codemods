import type { Project } from "ts-morph";
import type { CliOptions } from "../../../types/cli-options";

import { saveFileChanges } from "../../utils/log-utils";
import { removeImportFromNgModuleDecorator } from "../../utils/angular-utils";

export const migrateImportStatements = async (
  project: Project,
  cliOptions: CliOptions,
) => {
    // Get all typescript source files in the project and update any @ionic/angular imports to @ionic/angular/standalone
    for (const sourceFile of project.getSourceFiles()) {
        if (!sourceFile.getFilePath().endsWith('.ts')) {
            continue;
        }

        let hasChanges = false;

        const importDeclarations = sourceFile.getImportDeclarations();
        importDeclarations.forEach((importDeclaration) => {
            const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
            if (moduleSpecifier === "@ionic/angular") {
                importDeclaration.setModuleSpecifier("@ionic/angular/standalone");

                const namedImports = importDeclaration.getNamedImports();
                const importSpecifier = namedImports.find(
          (n) => n.getName() === "IonicModule",
        );

                if (importSpecifier) {
                    if (namedImports.length > 1) {
                        // Remove the IonicModule import specifier.
                        importSpecifier.remove();
                    } else {
                        // If this is the only import specifier, remove the entire import declaration.
                        importDeclaration.remove();
                    }
                    removeImportFromNgModuleDecorator(sourceFile, "IonicModule");
                }

                hasChanges = true;
            }
        });

        if (hasChanges) {
            await saveFileChanges(sourceFile, cliOptions);
        }
    }
};
