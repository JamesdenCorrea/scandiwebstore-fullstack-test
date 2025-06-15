import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('/');

  await page.locator('a[href="/tech"]').click();
  await expect(page.locator('[data-testid^="product-"]')).toBeVisible();

  const productCard = page.locator('[data-testid="product-apple-iphone-12-pro"]');
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.locator('[data-testid="product-title"]')).toHaveText('iPhone 12 Pro');
  await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible();

  // ✅ Dynamically find the first swatch option
  const colorOption = page.locator('[data-testid^="product-attribute-color-"]').first();
  await expect(colorOption).toBeVisible({ timeout: 10000 });
  await colorOption.click();

  // ✅ Dynamically find the first capacity option
  const capacityOption = page.locator('[data-testid^="product-attribute-capacity-"]').first();
  await expect(capacityOption).toBeVisible({ timeout: 10000 });
  await capacityOption.click();

  await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeDisabled();
});
