/**
 * Reads the `.env` file, checks every value with zod, and exposes them as one typed `env` object.
 * If something is missing or wrong, the run stops immediately with a clear message
 * instead of failing later in a confusing way.
 */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

// The rules every environment variable must follow.
const envSchema = z.object({
  LANDING_PAGE_URL: z.url({
    message: 'must be a full URL, e.g. https://demowebshop.tricentis.com/',
  }),
  USER_EMAIL: z.string().min(1),
  USER_PASSWORD: z.string().min(1),
  NEW_USER_PASSWORD: z.string().min(6, 'must be at least 6 characters to be a valid password'),
  WRONG_PASSWORD: z.string().min(1),
  SHORT_PASSWORD: z.string().min(1).max(5, 'must be shorter than 6 characters (the site minimum)'),
  MISMATCH_PASSWORD: z.string().min(1),
  TEST_EMAIL_DOMAIN: z.string().min(3),
});

const parsed = envSchema.safeParse(process.env);

// Stop early and list every problem at once.
if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Invalid or missing environment variables. Copy .env.example to .env and fill these in:\n${problems}`,
  );
}

// Make sure the base URL always ends with "/", so paths can be added to it safely.
const baseUrl = parsed.data.LANDING_PAGE_URL.endsWith('/')
  ? parsed.data.LANDING_PAGE_URL
  : `${parsed.data.LANDING_PAGE_URL}/`;

/** The validated environment values. Import this instead of reading `process.env` directly. */
export const env = {
  ...parsed.data,
  LANDING_PAGE_URL: baseUrl,
};

/** Builds an absolute URL for a site path such as `/books` or `search?q=abc`. */
export function urlFor(path: string = ''): string {
  return new URL(path.replace(/^\//, ''), env.LANDING_PAGE_URL).toString();
}
