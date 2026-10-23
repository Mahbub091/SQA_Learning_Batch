import { Page, expect, Locator, test } from '@playwright/test';

export default class ActionUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async NavigateToUrl(url: string, waitForLoadState: boolean = true): Promise<void> {
    try {
      await this.page.goto(url);
      if (waitForLoadState) {
        await this.page.waitForLoadState('networkidle');
      }
    } catch (error) {
      console.error('Error occurred while navigating to URL:', error);
      throw error;
    }
  }

  async ClickElement(locator: Locator): Promise<void> {
    try {
      await locator.click();
    } catch (error) {
      console.error('Error occurred while clicking the element:', error);
      throw error;
    }
  }

  async TypeText(locator: Locator, text: string): Promise<void> {
    try {
      await locator.fill(text);
    } catch (error) {
      console.error('Error occurred while typing text:', error);
      throw error;
    }
  }

  async GetElementText(locator: Locator): Promise<string> {
    try {
      return (await locator.textContent()) || '';
    } catch (error) {
      console.error('Error occurred while getting element text:', error);
      throw error;
    }
  }

  async AssertElementVisible(locator: Locator): Promise<void> {
    try {
      await expect(locator).toBeVisible();
    } catch (error) {
      console.error('Error occurred while asserting element visibility:', error);
      throw error;
    }
  }

  async waitForDesiredState(
    time: number,
    Options: {
      waitForSelector?: string;
      waitForNetworkIdle?: boolean;
      waitForLoadState?: 'load' | 'domcontentloaded' | 'networkidle';
    } = {},
  ): Promise<void> {
    const { waitForSelector, waitForNetworkIdle, waitForLoadState } = Options;

    try {
      await this.page.waitForTimeout(time * 1000);
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, {
          state: 'visible',
          timeout: 10000,
        });
        // this.logMessage(`Waited for selector: ${waitForSelector}`);
      }

      if (waitForNetworkIdle) {
        await this.page.waitForLoadState('networkidle');
        // this.logMessage(`Waited for network idle`);
      }
      if (waitForLoadState) {
        await this.page.waitForLoadState(waitForLoadState);
        // this.logMessage(`Waited for load state: ${waitForLoadState}`);
      }
    } catch (error) {
      const errorMsg = `❌ Failed to wait for ${time} seconds to match specified conditions`;
      // this.logMessage(errorMsg, 'error');
      // await this.captureScreenshotOnFailure('wait');
      throw new Error(errorMsg);
    }
  }

  async verifyElementText(
    identifier: string | Locator,
    expectedText: string | string[],
    childSelector?: string,
    placeholderText: '-' | 'Not provided' = '-',
    timeout: number = 10000,
  ): Promise<void> {
    try {
      let target: Locator;
      let contextLabel: string;

      if (typeof identifier === 'string') {
        await this.page.waitForSelector(identifier, { timeout });
        target = this.page.locator(identifier);
        contextLabel = identifier;

        if (childSelector) {
          target = target.locator(childSelector);
          await expect(async () => {
            const count = await target.count();
            expect(count).toBeGreaterThan(0);
          }).toPass({ timeout });
          contextLabel += ` > ${childSelector}`;
        }
      } else {
        target = identifier;
        contextLabel = 'Locator instance';
      }

      const normalize = (val: string) => {
        const trimmed = val.trim();
        if (trimmed === '' || trimmed.toLowerCase() === placeholderText.toLowerCase()) {
          return '';
        }
        return trimmed.toLowerCase();
      };

      const logFailure = async (
        context: string,
        expected: string,
        actualRaw: string,
        actualNormalized: string,
      ) => {
        const errorMsg =
          `❌ Text mismatch at "${context}"\n` +
          `  ├─ Expected (normalized): "${expected}"\n` +
          `  ├─ Actual (raw): "${actualRaw}"\n` +
          `  └─ Actual (normalized): "${actualNormalized}"`;
        // this.logMessage(errorMsg, 'error');
        // await this.captureScreenshotOnFailure('verifyElementText');
        throw new Error(errorMsg);
      };

      await expect(async () => {
        const count = await target.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout });

      if (typeof expectedText === 'string') {
        const actualRawText = (await target.first().textContent()) ?? '';
        if (
          actualRawText.trim() === '' ||
          actualRawText.trim().toLowerCase() === placeholderText.toLowerCase()
        ) {
          throw new Error(
            `Element "${contextLabel}" text is empty or placeholder "${placeholderText}"`,
          );
        }

        const actualNormalized = normalize(actualRawText);
        const expectedNormalized = normalize(expectedText);

        if (actualNormalized !== expectedNormalized) {
          await logFailure(contextLabel, expectedNormalized, actualRawText, actualNormalized);
        }

        // this.logMessage(
        //   `✅ Text of "${contextLabel}" matches expected: "${actualRawText.trim()}"`,
        //   'info',
        // );
      } else {
        if (expectedText.length === 0) {
          // this.logMessage(
          //   `⚠️ Expected text array is empty for "${contextLabel}". Skipping validation.`,
          //   'warn',
          // );
          return;
        }

        const actualCount = await target.count();
        if (actualCount !== expectedText.length) {
          const errorMsg =
            `❌ Element count mismatch for "${contextLabel}"\n` +
            `  ├─ Expected count: ${expectedText.length}\n` +
            `  └─ Actual count:   ${actualCount}`;
          // this.logMessage(errorMsg, 'error');
          // await this.captureScreenshotOnFailure('verifyElementText');
          throw new Error(errorMsg);
        }

        for (let i = 0; i < actualCount; i++) {
          const element = target.nth(i);
          const actualRawText = (await element.textContent()) ?? '';

          if (
            actualRawText.trim() === '' ||
            actualRawText.trim().toLowerCase() === placeholderText.toLowerCase()
          ) {
            throw new Error(
              `Element "${contextLabel} [index: ${i}]" text is empty or placeholder "${placeholderText}"`,
            );
          }

          const actualNormalized = normalize(actualRawText);
          const expectedNormalized = normalize(expectedText[i]);
          const elementLabel = `${contextLabel} [index: ${i}]`;

          if (actualNormalized !== expectedNormalized) {
            await logFailure(elementLabel, expectedNormalized, actualRawText, actualNormalized);
          }

          // this.logMessage(
          //   `✅ Text of "${elementLabel}" matches expected: "${actualRawText.trim()}"`,
          //   'info',
          // );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        const enhancedMessage = `❌ verifyElementText failed: ${error.message}`;
        // this.logMessage(enhancedMessage, 'error');
        error.message = enhancedMessage;
        throw error;
      }
      throw error;
    }
  }
}
