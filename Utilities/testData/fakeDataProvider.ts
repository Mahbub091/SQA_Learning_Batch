/**
 * FakeDataProvider = a standalone toolbox that creates random ("fake") test data.
 *
 * Why random data? Every run needs a NEW user (the shop rejects an e-mail that is already
 * registered), and random names / e-mails also stop tests from depending on old data.
 *
 * This file is separate on purpose: no other file imports it yet, so the existing tests are
 * untouched (they still use `generateUser()` from `user.data.ts`). Use it in new tests / helpers.
 *
 * Usage:
 *   import { FakeDataProvider } from '@root/Utilities/testData/fakeDataProvider';
 *   const user = FakeDataProvider.user();                       // a complete new user
 *   const other = FakeDataProvider.user({ email: 'a@b.com' });  // same, but with one value forced
 *
 * Fixed values that must never change (expected messages, search terms ...) do NOT belong here:
 * messages live in `Data/StaticData.json`, search terms in `search.data.ts`.
 */
import { faker } from '@faker-js/faker';
import { env } from '@root/Utilities/config/env.config';
// Only the shape of a user is shared with `user.data.ts` (type import: nothing runs from there).
import type { UserData } from '@root/Utilities/testData/user.data';

export class FakeDataProvider {
  /** A random first name, e.g. "Amina". */
  static firstName(): string {
    return faker.person.firstName();
  }

  /** A random last name, e.g. "Rahman". */
  static lastName(): string {
    return faker.person.lastName();
  }

  /**
   * A new, valid e-mail address that has never been used before.
   * Format: first.last.<timestamp><5 random letters>@<TEST_EMAIL_DOMAIN from .env>
   * The timestamp + random letters make a repeat practically impossible.
   */
  static uniqueEmail(
    firstName: string = this.firstName(),
    lastName: string = this.lastName(),
  ): string {
    const unique = `${Date.now()}${faker.string.alphanumeric({ length: 5, casing: 'lower' })}`;
    // Keep only characters that are safe in an e-mail address.
    return `${firstName}.${lastName}.${unique}@${env.TEST_EMAIL_DOMAIN}`
      .toLowerCase()
      .replace(/[^a-z0-9.@_-]/g, '');
  }

  /** Text that is NOT an e-mail address, for "wrong email" validation tests. */
  static invalidEmail(): string {
    return 'not-an-email';
  }

  /** A random lower-case string of the given length (default 10), e.g. for unknown search terms. */
  static randomString(length: number = 10): string {
    return faker.string.alpha({ length, casing: 'lower' });
  }

  /**
   * A brand-new user with random data and the valid password from `.env` (NEW_USER_PASSWORD).
   * Pass `overrides` to force a value, e.g. `FakeDataProvider.user({ password: env.SHORT_PASSWORD })`.
   */
  static user(overrides: Partial<UserData> = {}): UserData {
    const firstName = this.firstName();
    const lastName = this.lastName();

    return {
      firstName,
      lastName,
      email: this.uniqueEmail(firstName, lastName),
      password: env.NEW_USER_PASSWORD,
      ...overrides,
    };
  }
}
