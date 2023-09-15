import { SyntaxKind, type Decorator } from "ts-morph";

export const getDecoratorArgument = (decorator: Decorator, propertyName: string) => {
  const args = decorator.getArguments()

  if (args.length === 0) {
    return;
  }

  const arg = args[0];

  const prop = arg.getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find(n => n.compilerNode.name.getText() === propertyName);


  return prop;

}

export const insertIntoDecoratorArgArray = (decorator: Decorator, propertyName: string, value: string) => {
  let property = getDecoratorArgument(decorator, propertyName);
  if (!property) {
    property = decorator.getArguments()[0].asKind(SyntaxKind.ObjectLiteralExpression)!.addPropertyAssignment({
      name: propertyName,
      initializer: '[]'
    });
  }

  const propertyInitializer = property.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression)!;

  propertyInitializer.addElement(value);
};

export const deleteFromDecoratorArgArray = (decorator: Decorator, propertyName: string, value: string) => {
  const property = getDecoratorArgument(decorator, propertyName);
  if (!property) {
    return;
  }

  const propertyInitializer = property.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression)!;

  const element = propertyInitializer.getElements().find(e => e.getText() === value);

  if (element) {
    propertyInitializer.removeElement(element);
  }
}