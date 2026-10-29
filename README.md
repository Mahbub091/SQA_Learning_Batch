*GlobalResources 
*PageObjectModel
*tests
*env.example
*env.
*gitignore
*prettierrc
*eslint.config.mjs
*package.json
*package-lock.josn
*playwright.config.ts
*README.md
*tsconfig.json
*Utilities
*BrowserTeardown
*Winstone
*Faker

Test suite structure

1. Registration and authentication

Register with valid data, then confirm the success message and auto-login
Required-field validation (first name, last name, email, password)
Duplicate email, invalid email format, password too short, password and confirm mismatch
Login with valid credentials, wrong password, unregistered email, empty fields
Logout, and “Remember me” behavior
Forgot password flow (the validation and confirmation message)

2. Navigation and catalog

Top menu and category links (Books, Computers, Electronics, Apparel & Shoes, Digital downloads, Jewelry, Gift Cards) land on the right pages
Sub-categories (Computers → Desktops/Notebooks/Accessories; Electronics → Camera/Cell phones)
Breadcrumbs, left-side category menu, and the footer links
Sorting (name A-Z/Z-A, price low/high, created on), page size, and grid vs list view
Price-range and attribute filters where available
Pagination, if a category has enough products

3. Search

Search by exact name, partial name, and case variations
No-results message, empty search, and a one- or two-character term (minimum length error)
Advanced search (category, sub-categories, price range, search in descriptions)
Special characters and a very long string

4. Product detail page

Correct name, price, description, and image
Required options, such as processor, RAM, and HDD on the custom computer, and recipient fields on gift cards
Price updates when options change
Quantity field boundaries (0, negative, large, non-numeric)
Add to cart, add to wishlist, add to compare, and email a friend
Product reviews: submit as guest vs logged in, required fields, rating validation

5. Shopping cart

Add single and multiple products, and update quantity
Remove an item and confirm the cart is empty
Totals, subtotal, and tax calculations
Discount coupon and gift card codes (valid and invalid)
Estimate shipping (country/state/zip)
Terms-of-service checkbox required before checkout
Cart persistence after logout/login

6. Checkout (the highest-value end-to-end flow)

Guest checkout vs registered-user checkout
Billing address validation (all required fields, country/state dependencies)
Ship to the same address vs a new one, and in-store pickup
Each shipping method (Ground, Next Day Air, 2nd Day Air) and its effect on total
Each payment method (COD, Check/Money Order, Credit Card, Purchase Order)
Credit card field validation (invalid number, expired date, wrong CVV)
Order confirmation page, order number, and order details
Back-navigation between checkout steps

7. Wishlist and compare

Add and remove items, and move wishlist items to the cart
Update quantities, and share the wishlist via email
Compare up to four products, clear the list, and remove one item

8. My account

Edit customer info
Add, edit, and delete addresses
Order history and order details, reorder, and PDF invoice download
Change password (old password check, new password rules)
Downloadable products and back-in-stock subscriptions

9. Other site features

Newsletter subscription (valid, invalid, duplicate)
Community poll (vote without selecting, vote with a selection, results display)
Contact Us form (validation and success message)
News, blog, and forum pages (open items, post comments)
Sitemap, and the currency/language selector if enabled
Recently viewed products, and product tags

10. Non-functional and cross-cutting

Cross-browser runs (Chrome, Firefox, Edge) and responsive layouts
Basic accessibility checks (axe-core: labels, alt text, keyboard navigation)
Page load smoke checks and broken-link checks
Security basics: XSS strings in the search and review fields, and access to account pages when logged out
API checks if you want a faster layer (the site’s HTML is stable, but product and cart state can also be validated through the UI)


# Demo Web Shop – Playwright + TypeScript suite

Layered Page Object framework: **Spec → Fixture → Action → Helper → ActionUtils + Page Object → Playwright**.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env      # then fill in the values
```

All configuration and sensitive values live in `.env` (git-ignored) and are validated by
`Utilities/config/env.config.ts` (zod). Missing or invalid values fail fast with a clear message.

## Folder layout

| Folder | Purpose |
|---|---|
| `PageObjectModel/` | Locators only (`Login`, `Register`, `PasswordRecovery`, `Header`, `Footer`, `Catalog`, `Search`) |
| `Utilities/ActionUtils.ts` | Reusable Playwright wrappers |
| `Utilities/Helper/` | Small steps and assertions per feature |
| `Utilities/Actions/` | Full scenarios chaining helpers |
| `Utilities/fixtures/base.fixture.ts` | Injects actions into tests |
| `Utilities/testData/` | Faker users, categories, footer links, search terms, expected messages |
| `tests/` | Thin specs, tagged for filtering |

## Scripts

`npm run test:headless | test:headed | test:ui | test:e2e | test:auth | test:registration | test:login | test:catalog | test:navigation | test:search | typecheck | report`

## Tags

`@auth @registration @login @forgot-password @navigation @catalog @search @e2e @smoke`
