import { faker } from '@faker-js/faker';
import { env } from '../config/env.config';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Builds a brand-new user. The e-mail is unique per call, so tests never collide. */
export function generateUser(overrides: Partial<UserData> = {}): UserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const unique = `${Date.now()}${faker.string.alphanumeric({ length: 5, casing: 'lower' })}`;
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
