import { Project } from "ts-morph";

export const migrateAppModule = (project: Project) => {

  const appModule = project.getSourceFile('app.module.ts');


  if (appModule === undefined) {
    return;
  }

  console.log('found app module')

}