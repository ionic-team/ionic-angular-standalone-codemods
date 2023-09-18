import { type Project } from "ts-morph";
import type { CliOptions } from "../../../types/cli-options";
import { saveFileChanges } from "../../utils/log-utils";

/**
 * Migrates the assets in angular.json to remove copying the ionicons svg assets.
 */
export const migrateAngularJsonAssets = async (project: Project, cliOptions: CliOptions) => {

  const angularJsonSourceFile = project.getSourceFiles().find((sourceFile) => sourceFile.getFilePath().endsWith("angular.json"));

  if (angularJsonSourceFile === undefined) {
    return;
  }

  const angularJson = JSON.parse(angularJsonSourceFile.getText());

  for (const project of Object.keys(angularJson.projects)) {
    const assets = angularJson.projects[project].architect.build.options.assets as string[];
    const assetsToRemove = assets.filter((asset: string | any) => {
      return typeof asset === 'object' && asset.input === 'node_modules/ionicons/dist/ionicons/svg';
    });

    assetsToRemove.forEach((assetToRemove) => {
      const index = assets.indexOf(assetToRemove);
      assets.splice(index, 1);
    });

  }

  angularJsonSourceFile.replaceWithText(JSON.stringify(angularJson, null, 2));

  await saveFileChanges(angularJsonSourceFile, cliOptions);

}