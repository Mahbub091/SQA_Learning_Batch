export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive, whole-string match used for link names such as "Apparel & Shoes". */
export function exactNameRegex(name: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`, 'i');
}

/** Turns "$1,200.00" or "1200.00" into 1200. Returns NaN when no number is found. */
export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

export function isSortedAscending(values: string[]): boolean {
  const normalized = values.map((value) => value.toLowerCase());
  return normalized.every((value, i) => i === 0 || normalized[i - 1] <= value);
}

export function isNumberSorted(values: number[], direction: 'asc' | 'desc'): boolean {
  return values.every((value, i) => {
    if (i === 0) return true;
    return direction === 'asc' ? values[i - 1] <= value : values[i - 1] >= value;
  });
}
