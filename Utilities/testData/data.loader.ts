import staticJson from '../../data/static.json';
import dynamicJson from '../../data/dynamic.json';

/** Fixed values: categories, footer links, search terms, expected messages. */
export const staticData = staticJson;

/** Rules for values that are generated on every run (unique users, no-result terms, ...). */
export const dynamicData = dynamicJson;

/** JSON cannot store regular expressions, so patterns are stored as strings. */
export function toRegExp(pattern: string): RegExp {
  return new RegExp(pattern, 'i');
}

/** Converts { key: "pattern" } into { key: /pattern/i }. */
export function compilePatterns<T extends Record<string, string>>(
  patterns: T,
): { [K in keyof T]: RegExp } {
  return Object.fromEntries(
    Object.entries(patterns).map(([key, pattern]) => [key, toRegExp(pattern)]),
  ) as { [K in keyof T]: RegExp };
}
