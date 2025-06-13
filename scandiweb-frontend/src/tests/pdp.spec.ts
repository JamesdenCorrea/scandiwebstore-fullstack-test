import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test('product detail page shows correct info and allows adding to cart', async ({ page }) => {
  // Navigate to product listing page using BASE_URL
  await page.goto(`${BASE_URL}/all`);

  // Wait for products or error message
  await Promise.race([
    page.waitForSelector('[data-testid="product-card"]', { state: 'attached', timeout: 15000 }),
    page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 15000 })
  ]);

  const productCards = page.locator('[data-testid="product-card"]');
  const count = await productCards.count();

  if (count === 0) {
    const errorVisible = await page.locator('[data-testid="error-message"]').isVisible();
    if (errorVisible) {
      const errorText = await page.locator('[data-testid="error-message"]').textContent();
      throw new Error(`Products failed to load: ${errorText}`);
    }
    throw new Error('No products found and no error message displayed');
  }

  expect(count).toBeGreaterThan(0);

  // Find and click first in-stock product
  let productClicked = false;
  for (let i = 0; i < count; i++) {
    const card = productCards.nth(i);
    const outOfStockText = await card.locator('[data-testid="add-to-cart-btn"]').textContent();
    const isOutOfStock = outOfStockText?.trim().toLowerCase() === 'out of stock';

    if (!isOutOfStock) {
      await card.locator('[data-testid="product-card-image"]').click();
      productClicked = true;
      break;
    }
  }

  if (!productClicked) {
    throw new Error('No in-stock product found to test PDP functionality.');
  }

  // Wait for PDP to load
  await page.waitForSelector('[data-testid="pdp-title"]', { state: 'visible', timeout: 10000 });

  // Check add to cart button
  const addToCartButton = page.locator('[data-testid="add-to-cart-btn"]');
  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();

  // Select attribute options if present
  const attributeSections = page.locator('[data-testid^="attribute-"]');
  const sectionCount = await attributeSections.count();

  for (let i = 0; i < sectionCount; i++) {
    const firstOption = attributeSections.nth(i).locator('[data-testid="attribute-item"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }
  }

  // Add to cart
  await addToCartButton.click();

  // Verify cart overlay
  await page.waitForSelector('[data-testid="cart-overlay"]', { state: 'visible', timeout: 5000 });
  await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();
});
