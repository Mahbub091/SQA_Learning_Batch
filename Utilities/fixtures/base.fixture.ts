import { test as base, Page, BrowserContext } from '@playwright/test';
import ActionUtils from '../ActionUtils';
import { LoginHelper } from '../Helper/Login.helper';
import LoginActions from '../Actions/Login.action';
import { LoginPage } from '../../PageObjectModel/Login.page';

interface TestFixtures {
  browserContext: BrowserContext;
  runner: ActionUtils;
  userLoginPage: LoginPage;
  userLoginHelper: LoginHelper;
  userLoginActions: LoginActions;
}

const test = base.extend<TestFixtures>({
  browserContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
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
    const userLoginPageInstance = new LoginPage(runner['page']);
    await use(userLoginPageInstance);
  },

  userLoginHelper: async ({ runner }, use) => {
    const userLoginHelperInstance = new LoginHelper(runner['page']);
    await use(userLoginHelperInstance);
  },
  userLoginActions: async ({ runner }, use) => {
    const userLoginActionsInstance = new LoginActions(runner['page']);
    await use(userLoginActionsInstance);
  },
});

export { test };
