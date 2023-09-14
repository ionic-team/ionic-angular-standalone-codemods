import type { SchematicContext, Tree } from "@angular-devkit/schematics";
import { migrateStandaloneMainTs } from "./0001-migrate-standalone-main-ts";


export default function run(
  tree: Tree,
  context: SchematicContext
) {
  console.log('hello world!');

  migrateStandaloneMainTs(tree, context);

}