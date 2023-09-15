

export function toPascalCase(str: string) {
  return str.split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
}

export function toCamelCase(str: string) {
  return str.split('-').map((segment, index) => {
    if (index === 0) {
      return segment;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }).join('');
}