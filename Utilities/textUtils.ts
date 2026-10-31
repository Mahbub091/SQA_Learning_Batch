/**
 * Small, framework-free text and number helpers shared by page objects, helpers and test data.
 */

/** Escapes characters that have a special meaning in a regular expression (e.g. "." or "?"). */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive, whole-string match used for link names such as "Apparel & Shoes". */
export function exactNameRegex(name: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`, 'i');
}

/**
 * Turns a message from `Data/StaticData.json` into a case-insensitive "contains" regex.
 * A trailing "." is dropped, so "Email not found." still matches "Email not found" on the page.
 */
export function messageRegex(message: string): RegExp {
  return new RegExp(escapeRegExp(message.trim().replace(/\.$/, '')), 'i');
}

/** Turns "$1,200.00" or "1200.00" into 1200. Returns NaN when no number is found. */
export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

/** True when the texts are in A-to-Z order (letter case is ignored). */
export function isSortedAscending(values: string[]): boolean {
  const normalized = values.map((value) => value.toLowerCase());
  return normalized.every((value, i) => i === 0 || normalized[i - 1] <= value);
}

/** True when the numbers are in ascending ("asc") or descending ("desc") order. */
export function isNumberSorted(values: number[], direction: 'asc' | 'desc'): boolean {
  return values.every((value, i) => {
    if (i === 0) return true;
    return direction === 'asc' ? values[i - 1] <= value : values[i - 1] >= value;
  });
}
