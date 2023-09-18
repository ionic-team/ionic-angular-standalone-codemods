import { SyntaxKind, type Decorator } from "ts-morph";

/**
 * Gets the argument of a decorator.
 * @param decorator The decorator to get the argument from.
 * @param propertyName The name of the property to get the argument for.
 * @returns The property assignment of the decorator argument.
 */
export const getDecoratorArgument = (
  decorator: Decorator,
  propertyName: string,
) => {
  const args = decorator.getArguments();

  if (args.length === 0) {
    return;
  }

  const arg = args[0];
  const prop = arg
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((n) => n.compilerNode.name.getText() === propertyName);

  return prop;
};

/**
 * Inserts a value into an array property of a decorator. Creates the decorator property if it does not exist.
 * @param decorator The decorator to insert the value into.
 * @param propertyName The name of the property to insert the value into.
 * @param value The value to insert into the array.
 */
export const insertIntoDecoratorArgArray = (
  decorator: Decorator,
  propertyName: string,
  value: string,
) => {
  let property = getDecoratorArgument(decorator, propertyName);
  if (!property) {
    property = decorator
      .getArguments()[0]
      .asKind(SyntaxKind.ObjectLiteralExpression)!
      .addPropertyAssignment({
        name: propertyName,
        initializer: "[]",
      });
  }

  const propertyInitializer = property.getInitializerIfKind(
    SyntaxKind.ArrayLiteralExpression,
  )!;

  propertyInitializer.addElement(value);
};

/**
 * Deletes a value from an array property of a decorator.
 * @param decorator The decorator to delete the value from.
 * @param propertyName The name of the property to delete the value from.
 * @param value The value to delete from the array.
 */
export const deleteFromDecoratorArgArray = (
  decorator: Decorator,
  propertyName: string,
  value: string,
) => {
  const property = getDecoratorArgument(decorator, propertyName);
  if (!property) {
    return;
  }

  const propertyInitializer = property.getInitializerIfKind(
    SyntaxKind.ArrayLiteralExpression,
  )!;

  const element = propertyInitializer
    .getElements()
    .find((e) => e.getText() === value);

  if (element) {
    propertyInitializer.removeElement(element);
  }
};
