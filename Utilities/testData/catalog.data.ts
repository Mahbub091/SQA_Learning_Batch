import { staticData, toRegExp } from './data.loader';

export interface CategoryData {
  name: string;
  path: string;
  heading: RegExp;
}

export interface SubCategoryData extends CategoryData {
  parent: string;
  parentPath: string;
}

export interface FooterLinkData {
  name: string;
  path: string;
  heading: RegExp;
}

export const topCategories: CategoryData[] = staticData.topCategories.map((category) => ({
  ...category,
  heading: toRegExp(category.heading),
}));

export const subCategories: SubCategoryData[] = staticData.subCategories.map((category) => ({
  ...category,
  heading: toRegExp(category.heading),
}));

export const footerLinks: FooterLinkData[] = staticData.footerLinks.map((link) => ({
  ...link,
  heading: toRegExp(link.heading),
}));

/** Categories that hold several products, so sorting / paging / view mode are meaningful. */
export const sortableCategoryPath = staticData.catalog.sortableCategoryPath;

/** Category pages that may expose a price-range filter. The test skips when none is shown. */
export const filterCandidatePaths = staticData.catalog.filterCandidatePaths;

export const sortOptions = staticData.catalog.sortOptions;
