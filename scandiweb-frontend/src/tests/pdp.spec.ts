import { test, expect } from '@playwright/test';

test('product detail page shows correct info and allows adding to cart', async ({ page }) => {
  await page.goto('/');
  
  // Wait for either products or error state
  await Promise.race([
    page.waitForSelector('[data-testid="product-card"]', { state: 'attached', timeout: 15000 }),
    page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 15000 })
  ]);
  
  // Verify we have products
  const productCards = page.getByTestId('product-card');
  const count = await productCards.count();
  
  if (count === 0) {
    const errorVisible = await page.getByTestId('error-message').isVisible();
    if (errorVisible) {
      const errorText = await page.getByTestId('error-message').textContent();
      throw new Error(`Products failed to load: ${errorText}`);
    }
    throw new Error('No products found and no error message displayed');
  }
  
  expect(count).toBeGreaterThan(0);
  // Click first product's image
  await productCards.first().getByTestId('product-card-image').click();
  
  // Wait for PDP to load
  await page.waitForSelector('[data-testid="pdp-title"]', { state: 'visible' });
  await expect(page.getByTestId('add-to-cart-btn')).toBeVisible();

  // Handle attributes if present
  const attributeSections = await page.locator('[data-testid^="attribute-"]').count();
  for (let i = 0; i < attributeSections; i++) {
    await page.locator(`[data-testid="attribute-item"]`).first().click();
  }

  // Add to cart
  await page.getByTestId('add-to-cart-btn').click();
  
  // Verify cart updates
  await page.getByTestId('cart-btn').click();
  await expect(page.getByTestId('cart-overlay')).toBeVisible();
});