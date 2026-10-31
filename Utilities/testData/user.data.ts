import { faker } from '@faker-js/faker';
import { env } from '@root/Utilities/config/env.config';

/** The details needed to register and log in a user. */
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Builds a brand-new user with random (faker) data. The e-mail is unique per call, so tests never
 * collide with each other. Pass `overrides` to force a value, e.g. `generateUser({ email: 'x' })`.
 */
export function generateUser(overrides: Partial<UserData> = {}): UserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // Current time + 5 random characters = a value that is practically never repeated.
  const unique = `${Date.now()}${faker.string.alphanumeric({ length: 5, casing: 'lower' })}`;
  // Keep only characters that are safe in an e-mail address.
  const email = `${firstName}.${lastName}.${unique}@${env.TEST_EMAIL_DOMAIN}`
    .toLowerCase()
    .replace(/[^a-z0-9.@_-]/g, '');

  return {
    firstName,
    lastName,
    email,
    password: env.NEW_USER_PASSWORD,
    ...overrides,
  };
}
