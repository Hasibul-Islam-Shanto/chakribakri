import { test, expect } from '@playwright/test';

test.describe('Theme Toggling (e2e/theme-toggle.spec.ts)', () => {
  test('toggles theme button and asserts html element updates class between dark and light', async ({
    page,
  }) => {
    await page.goto('/login');

    const htmlRootElement = page.locator('html');

    // Locate the theme toggle button via its accessible role and label
    const themeToggleButton = page
      .getByRole('button', { name: /switch to (light|dark) mode/i })
      .first();

    await expect(themeToggleButton).toBeVisible();

    // Determine initial theme class state
    const initialClassName = (await htmlRootElement.getAttribute('class')) || '';
    const isInitiallyDark = initialClassName.includes('dark');

    // First toggle click
    await themeToggleButton.click();

    if (isInitiallyDark) {
      await expect(htmlRootElement).toHaveClass(/light/);
      await expect(htmlRootElement).not.toHaveClass(/(^|\s)dark(\s|$)/);
    } else {
      await expect(htmlRootElement).toHaveClass(/dark/);
      await expect(htmlRootElement).not.toHaveClass(/(^|\s)light(\s|$)/);
    }

    // Second toggle click to return to initial theme
    await themeToggleButton.click();

    if (isInitiallyDark) {
      await expect(htmlRootElement).toHaveClass(/dark/);
    } else {
      await expect(htmlRootElement).toHaveClass(/light/);
    }
  });
});

