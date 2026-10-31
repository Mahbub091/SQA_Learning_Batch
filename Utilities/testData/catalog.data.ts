/**
 * Test data for the Catalog and Navigation tests: categories, sub-categories, footer links
 * and the sort options of the product list.
 */

/** A top-level product category (e.g. "Books"). */
export interface CategoryData {
  /** The link text shown on the site. */
  name: string;
  /** The URL path of the category page. */
  path: string;
  /** What the page heading (h1) must look like once the page has opened. */
  heading: RegExp;
}

/** A sub-category that lives under a parent category (e.g. "Desktops" under "Computers"). */
export interface SubCategoryData extends CategoryData {
  parent: string;
  parentPath: string;
}

/** A link in the page footer (e.g. "About us"). */
export interface FooterLinkData {
  name: string;
  path: string;
  heading: RegExp;
}

/** The categories in the main top menu. */
export const topCategories: CategoryData[] = [
  { name: 'Books', path: '/books', heading: /^books$/i },
  { name: 'Computers', path: '/computers', heading: /^computers$/i },
  { name: 'Electronics', path: '/electronics', heading: /^electronics$/i },
  { name: 'Apparel & Shoes', path: '/apparel-shoes', heading: /^apparel\s*&\s*shoes$/i },
  { name: 'Digital downloads', path: '/digital-downloads', heading: /^digital downloads$/i },
  { name: 'Jewelry', path: '/jewelry', heading: /^jewelry$/i },
  { name: 'Gift Cards', path: '/gift-cards', heading: /^gift cards$/i },
];

/** The sub-categories that are tested (only Computers and Electronics have any). */
export const subCategories: SubCategoryData[] = [
  {
    parent: 'Computers',
    parentPath: '/computers',
    name: 'Desktops',
    path: '/desktops',
    heading: /^desktops$/i,
  },
  {
    parent: 'Computers',
    parentPath: '/computers',
    name: 'Notebooks',
    path: '/notebooks',
    heading: /^notebooks$/i,
  },
  {
    parent: 'Computers',
    parentPath: '/computers',
    name: 'Accessories',
    path: '/accessories',
    heading: /^accessories$/i,
  },
  {
    parent: 'Electronics',
    parentPath: '/electronics',
    name: 'Camera, photo',
    path: '/camera-photo',
    heading: /^camera,\s*photo$/i,
  },
  {
    parent: 'Electronics',
    parentPath: '/electronics',
    name: 'Cell phones',
    path: '/cell-phones',
    heading: /^cell phones$/i,
  },
];

/** The links at the bottom of every page. */
export const footerLinks: FooterLinkData[] = [
  { name: 'Sitemap', path: '/sitemap', heading: /sitemap/i },
  { name: 'Shipping & returns', path: '/shipping-returns', heading: /shipping\s*&\s*returns/i },
  { name: 'Privacy notice', path: '/privacy-policy', heading: /privacy notice/i },
  { name: 'Conditions of Use', path: '/conditions-of-use', heading: /conditions of use/i },
  { name: 'About us', path: '/about-us', heading: /about us/i },
  { name: 'Contact us', path: '/contactus', heading: /contact us/i },
  { name: 'Search', path: '/search', heading: /search/i },
  { name: 'News', path: '/news', heading: /news/i },
  { name: 'Blog', path: '/blog', heading: /blog/i },
  { name: 'New products', path: '/newproducts', heading: /new products/i },
  {
    name: 'Recently viewed products',
    path: '/recentlyviewedproducts',
    heading: /recently viewed/i,
  },
  { name: 'Compare products list', path: '/compareproducts', heading: /compare products/i },
];

/** Categories that hold several products, so sorting / paging / view mode are meaningful. */
export const sortableCategoryPath = '/books';

/** Category pages that may expose a price-range filter. The test skips when none is shown. */
export const filterCandidatePaths = ['/desktops', '/notebooks', '/accessories', '/books'];

/**
 * The entries of the "Sort by" drop-down.
 * The key is used in test code (e.g. 'priceAsc'); the value is the exact text on the page.
 */
export const sortOptions = {
  nameAsc: 'Name: A to Z',
  nameDesc: 'Name: Z to A',
  priceAsc: 'Price: Low to High',
  priceDesc: 'Price: High to Low',
  createdOn: 'Created on',
} as const;
