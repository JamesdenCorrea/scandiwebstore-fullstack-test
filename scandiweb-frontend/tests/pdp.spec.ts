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

  const colorLocator = page
    .locator('[data-testid="product-attribute-color-44FF03"], [data-testid="product-attribute-color-Green"]')
    .first();
  await expect(colorLocator).toBeVisible({ timeout: 10000 });

  const capacityLocator = page
    .locator('[data-testid="product-attribute-capacity-512G"], [data-testid="product-attribute-capacity-512g"]')
    .first();
  await expect(capacityLocator).toBeVisible();

  await colorLocator.click();
  await capacityLocator.click();

  await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeDisabled();
});
