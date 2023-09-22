import { describe, it, expect } from "vitest";

import { kebabCaseToPascalCase, kebabCaseToCamelCase } from "./string-utils";

describe("kebabCaseToPascalCase", () => {
  it("should convert kebab case to pascal case", () => {
    expect(kebabCaseToPascalCase("foo-bar-baz")).toBe("FooBarBaz");
  });
});

describe("kebabCaseToCamelCase", () => {
  it("should convert kebab case to camel case", () => {
    expect(kebabCaseToCamelCase("foo-bar-baz")).toBe("fooBarBaz");
  });
});
