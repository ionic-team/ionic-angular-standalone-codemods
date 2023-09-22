import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { dedent } from "ts-dedent";

import {
  getDecoratorArgument,
  insertIntoDecoratorArgArray,
  deleteFromDecoratorArgArray,
} from "./decorator-utils";
import exp from "constants";

describe("getDecoratorArgument", () => {
  it("should return the decorator argument", () => {
    const sourceFileContent = `
      @NgModule({
        imports: ['foo'],
        exports: ['bar'],
        declarations: []
      })
      export class AppModule { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const decorator = sourceFile.getClasses()[0]?.getDecorator("NgModule");

    const imports = getDecoratorArgument(decorator!, "imports");
    const exports = getDecoratorArgument(decorator!, "exports");
    const declarations = getDecoratorArgument(decorator!, "declarations");

    expect(imports?.getText()).toBe(`imports: ['foo']`);
    expect(exports?.getText()).toBe(`exports: ['bar']`);
    expect(declarations?.getText()).toBe(`declarations: []`);
  });

  it("should return undefined if the decorator does not have arguments", () => {
    const sourceFileContent = `
    @NgModule()
    export class AppModule { }
  `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const decorator = sourceFile.getClasses()[0]?.getDecorator("NgModule");

    const imports = getDecoratorArgument(decorator!, "imports");

    expect(imports).toBe(undefined);
  });
});

describe("insertIntoDecoratorArgArray", () => {
  it("should insert into an existing array", () => {
    const sourceFileContent = `
      @NgModule({
        imports: ['foo'],
        exports: ['bar']
      })
      export class AppModule { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const decorator = sourceFile.getClasses()[0]?.getDecorator("NgModule");

    insertIntoDecoratorArgArray(decorator!, "imports", `'baz'`);

    expect(dedent(decorator?.getText()!)).toBe(
      dedent(`
    @NgModule({
      imports: ['foo', 'baz'],
      exports: ['bar']
    })`),
    );
  });

  it("should create an array if it does not exist", () => {
    const sourceFileContent = `
      @NgModule({
        imports: ['foo'],
        exports: ['bar']
      })
      export class AppModule { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const decorator = sourceFile.getClasses()[0]?.getDecorator("NgModule");

    insertIntoDecoratorArgArray(decorator!, "declarations", `'baz'`);

    sourceFile.formatText();

    expect(dedent(decorator?.getText()!)).toBe(
      dedent(`
    @NgModule({
        imports: ['foo'],
        exports: ['bar'],
        declarations: ['baz']
    })`),
    );
  });
});

describe("deleteFromDecoratorArgArray", () => {
  it("should delete from an existing array", () => {
    const sourceFileContent = `
      @NgModule({
        imports: ['foo'],
        exports: ['bar']
      })
      export class AppModule { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const decorator = sourceFile.getClasses()[0]?.getDecorator("NgModule");

    deleteFromDecoratorArgArray(decorator!, "imports", `'foo'`);

    expect(dedent(decorator?.getText()!)).toBe(
      dedent(`
    @NgModule({
      imports: [],
      exports: ['bar']
    })`),
    );
  });

  it("should do nothing if the array does not exist", () => {
    const sourceFileContent = `
      @NgModule({
        imports: ['foo'],
        exports: ['bar']
      })
      export class AppModule { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const decorator = sourceFile.getClasses()[0]?.getDecorator("NgModule");

    deleteFromDecoratorArgArray(decorator!, "declarations", `'baz'`);

    expect(dedent(decorator?.getText()!)).toBe(
      dedent(`
    @NgModule({
      imports: ['foo'],
      exports: ['bar']
    })`),
    );
  });
});
