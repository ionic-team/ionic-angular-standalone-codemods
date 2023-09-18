
/**
 * Converts a kebab-case string to PascalCase
 * @param str The string to convert.
 * @returns The converted string.
 */
export function kebabCaseToPascalCase(str: string) {
  return str.split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
}

/**
 * Converts a kebab-case string to camelCase
 * @param str The string to convert.
 * @returns The converted string.
 */
export function kebabCaseToCamelCase(str: string) {
  return str.split('-').map((segment, index) => {
    if (index === 0) {
      return segment;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }).join('');
}