import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

/**
 * Looks up the installed package version in the node_modules directory.
 *
 * @param dir The project directory.
 * @param packageName The name of the package to lookup.
 * @returns The version of the package or null if the package is not installed.
 */
export const getActualPackageVersion = async (
  dir: string,
  packageName: string,
) => {
  const packageJsonPath = `${dir}/node_modules/${packageName}/package.json`;

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = await readFile(packageJsonPath, { encoding: "utf-8" });
    const packageJsonContents = JSON.parse(packageJson);
    const version = packageJsonContents.version;

    return version;
  } catch (e) {
    return null;
  }
};
