/**
 * Input values used by the Search tests.
 * (The expected search messages are in `messages.data.ts`, read from `Data/StaticData.json`.)
 */
export const searchData = {
  /** Full product name that exists in the catalog. */
  exactName: '14.1-inch Laptop',
  /** Part of a product name. */
  partialName: 'laptop',
  /** Same word in different letter cases. */
  caseVariations: ['LAPTOP', 'Laptop', 'lApToP'],
  /** A term that can never match a product. */
  noResultTerm: 'zzzzxqwvk',
  /** Fewer than 3 characters triggers the minimum-length warning. */
  tooShortTerms: ['a', 'ab'],
  /** Every special character on a keyboard, to check the page does not break. */
  specialCharacters: `!@#$%^&*()_+-=[]{};:'",./?|~\``,
  /** Length of the very long search string (the string is built by repeating "a"). */
  longStringLength: 500,

  /** Values for the "Advanced search" section of the search page. */
  advanced: {
    keyword: 'computer',
    parentCategory: 'Computers',
    priceFrom: 1000,
    priceTo: 1500,
    /** A minimum price no product can reach, so the search must return nothing. */
    impossiblePriceFrom: 999999,
  },
};
