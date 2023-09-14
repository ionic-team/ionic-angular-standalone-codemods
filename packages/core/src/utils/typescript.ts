import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';

/**
 * Creates an import declaration for a TS file.
 * @param importPath The path to import from (either a relative path or a package name).
 * @param namedImports The named imports to include in the import declaration.
 * @param sourceText The source text of the file.
 * @param scriptKind The script kind of the file.
 * @returns The import declaration as a string.
 */
export const createImportStatement = (
  importPath: string,
  namedImports: ts.NamedImports,
  sourceText = '',
  scriptKind = ts.ScriptKind.TS
) => {
  const newImportDeclaration = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, undefined, namedImports),
    ts.factory.createStringLiteral(importPath),
    undefined
  );

  const resultFile = ts.createSourceFile(
    'update.tsx',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    newImportDeclaration,
    resultFile
  );

  return result;
};

/**
 * Removes the specified import specifiers from the import declaration (one or more named imports).
 * @param importDeclaration The import declaration to remove the import specifiers from.
 * @param identifiers The identifiers to remove from the import declaration.
 */
export const removeImportSpecifiers = (
  importDeclaration: ts.ImportDeclaration,
  ...identifiers: string[]
) => {
  const res = tsquery.replace(
    importDeclaration.getFullText(),
    'ImportSpecifier',
    (node) => {
      const importSpecifier = node as ts.ImportSpecifier;
      const importSpecifierName = importSpecifier.name.getText();

      if (identifiers.includes(importSpecifierName)) {
        return '';
      }
      return node.getFullText();
    }
  );
  // TODO - Remove the import declaration if there are no import specifiers left.
  return res;
};
