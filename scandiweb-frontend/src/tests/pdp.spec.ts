import { test, expect } from '@playwright/test';

test('product detail page shows correct info and allows adding to cart', async ({ page }) => {
  // Go directly to the product listing category to avoid redirect delays
  await page.goto('http://localhost:5173/all');

  // Wait for either products to appear or an error message to show
  await Promise.race([
    page.waitForSelector('[data-testid="product-card"]', { state: 'attached', timeout: 15000 }),
    page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 15000 })
  ]);

  // Check if there are any products available
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

  // 🔍 Find the first product that is in stock
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

  // Verify add to cart button exists and is enabled
  const addToCartButton = page.locator('[data-testid="add-to-cart-btn"]');
  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();

  // If there are attribute sections, select the first option from each
  const attributeSections = page.locator('[data-testid^="attribute-"]');
  const sectionCount = await attributeSections.count();

  for (let i = 0; i < sectionCount; i++) {
    const firstOption = attributeSections.nth(i).locator('[data-testid="attribute-item"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }
  }

  // Add product to cart
  await addToCartButton.click();

// Wait for cart overlay to be visible (assumes it opens automatically after adding to cart)
await page.waitForSelector('[data-testid="cart-overlay"]', { state: 'visible', timeout: 5000 });
await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();

});
