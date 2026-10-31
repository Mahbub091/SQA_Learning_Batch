import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Search page (basic form, "Advanced search" section and the results list).
 * A page object only describes WHERE things are (locators); it never clicks or asserts.
 */
export class SearchPage {
  /** The main search form. */
  readonly SearchFeature: {
    readonly pageHeading: Locator;
    readonly searchTermInput: Locator;
    readonly searchButton: Locator;
  };

  /** The extra options that appear after ticking "Advanced search". */
  readonly AdvancedSearch: {
    readonly advancedCheckbox: Locator;
    readonly categorySelect: Locator;
    readonly subCategoriesCheckbox: Locator;
    readonly manufacturerSelect: Locator;
    readonly priceFromInput: Locator;
    readonly priceToInput: Locator;
    readonly searchInDescriptionCheckbox: Locator;
  };

  /** What the page shows after a search was submitted. */
  readonly Results: {
    readonly resultsContainer: Locator;
    readonly productItems: Locator;
    readonly productTitles: Locator;
    readonly productPrices: Locator;
    /** The yellow warning box, e.g. "Search term minimum length is 3 characters". */
    readonly warning: Locator;
  };

  constructor(private page: Page) {
    this.SearchFeature = {
      pageHeading: this.page.locator(`css=.page-title h1`),
      searchTermInput: this.page.locator(`css=input#q`),
      searchButton: this.page.locator(`css=input.search-button`),
    };

    this.AdvancedSearch = {
      advancedCheckbox: this.page.locator(`css=input#As`),
      categorySelect: this.page.locator(`css=select#Cid`),
      subCategoriesCheckbox: this.page.locator(`css=input#Isc`),
      manufacturerSelect: this.page.locator(`css=select#Mid`),
      priceFromInput: this.page.locator(`css=input#Pf`),
      priceToInput: this.page.locator(`css=input#Pt`),
      searchInDescriptionCheckbox: this.page.locator(`css=input#Sid`),
    };

    this.Results = {
      resultsContainer: this.page.locator(`css=.search-results`),
      productItems: this.page.locator(`css=.search-results .product-item`),
      productTitles: this.page.locator(`css=.search-results .product-item .product-title a`),
      productPrices: this.page.locator(`css=.search-results .product-item .prices .actual-price`),
      warning: this.page.locator(`css=.warning`),
    };
  }
}
