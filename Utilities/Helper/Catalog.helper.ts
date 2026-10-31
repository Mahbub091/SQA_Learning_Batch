import { expect, Page } from '@playwright/test';
import { CatalogPage } from '@root/PageObjectModel/Catalog.page';
import ActionUtils from '@root/Utilities/ActionUtils';
import { urlFor } from '@root/Utilities/config/env.config';
import { isNumberSorted, isSortedAscending, parsePrice } from '@root/Utilities/textUtils';

/** A price interval, e.g. "25.00 - 50.00" => { min: 25, max: 50 }. */
export interface PriceRange {
  min: number;
  max: number;
}

/**
 * Helper = small, reusable steps and checks for ONE feature (here: category pages -
 * sorting, page size, grid/list view, paging and the price filter).
 * Actions (the next layer up) chain these steps into a full test scenario.
 */
export class CatalogHelper {
  private catalogPage: CatalogPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.catalogPage = new CatalogPage(page);
    this.runner = new ActionUtils(page);
  }

  /** Opens a category by its URL path (e.g. '/books') and waits for its heading. */
  async GoToCategory(path: string): Promise<void> {
    await this.runner.NavigateToUrl(urlFor(path));
    await this.runner.AssertElementVisible(this.catalogPage.CatalogFeature.pageHeading.first());
  }

  // ---------- reading the product list ----------

  /** Product names in the order they are shown. */
  async GetProductNames(): Promise<string[]> {
    return this.runner.GetAllTexts(this.catalogPage.Products.productTitles);
  }

  /** Product prices as numbers (NaN for a price that cannot be read). */
  async GetProductPrices(): Promise<number[]> {
    const texts = await this.runner.GetAllTexts(this.catalogPage.Products.productPrices);
    return texts.map(parsePrice);
  }

  /** How many products are shown on the current page. */
  async GetProductCount(): Promise<number> {
    return this.runner.CountElements(this.catalogPage.Products.productItems);
  }

  // ---------- sorting ----------

  /** Chooses a "Sort by" option and waits for the page to reload with it applied. */
  async SortBy(label: string): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.SelectOptionByLabel(this.catalogPage.Toolbar.sortSelect, label),
    );
    await expect(this.catalogPage.Toolbar.sortSelect.locator('option:checked')).toHaveText(label);
  }

  /** Every given label exists in the "Sort by" drop-down. */
  async AssertSortOptionsAvailable(labels: string[]): Promise<void> {
    const available = await this.runner.GetSelectOptionLabels(this.catalogPage.Toolbar.sortSelect);
    for (const label of labels) {
      expect(available, `sort option "${label}" should exist`).toContain(label);
    }
  }

  /** Product names are in A-to-Z ("asc") or Z-to-A ("desc") order. */
  async AssertSortedByName(direction: 'asc' | 'desc'): Promise<void> {
    const names = await this.GetProductNames();
    expect(names.length, 'category should list at least 2 products').toBeGreaterThan(1);
    // For "desc", reverse the list and check it is ascending.
    const ordered = direction === 'asc' ? names : [...names].reverse();
    expect(isSortedAscending(ordered), `names not sorted ${direction}: ${names.join(' | ')}`).toBe(
      true,
    );
  }

  /** Product prices are low-to-high ("asc") or high-to-low ("desc"). */
  async AssertSortedByPrice(direction: 'asc' | 'desc'): Promise<void> {
    const prices = await this.GetProductPrices();
    expect(prices.length, 'category should list at least 2 priced products').toBeGreaterThan(1);
    expect(prices.every((price) => !Number.isNaN(price))).toBe(true);
    expect(isNumberSorted(prices, direction), `prices not sorted ${direction}: ${prices}`).toBe(
      true,
    );
  }

  /** Sorting only changes the order: the same products are still listed. */
  async AssertSameProductsAfterSort(before: string[]): Promise<void> {
    const after = await this.GetProductNames();
    expect([...after].sort()).toEqual([...before].sort());
  }

  // ---------- page size ----------

  /** The numbers offered by the "Display per page" drop-down, e.g. [4, 8, 12]. */
  async GetPageSizeOptions(): Promise<number[]> {
    const labels = await this.runner.GetSelectOptionLabels(this.catalogPage.Toolbar.pageSizeSelect);
    return labels.map((label) => parseInt(label, 10)).filter((n) => !Number.isNaN(n));
  }

  /** The page size that is currently selected. */
  async GetSelectedPageSize(): Promise<number> {
    const label = await this.runner.GetSelectedOptionLabel(this.catalogPage.Toolbar.pageSizeSelect);
    return parseInt(label, 10);
  }

  /** Chooses a page size, waits for the reload, and checks it was applied. */
  async SelectPageSize(size: number): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.SelectOptionByLabel(this.catalogPage.Toolbar.pageSizeSelect, String(size)),
    );
    expect(await this.GetSelectedPageSize()).toBe(size);
  }

  /** The page lists at least one product but not more than `max`. */
  async AssertProductCountAtMost(max: number): Promise<void> {
    const count = await this.GetProductCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(max);
  }

  // ---------- grid / list view ----------

  /** Switches the layout to Grid or List (does nothing if it is already shown). */
  async SwitchView(mode: 'Grid' | 'List'): Promise<void> {
    const current = await this.runner.GetSelectedOptionLabel(
      this.catalogPage.Toolbar.viewModeSelect,
    );
    if (current.toLowerCase() === mode.toLowerCase()) return;
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.SelectOptionByLabel(this.catalogPage.Toolbar.viewModeSelect, mode),
    );
  }

  /** The requested layout is shown and the other one is not on the page. */
  async AssertViewMode(mode: 'Grid' | 'List'): Promise<void> {
    const shown =
      mode === 'Grid'
        ? this.catalogPage.Products.productGrid
        : this.catalogPage.Products.productList;
    const hidden =
      mode === 'Grid'
        ? this.catalogPage.Products.productList
        : this.catalogPage.Products.productGrid;
    await expect(shown.first()).toBeVisible();
    await expect(hidden).toHaveCount(0);
  }

  // ---------- pagination ----------

  /** True when the page-number links are shown (only when there is more than one page). */
  async IsPagerVisible(): Promise<boolean> {
    return this.runner.IsElementVisible(this.catalogPage.Pager.pager);
  }

  /** Clicks a page number and waits for the new page to load. */
  async GoToPage(pageNumber: number): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.catalogPage.pagerPageLink(pageNumber)),
    );
  }

  /** The pager highlights this page, and the URL contains `pagenumber=N` (for pages after 1). */
  async AssertCurrentPage(pageNumber: number): Promise<void> {
    await expect(this.catalogPage.Pager.currentPage).toHaveText(String(pageNumber));
    if (pageNumber > 1) {
      await this.runner.AssertUrlMatches(new RegExp(`pagenumber=${pageNumber}`, 'i'));
    }
  }

  /** No product appears on both pages. */
  async AssertNoOverlap(first: string[], second: string[]): Promise<void> {
    const overlap = first.filter((name) => second.includes(name));
    expect(overlap, 'products must not repeat across pages').toEqual([]);
  }

  // ---------- price filter ----------

  /** True when the page has a price-range filter (many categories do not). */
  async HasPriceRangeFilter(): Promise<boolean> {
    return (await this.runner.CountElements(this.catalogPage.Filters.priceRangeOptions)) > 0;
  }

  /** The text of the first price-range link, e.g. "Under 25.00". */
  async GetFirstPriceRangeText(): Promise<string> {
    const [first] = await this.runner.GetAllTexts(this.catalogPage.Filters.priceRangeOptions);
    return first ?? '';
  }

  /** Understands "Under 25.00", "25.00 - 50.00" and "Over 1200.00". */
  ParsePriceRange(text: string): PriceRange {
    const numbers = (text.replace(/,/g, '').match(/\d+(\.\d+)?/g) ?? []).map(Number);
    if (/under/i.test(text)) return { min: 0, max: numbers[0] };
    if (/over/i.test(text)) return { min: numbers[0], max: Number.POSITIVE_INFINITY };
    return { min: numbers[0], max: numbers[1] ?? Number.POSITIVE_INFINITY };
  }

  /** Clicks the first price-range link and waits for the filtered page. */
  async ApplyFirstPriceRange(): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.catalogPage.Filters.priceRangeOptions.first()),
    );
    await this.runner.AssertUrlMatches(/price=/i);
  }

  /** At least one product is shown and every price is inside the range. */
  async AssertPricesWithin(range: PriceRange): Promise<void> {
    const prices = await this.GetProductPrices();
    expect(prices.length, 'filter should leave at least one product').toBeGreaterThan(0);
    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(range.min);
      expect(price).toBeLessThanOrEqual(range.max);
    }
  }
}
