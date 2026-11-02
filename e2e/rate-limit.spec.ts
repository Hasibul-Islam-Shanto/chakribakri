import { test, expect } from '@playwright/test';

test.describe('Rate Limiting Protection (e2e/rate-limit.spec.ts)', () => {
  test.use({
    extraHTTPHeaders: {
      'x-forwarded-for': '198.51.100.99',
    },
  });

  test('rapidly submits wrong credentials 5 times and asserts warning banner blocks subsequent attempts', async ({
    page,
  }) => {
    await page.goto('/login');

    const usernameInput = page.getByLabel(/^Username/i);
    const passwordInput = page.getByLabel(/^Password/i);
    const submitButton = page.getByRole('button', { name: /^Sign in/i });

    // Submit invalid credentials up to 6 times until rate limit throttle triggers
    for (let attemptIndex = 1; attemptIndex <= 6; attemptIndex += 1) {
      const isThrottled = await page
        .getByRole('alert')
        .filter({ hasText: /Too many attempts/i })
        .isVisible();
      if (isThrottled) {
        break;
      }

      const isInputDisabled = await usernameInput.isDisabled();
      if (isInputDisabled) {
        break;
      }

      await usernameInput.fill(`rate_limit_user_${attemptIndex}`);
      await passwordInput.fill('IncorrectPassword123!');
      await submitButton.click();

      // Small pause to allow server response to arrive
      await page.waitForTimeout(400);
    }

    // Verify rate limit warning alert is displayed
    const rateLimitAlertBanner = page.getByRole('alert').filter({ hasText: /Too many attempts/i });
    await expect(rateLimitAlertBanner).toBeVisible();

    // Verify the submit button is strictly disabled
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveAttribute('aria-disabled', 'true');
  });
});
