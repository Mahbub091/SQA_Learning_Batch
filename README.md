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
| `Data/StaticData.json` | **All expected error / success messages in one place** |
| `PageObjectModel/` | Locators only (`Login`, `Register`, `PasswordRecovery`, `Header`, `Footer`, `Catalog`, `Search`) |
| `Utilities/ActionUtils.ts` | Reusable Playwright wrappers |
| `Utilities/Helper/` | Small steps and assertions per feature |
| `Utilities/Actions/` | Full scenarios chaining helpers |
| `Utilities/fixtures/base.fixture.ts` | Injects actions into tests |
| `Utilities/testData/` | Categories, footer links, search terms, expected messages |
| `Utilities/testData/fakeDataProvider.ts` | Standalone toolbox for random (faker) users, unique e-mails and strings |
| `tests/` | Thin specs, tagged for filtering |

## Imports use `@root/`

Every import starts from the project root, so you never write `../../`:

```ts
import { LoginPage } from '@root/PageObjectModel/Login.page';
import data from '@root/Data/StaticData.json';
```

The alias is defined once, in `tsconfig.json` (`"paths": { "@root/*": ["./*"] }`).
Playwright reads the same setting, so it works when the tests run, not only in the editor.

## Changing an expected message

Open `Data/StaticData.json` and edit the text. Nothing else needs to change:
`Utilities/testData/messages.data.ts` turns each text into a case-insensitive regex and the
helpers use that regex in their assertions.

```json
{
  "ErrorMessages": { "emailRequiredError": "Email is required" },
  "SuccessMessages": { "registrationCompleted": "Your registration completed" }
}
```

JSON does not allow comments, so the keys are named to explain themselves
(`<feature><What>Error`, e.g. `searchMinLengthError`).

## Scripts

`npm run test:headless | test:headed | test:ui | test:e2e | test:auth | test:registration | test:login | test:catalog | test:navigation | test:search | typecheck | report`

## Tags

`@auth @registration @login @forgot-password @navigation @catalog @search @e2e @smoke`
