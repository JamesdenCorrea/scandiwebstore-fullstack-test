import { test, expect } from '@playwright/test';

test('currency and category switching work from header', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('currency-switcher').click();
  await page.getByTestId('currency-option-USD').click();

  await expect(page.getByTestId('active-currency')).toHaveText('$');

  await page.getByTestId('category-nav').getByText('Tech').click();
  await expect(page.getByTestId('category-title')).toHaveText('Tech');
});
