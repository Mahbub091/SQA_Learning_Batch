/**
 * Fixtures = ready-made objects that Playwright creates for every test and hands to it.
 *
 * A spec only has to ask for what it needs, for example:
 *   test('logs in', async ({ userLoginActions }) => { ... });
 * Playwright then opens a fresh browser context + page, builds the action class around that page,
 * and closes everything again when the test ends.
 *
 * Always import `test` from THIS file (not from '@playwright/test') in the specs.
 */
import { test as base, BrowserContext } from '@playwright/test';
import ActionUtils from '@root/Utilities/ActionUtils';
import { LoginHelper } from '@root/Utilities/Helper/Login.helper';
import LoginActions from '@root/Utilities/Actions/Login.action';
import RegisterActions from '@root/Utilities/Actions/Register.action';
import PasswordRecoveryActions from '@root/Utilities/Actions/PasswordRecovery.action';
import NavigationActions from '@root/Utilities/Actions/Navigation.action';
import CatalogActions from '@root/Utilities/Actions/Catalog.action';
import SearchActions from '@root/Utilities/Actions/Search.action';
import { LoginPage } from '@root/PageObjectModel/Login.page';

/** The list of fixtures a test can ask for (name -> type). */
interface TestFixtures {
  /** A clean, isolated browser profile (own cookies / storage) for one test. */
  browserContext: BrowserContext;
  /** ActionUtils bound to a new page; its `.page` is the page every other fixture shares. */
  runner: ActionUtils;
  userLoginPage: LoginPage;
  userLoginHelper: LoginHelper;
  userLoginActions: LoginActions;
  userRegisterActions: RegisterActions;
  passwordRecoveryActions: PasswordRecoveryActions;
  navigationActions: NavigationActions;
  catalogActions: CatalogActions;
  searchActions: SearchActions;
}

const test = base.extend<TestFixtures>({
  // Creates a new browser context for the test and always closes it afterwards.
  browserContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  // Opens one page in that context. All the fixtures below reuse this same page.
  runner: async ({ browserContext }, use) => {
    const page = await browserContext.newPage();
    const utilsInstance = new ActionUtils(page);
    try {
      await use(utilsInstance);
    } finally {
      await page.close();
    }
  },
  userLoginPage: async ({ runner }, use) => {
    await use(new LoginPage(runner.page));
  },
  userLoginHelper: async ({ runner }, use) => {
    await use(new LoginHelper(runner.page));
  },
  userLoginActions: async ({ runner }, use) => {
    await use(new LoginActions(runner.page));
  },
  userRegisterActions: async ({ runner }, use) => {
    await use(new RegisterActions(runner.page));
  },
  passwordRecoveryActions: async ({ runner }, use) => {
    await use(new PasswordRecoveryActions(runner.page));
  },
  navigationActions: async ({ runner }, use) => {
    await use(new NavigationActions(runner.page));
  },
  catalogActions: async ({ runner }, use) => {
    await use(new CatalogActions(runner.page));
  },
  searchActions: async ({ runner }, use) => {
    await use(new SearchActions(runner.page));
  },
});

export { test };
