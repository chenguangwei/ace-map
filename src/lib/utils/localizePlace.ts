export function localizePlace(
  name: string,
  map: Record<string, string> | null
): string {
  if (!map) return name;
  return map[name] ?? name;
}
