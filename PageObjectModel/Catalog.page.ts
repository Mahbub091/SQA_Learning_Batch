import { Page, Locator } from '@playwright/test';
import { exactNameRegex } from '../Utilities/textUtils';

export class CatalogPage {
  readonly CatalogFeature: {
    readonly pageHeading: Locator;
    readonly breadcrumb: Locator;
    readonly breadcrumbLinks: Locator;
    readonly leftCategoryMenu: Locator;
    readonly subCategoryTiles: Locator;
  };

  readonly Toolbar: {
    readonly sortSelect: Locator;
    readonly pageSizeSelect: Locator;
    readonly viewModeSelect: Locator;
  };

  readonly Products: {
    readonly productItems: Locator;
    readonly productTitles: Locator;
    readonly productPrices: Locator;
    readonly productGrid: Locator;
    readonly productList: Locator;
  };

  readonly Pager: {
    readonly pager: Locator;
    readonly nextPage: Locator;
    readonly currentPage: Locator;
  };

  readonly Filters: {
    readonly priceRangeFilter: Locator;
    readonly priceRangeOptions: Locator;
    readonly anyFilterBlock: Locator;
  };

  constructor(private page: Page) {
    this.CatalogFeature = {
      pageHeading: this.page.locator(`css=.page-title h1`),
      breadcrumb: this.page.locator(`css=.breadcrumb`),
      breadcrumbLinks: this.page.locator(`css=.breadcrumb a`),
      leftCategoryMenu: this.page.locator(`css=.block-category-navigation`),
      subCategoryTiles: this.page.locator(`css=.sub-category-item .title a`),
    };

    this.Toolbar = {
      sortSelect: this.page.locator(`css=#products-orderby`),
      pageSizeSelect: this.page.locator(`css=#products-pagesize`),
      viewModeSelect: this.page.locator(`css=#products-viewmode`),
    };

    this.Products = {
      productItems: this.page.locator(`css=.product-item`),
      productTitles: this.page.locator(`css=.product-item .product-title a`),
      productPrices: this.page.locator(`css=.product-item .prices .actual-price`),
      productGrid: this.page.locator(`css=.product-grid`),
      productList: this.page.locator(`css=.product-list`),
    };

    this.Pager = {
      pager: this.page.locator(`css=.pager`),
      nextPage: this.page.locator(`css=.pager .next-page a`),
      currentPage: this.page.locator(`css=.pager .current-page`),
    };

    this.Filters = {
      priceRangeFilter: this.page.locator(`css=.price-range-filter`),
      priceRangeOptions: this.page.locator(`css=.price-range-filter a`),
      anyFilterBlock: this.page.locator(`css=.product-filters, .filtering, .price-range-filter`),
    };
  }

  leftMenuLink(name: string): Locator {
    return this.page
      .locator(`css=.block-category-navigation`)
      .getByRole('link', { name: exactNameRegex(name) });
  }

  subCategoryTile(name: string): Locator {
    return this.page
      .locator(`css=.sub-category-item .title a`)
      .filter({ hasText: exactNameRegex(name) });
  }

  pagerPageLink(pageNumber: number): Locator {
    return this.page
      .locator(`css=.pager .individual-page a`)
      .filter({ hasText: new RegExp(`^\\s*${pageNumber}\\s*$`) });
  }
}
