import { Rule, SchematicContext, Tree, chain } from "@angular-devkit/schematics";
import run from "../migration/update-7-5-0/angular";
import { Project } from "ts-morph";


interface Options {

}

// export function migrate({ }: Options): Rule {
//   return (tree: Tree, context: SchematicContext) => {
//     const migrations: any[] = [];

//     context.logger.info('Running migrations...');

//     const project = new Project();

//     const dir = project.addDirectoryAtPath('src');

//     // project.addSourceFileAtPath('src/**/*.ts');

//     const mainTs = dir.getSourceFileOrThrow('main.ts');

//     const bootstrapApplication = mainTs.getFunctionOrThrow('bootstrapApplication');

//     console.log('has bootstrapApplication', bootstrapApplication);


//     migrations.push(
//       // run(tree, context)
//     );

//     const rule = chain(migrations);

//     return rule(tree, context);
//   }
// }

export function migrate(directory: string) {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json'
  });

  const mainTs = project.getSourceFile('src/main.ts');

  if (mainTs !== undefined) {
    console.log('we have a match!');
    const bootstrapApplication = mainTs.getFunction('bootstrapApplication');

    if (bootstrapApplication !== undefined) {
      console.log('we have a bootstrapApplication!');
    } else {
      console.log('no bootstrap sorry');
    }
  }
}