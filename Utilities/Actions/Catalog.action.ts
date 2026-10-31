import { Page, test } from '@playwright/test';
import { CatalogHelper } from '@root/Utilities/Helper/Catalog.helper';
import {
  filterCandidatePaths,
  sortableCategoryPath,
  sortOptions,
} from '@root/Utilities/testData/catalog.data';

/** One of the sort options, by its key: 'nameAsc' | 'nameDesc' | 'priceAsc' | 'priceDesc' | 'createdOn'. */
export type SortKey = keyof typeof sortOptions;

/**
 * Action = a complete test scenario, written as a chain of helper steps.
 * Method names read like a sentence ("User should ..."), so a spec stays one readable line.
 * This class covers the Catalog scenarios (sorting, page size, view mode, price filter, paging).
 * `test.skip(...)` is used when the live shop data does not allow a meaningful check.
 */
export default class CatalogAction {
  private catalogHelper: CatalogHelper;

  constructor(page: Page) {
    this.catalogHelper = new CatalogHelper(page);
  }

  /** The "Sort by" drop-down offers every expected option. */
  async UserShouldSeeAllSortOptions(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);
    await this.catalogHelper.AssertSortOptionsAvailable(Object.values(sortOptions));
  }

  /** Sorts the category with the chosen option and checks the resulting order. */
  async UserShouldBeAbleToSort(sortKey: SortKey): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);
    const before = await this.catalogHelper.GetProductNames();

    await this.catalogHelper.SortBy(sortOptions[sortKey]);

    switch (sortKey) {
      case 'nameAsc':
        await this.catalogHelper.AssertSortedByName('asc');
        break;
      case 'nameDesc':
        await this.catalogHelper.AssertSortedByName('desc');
        break;
      case 'priceAsc':
        await this.catalogHelper.AssertSortedByPrice('asc');
        break;
      case 'priceDesc':
        await this.catalogHelper.AssertSortedByPrice('desc');
        break;
      case 'createdOn':
        // There is no visible order to check for "Created on"; only the product set is compared.
        break;
    }
    // Whatever the order, the same products must still be listed.
    await this.catalogHelper.AssertSameProductsAfterSort(before);
  }

  /** Choosing a smaller page size limits the number of products shown. */
  async UserShouldBeAbleToChangePageSize(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);
    const sizes = await this.catalogHelper.GetPageSizeOptions();
    const current = await this.catalogHelper.GetSelectedPageSize();
    const candidates = sizes.filter((size) => size !== current);
    test.skip(candidates.length === 0, 'Page size selector offers a single option');

    const target = Math.min(...candidates);
    await this.catalogHelper.SelectPageSize(target);
    await this.catalogHelper.AssertProductCountAtMost(target);
  }

  /** The user can switch the product list to List view and back to Grid view. */
  async UserShouldBeAbleToSwitchBetweenGridAndListView(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);

    await this.catalogHelper.SwitchView('List');
    await this.catalogHelper.AssertViewMode('List');

    await this.catalogHelper.SwitchView('Grid');
    await this.catalogHelper.AssertViewMode('Grid');
  }

  /** Applying the first price-range link leaves only products inside that range. */
  async UserShouldBeAbleToFilterByPriceRange(): Promise<void> {
    // Find the first candidate category that actually shows a price filter.
    let filterPath: string | undefined;
    for (const path of filterCandidatePaths) {
      await this.catalogHelper.GoToCategory(path);
      if (await this.catalogHelper.HasPriceRangeFilter()) {
        filterPath = path;
        break;
      }
    }
    test.skip(!filterPath, 'No price-range filter is shown on any candidate category');

    const rangeText = await this.catalogHelper.GetFirstPriceRangeText();
    const range = this.catalogHelper.ParsePriceRange(rangeText);
    await this.catalogHelper.ApplyFirstPriceRange();
    await this.catalogHelper.AssertPricesWithin(range);
  }

  /** With the smallest page size, page 2 works and does not repeat products from page 1. */
  async UserShouldBeAbleToPaginate(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);
    const sizes = await this.catalogHelper.GetPageSizeOptions();
    test.skip(sizes.length === 0, 'Page size selector is not available');

    // The smallest page size makes a second page most likely.
    const smallest = Math.min(...sizes);
    if (smallest !== (await this.catalogHelper.GetSelectedPageSize())) {
      await this.catalogHelper.SelectPageSize(smallest);
    }
    test.skip(
      !(await this.catalogHelper.IsPagerVisible()),
      'Category has too few products to paginate',
    );

    const firstPage = await this.catalogHelper.GetProductNames();
    await this.catalogHelper.AssertCurrentPage(1);

    await this.catalogHelper.GoToPage(2);
    await this.catalogHelper.AssertCurrentPage(2);
    const secondPage = await this.catalogHelper.GetProductNames();

    await this.catalogHelper.AssertProductCountAtMost(smallest);
    await this.catalogHelper.AssertNoOverlap(firstPage, secondPage);
  }
}
