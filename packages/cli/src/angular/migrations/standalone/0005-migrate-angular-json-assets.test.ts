import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { dedent } from 'ts-dedent';

import { migrateAngularJsonAssets } from './0005-migrate-angular-json-assets';

describe('migrateAngularJsonAssets', () => {

  it('should migrate assets in angular.json', async () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const angularJson = {
      projects: {
        app: {
          architect: {
            build: {
              options: {
                assets: [
                  'src/favicon.ico',
                  'src/assets',
                  {
                    "glob": "**/*.svg",
                    "input": "node_modules/ionicons/dist/ionicons/svg",
                    "output": "./svg"
                  }
                ]
              }
            }
          }
        }
      }
    };

    project.createSourceFile('angular.json', JSON.stringify(angularJson, null, 2));

    const result = await migrateAngularJsonAssets(project, { dryRun: false });

    expect(dedent(result!)).toEqual(JSON.stringify({
      projects: {
        app: {
          architect: {
            build: {
              options: {
                assets: [
                  'src/favicon.ico',
                  'src/assets'
                ]
              }
            }
          }
        }
      }
    }, null, 4));
  });

});