import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { dedent } from "ts-dedent";

import { getOrCreateConstructor, addImportToClass, removeImportFromClass } from "./typescript-utils";

describe("getOrCreateConstructor", () => {
  it("should return the existing constructor", () => {
    const sourceFileContent = `
      export class Foo {
        constructor() {}
      }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const actual = getOrCreateConstructor(sourceFile);

    expect(actual?.getText()).toBe(`constructor() {}`);
  });

  it("should create a constructor if it does not exist", () => {
    const sourceFileContent = `
      export class Foo {
      }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    const actual = getOrCreateConstructor(sourceFile);

    expect(dedent(actual?.getText())).toBe(
      dedent(`constructor() {
    }`),
    );
  });
});

describe("addImportToClass", () => {
  it("should add an import to a class", () => {
    const sourceFileContent = `export class Foo { }`;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    addImportToClass(sourceFile, "Component", "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
    import { Component } from "@angular/core";

    export class Foo { }
    `),
    );
  });

  it("should add an import to an existing import declaration", () => {
    const sourceFileContent = `
    import { Injectable } from "@angular/core";
    export class Foo { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    addImportToClass(sourceFile, "Component", "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
    import { Injectable, Component } from "@angular/core";
    export class Foo { }
    `),
    );
  });

  it("should add multiple imports", () => {
    const sourceFileContent = `export class Foo { }`;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    addImportToClass(sourceFile, ["Component", "Injectable"], "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
    import { Component, Injectable } from "@angular/core";

    export class Foo { }
    `),
    );
  });

  it("should do nothing if the source file does not have a class", () => {
    const sourceFileContent = `
        export function foo() { }
      `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    addImportToClass(sourceFile, "Component", "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
      export function foo() { }
      `),
    );
  });
});

describe("removeImportFromClass", () => {

  it("should remove an import from a class", () => {
    const sourceFileContent = `
      import { Component } from "@angular/core";
      export class Foo { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    removeImportFromClass(sourceFile, "Component", "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
      export class Foo { }
    `),
    );
  });

  it("should remove an import from an existing import declaration", () => {
    const sourceFileContent = `
    import { Injectable, Component } from "@angular/core";
    export class Foo { }
    `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    removeImportFromClass(sourceFile, "Component", "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
    import { Injectable } from "@angular/core";
    export class Foo { }
    `),
    );
  });

  it("should do nothing if the source file does not have a class", () => {
    const sourceFileContent = `
        export function foo() { }
      `;

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("foo.ts", sourceFileContent);

    removeImportFromClass(sourceFile, "Component", "@angular/core");

    expect(dedent(sourceFile.getText())).toBe(
      dedent(`
      export function foo() { }
      `),
    );
  });
});