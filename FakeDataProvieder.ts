import { faker } from '@faker-js/faker';
import { env } from '../config/env.config';
import { dynamicData } from './data.loader';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * The single place where Faker is used.
 *
 * Specs, actions and helpers never import Faker directly; they ask this class for data.
 * The generation rules (e-mail template, lengths, prefixes) live in `data/dynamic.json`,
 * and anything sensitive (domain, passwords) comes from `.env` through `env.config.ts`.
 */
export class FakeDataProvider {
  static firstName(): string {
    return faker.person.firstName();
  }

  static lastName(): string {
    return faker.person.lastName();
  }

  /**
   * Builds a unique e-mail from the template in dynamic.json, e.g.
   * `{firstName}.{lastName}.{unique}@{domain}`. The `{unique}` part is a timestamp plus random
   * characters, so two calls never return the same address.
   */
  static uniqueEmail(
    firstName: string = this.firstName(),
    lastName: string = this.lastName(),
  ): string {
    const { emailTemplate, uniqueSuffixLength } = dynamicData.user;
    const unique = `${Date.now()}${this.alphanumeric(uniqueSuffixLength)}`;

    return emailTemplate
      .replace('{firstName}', firstName)
      .replace('{lastName}', lastName)
      .replace('{unique}', unique)
      .replace('{domain}', env.TEST_EMAIL_DOMAIN)
      .toLowerCase()
      .replace(/[^a-z0-9.@_-]/g, '');
  }

  /** A random password of the length set in dynamic.json (not the one stored in .env). */
  static password(): string {
    return faker.internet.password({ length: dynamicData.password.length });
  }

  /** A brand-new user. Pass `overrides` to replace any field for a specific scenario. */
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

  /** A search term that cannot match any product, different on every call. */
  static noResultTerm(): string {
    const { prefix, randomLength } = dynamicData.noResultTerm;
    return `${prefix}${this.alpha(randomLength)}`;
  }

  /** A very long random string for boundary tests (length comes from dynamic.json). */
  static longString(): string {
    return this.alpha(dynamicData.longString.length);
  }

  static alpha(length: number): string {
    return faker.string.alpha({ length, casing: 'lower' });
  }

  static alphanumeric(length: number): string {
    return faker.string.alphanumeric({ length, casing: 'lower' });
  }
}