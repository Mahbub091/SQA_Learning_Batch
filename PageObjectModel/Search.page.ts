import { Page, Locator } from '@playwright/test';

export class SearchPage {
  readonly SearchFeature: {
    readonly pageHeading: Locator;
    readonly searchTermInput: Locator;
    readonly searchButton: Locator;
  };

  readonly AdvancedSearch: {
    readonly advancedCheckbox: Locator;
    readonly categorySelect: Locator;
    readonly subCategoriesCheckbox: Locator;
    readonly manufacturerSelect: Locator;
    readonly priceFromInput: Locator;
    readonly priceToInput: Locator;
    readonly searchInDescriptionCheckbox: Locator;
  };

  readonly Results: {
    readonly resultsContainer: Locator;
    readonly productItems: Locator;
    readonly productTitles: Locator;
    readonly productPrices: Locator;
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
