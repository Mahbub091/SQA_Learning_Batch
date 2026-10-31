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
  specialCharacters: `!@#$%^&*()_+-=[]{};:'",./?|~\``,
  longStringLength: 500,

  advanced: {
    keyword: 'computer',
    parentCategory: 'Computers',
    priceFrom: 1000,
    priceTo: 1500,
    impossiblePriceFrom: 999999,
  },
};

export const searchMessages = {
  noResults: /no products were found that matched your criteria/i,
  minLength: /search term minimum length is 3 characters/i,
  emptyAlert: /please enter some search keyword/i,
};
