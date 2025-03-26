export function camelCaseToSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}
