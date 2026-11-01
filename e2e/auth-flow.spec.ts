import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (e2e/auth-flow.spec.ts)', () => {
  test('unauthenticated access to /dashboard redirects immediately to /login', async ({ page }) => {
    // Navigate directly to protected route
    await page.goto('/dashboard');

    // Should immediately redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in');
  });

  test('successful Sign Up creates a session cookie and navigates to /dashboard', async ({
    page,
    context,
  }) => {
    const uniqueUsername = `user_${Date.now()}`;
    const securePassword = 'TestPassword123!';

    await page.goto('/login');

    // Switch to sign-up tab
    const switchToSignUpButton = page.getByRole('button', { name: /switch to create account/i });
    await switchToSignUpButton.click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create an account');

    // Fill form fields
    await page.getByLabel(/^Username/i).fill(uniqueUsername);
    await page.getByLabel(/^Password/i).fill(securePassword);
    await page.getByLabel(/Confirm Password/i).fill(securePassword);

    // Submit registration
    const submitButton = page.getByRole('button', { name: /^Create account/i });
    await submitButton.click();

    // Verify redirection to /dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify session cookie was set
    const browserCookies = await context.cookies();
    const sessionCookieRecord = browserCookies.find(
      (cookieItem) => cookieItem.name === 'chakribakri_session'
    );
    expect(sessionCookieRecord).toBeDefined();
    expect(sessionCookieRecord?.value.length).toBeGreaterThan(0);

    // Verify user profile badge is rendered on dashboard header
    await expect(page.getByRole('banner').getByText(uniqueUsername)).toBeVisible();
  });

  test('successful Sign In logs in the user and renders user metrics', async ({ page }) => {
    // First register a dedicated user
    const loginTestUsername = `signin_${Date.now()}`;
    const loginTestPassword = 'AuthPassword456!';

    await page.goto('/login');
    await page.getByRole('button', { name: /switch to create account/i }).click();
    await page.getByLabel(/^Username/i).fill(loginTestUsername);
    await page.getByLabel(/^Password/i).fill(loginTestPassword);
    await page.getByLabel(/Confirm Password/i).fill(loginTestPassword);
    await page.getByRole('button', { name: /^Create account/i }).click();

    await page.waitForURL(/\/dashboard/);

    // Log out to clear session using accessible name "Log out of chakriBakri"
    const logoutButton = page.getByRole('button', { name: /log out/i });
    await logoutButton.click();
    await page.waitForURL(/\/login/);

    // Now perform Sign In
    await page.getByLabel(/^Username/i).fill(loginTestUsername);
    await page.getByLabel(/^Password/i).fill(loginTestPassword);
    await page.getByRole('button', { name: /^Sign in/i }).click();

    // Verify redirection back to /dashboard
    await page.waitForURL(/\/dashboard/);

    // Verify user metrics bar is rendered on the dashboard
    await expect(page.getByText('Total Applications')).toBeVisible();
    await expect(page.getByRole('banner').getByText(loginTestUsername)).toBeVisible();
  });

  test('logout clears the active session and redirects back to /login', async ({
    page,
  }) => {
    // Register and navigate to dashboard
    const logoutUsername = `logout_${Date.now()}`;
    const logoutPassword = 'LogoutPassword789!';

    await page.goto('/login');
    await page.getByRole('button', { name: /switch to create account/i }).click();
    await page.getByLabel(/^Username/i).fill(logoutUsername);
    await page.getByLabel(/^Password/i).fill(logoutPassword);
    await page.getByLabel(/Confirm Password/i).fill(logoutPassword);
    await page.getByRole('button', { name: /^Create account/i }).click();

    await page.waitForURL(/\/dashboard/);

    // Click logout
    const logoutButton = page.getByRole('button', { name: /log out/i });
    await logoutButton.click();

    // Verify redirected to /login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);

    // Verify accessing /dashboard redirects back to /login
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
