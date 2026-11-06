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
| `PageObjectModel/` | Locators only (`Login`, `Register`, `PasswordRecovery`, `Header`, `Footer`, `Catalog`, `Search`, `Product`, `ProductReview`, `EmailAFriend`) |
| `Utilities/ActionUtils.ts` | Reusable Playwright wrappers |
| `Utilities/Helper/` | Small steps and assertions per feature |
| `Utilities/Actions/` | Full scenarios chaining helpers |
| `Utilities/fixtures/base.fixture.ts` | Injects actions into tests |
| `Utilities/testData/` | `FakeDataProvider` (the only place Faker is used) plus thin wrappers around `data/static.json` and `data/dynamic.json` |
| `data/` | `static.json` (fixed values: categories, messages, product names) and `dynamic.json` (rules for generated values) |
| `tests/` | Thin specs, tagged for filtering — one `test.describe` per file, no nesting |

## Scripts

`npm run test:headless | test:headed | test:ui | test:e2e | test:auth | test:registration | test:login | test:catalog | test:navigation | test:search | test:product | test:review | test:email-a-friend | typecheck | report`

## Tags

`@auth @registration @login @forgot-password @navigation @catalog @search @product @review @email-a-friend @e2e @smoke`

## A note on the product detail tests

`data/static.json`'s `productDetail` block uses nopCommerce's standard sample-data names
("Build your own computer", "$25 Virtual Gift Card") and the platform's conventional field ids
(`RecipientName`, `Title`, `Rating`, ...). These haven't been checked against this Demo Web Shop
instance's live DOM, so the first run is likely to need locator or message fixes — see the
`_note` field in that JSON block and the comments at the top of `Product.page.ts`,
`ProductReview.page.ts` and `EmailAFriend.page.ts`.
