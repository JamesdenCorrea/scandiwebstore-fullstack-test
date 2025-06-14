import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-testid="category-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="category-name"]')).toHaveText('all');

  await page.locator('a[href="/tech"]').click();

  await expect(page.locator('[data-testid="category-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="category-name"]')).toHaveText('tech');

  await page.locator('[data-testid="product-iphone-12-pro"]').click();

  // Wait for loading to appear and disappear
  await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'visible' });
  await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden' });

  await expect(page.locator('[data-testid="pdp-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="product-attribute-capacity-512GB"]')).toBeVisible();
  await expect(page.locator('[data-testid="product-attribute-color-44FF03"]')).toBeVisible();
  await expect(page.locator('[data-testid="price-section"]')).toBeVisible();

  // Get the Add to Cart button
  const addToCart = page.locator('[data-testid="add-to-cart"]');

  // Check if product is out of stock using the visual indicator
  const isOutOfStock = await page.locator('[data-testid="out-of-stock"]').isVisible();

  if (isOutOfStock) {
    console.log('Product is out of stock — button is disabled.');

    await expect(addToCart).toBeDisabled();
    await expect(addToCart).toHaveText('OUT OF STOCK');
  } else {
    // Proceed with selecting attributes and adding to cart
    await page.locator('[data-testid="product-attribute-capacity-512GB"]').click();
    await page.locator('[data-testid="product-attribute-color-44FF03"]').click();

    await page.locator('[data-testid="increase-quantity"]').click();
    await expect(page.locator('[data-testid="quantity-value"]')).toHaveText('2');

    await addToCart.click();
    await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();
  }
});
