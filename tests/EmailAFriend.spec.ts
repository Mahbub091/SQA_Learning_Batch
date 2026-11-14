import { test } from '@root/Utilities/fixtures/base.fixture';

test.describe('Email a friend', { tag: ['@product', '@email-a-friend'] }, () => {
  test('rejects an empty form', async ({ emailAFriendActions }) => {
    await emailAFriendActions.UserShouldSeeValidationForEmptyFields();
  });

  test('rejects an invalid "your email" format', async ({ emailAFriendActions }) => {
    await emailAFriendActions.UserShouldSeeValidationForInvalidYourEmail();
  });

  test(
    'sends the email with valid details',
    { tag: ['@e2e', '@smoke'] },
    async ({ emailAFriendActions }) => {
      await emailAFriendActions.UserShouldBeAbleToSendEmailToFriend();
    },
  );
});
