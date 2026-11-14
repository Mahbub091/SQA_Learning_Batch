import { test } from '@root/Utilities/fixtures/base.fixture';
import { reviewRatings } from '@root/Utilities/testData/product.data';

test.describe('Product reviews', { tag: ['@product', '@review'] }, () => {
  test('guest: rejects an empty review', async ({ productReviewActions }) => {
    await productReviewActions.GuestShouldSeeRequiredFieldErrorsOnEmptyReview();
  });

  test(
    'guest: can submit a review without logging in',
    { tag: ['@e2e', '@smoke'] },
    async ({ productReviewActions }) => {
      await productReviewActions.GuestShouldBeAbleToSubmitAReview();
    },
  );

  test('logged in: can submit a review', { tag: ['@e2e'] }, async ({ productReviewActions }) => {
    await productReviewActions.LoggedInUserShouldBeAbleToSubmitAReview();
  });

  for (const rating of reviewRatings) {
    test(`rating: accepts a rating of ${rating}`, async ({ productReviewActions }) => {
      await productReviewActions.UserShouldBeAbleToSubmitAReviewWithRating(rating);
    });
  }
});
