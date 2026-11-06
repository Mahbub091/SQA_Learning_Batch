import { Page, test } from '@playwright/test';
import { CatalogHelper } from '../Helper/Catalog.helper';
import { filterCandidatePaths, sortableCategoryPath, sortOptions } from '../testData/catalog.data';

export type SortKey = keyof typeof sortOptions;

export default class CatalogAction {
  private catalogHelper: CatalogHelper;

  constructor(page: Page) {
    this.catalogHelper = new CatalogHelper(page);
  }

  async UserShouldSeeAllSortOptions(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);
    await this.catalogHelper.AssertSortOptionsAvailable(Object.values(sortOptions));
  }

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
        break;
    }
    await this.catalogHelper.AssertSameProductsAfterSort(before);
  }

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

  async UserShouldBeAbleToSwitchBetweenGridAndListView(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);

    await this.catalogHelper.SwitchView('List');
    await this.catalogHelper.AssertViewMode('List');

    await this.catalogHelper.SwitchView('Grid');
    await this.catalogHelper.AssertViewMode('Grid');
  }

  async UserShouldBeAbleToFilterByPriceRange(): Promise<void> {
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

  async UserShouldBeAbleToPaginate(): Promise<void> {
    await this.catalogHelper.GoToCategory(sortableCategoryPath);
    const sizes = await this.catalogHelper.GetPageSizeOptions();
    test.skip(sizes.length === 0, 'Page size selector is not available');

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
