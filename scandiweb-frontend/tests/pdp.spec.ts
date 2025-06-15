import { test, expect } from '@playwright/test';

test('can add to cart', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/tech"]').click();
  await expect(page.locator('[data-testid^="product-"]')).toBeVisible();

  const productCard = page.locator('[data-testid="product-iphone-12-pro"]');
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.getByTestId('product-title')).toHaveText('iPhone 12 Pro');

  const colorOption = page.locator('[data-testid^="product-attribute-color-"]').first();
  const capacityOption = page.locator('[data-testid^="product-attribute-capacity-"]').first();

  await expect(colorOption).toBeVisible({ timeout: 10000 });
  await colorOption.click();

  await expect(capacityOption).toBeVisible({ timeout: 10000 });
  await capacityOption.click();

  await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  const addToCart = page.getByTestId('add-to-cart');
  await expect(addToCart).toBeEnabled();
});
