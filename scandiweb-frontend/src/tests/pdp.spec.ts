import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('PDP: IN-STOCK product can be interacted with and added to cart', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  console.log('Navigated to home page');

  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

  // Click in-stock product
  await page.locator('[data-testid="product-apple-iphone-12-pro"]')
    .getByTestId('product-card-image')
    .click();

  await expect(page.getByTestId('pdp-title')).toBeVisible({ timeout: 10000 });

  // Interact with attributes
  const attributeSections = page.locator('[data-testid^="attribute-"]');
  const attrCount = await attributeSections.count();

  for (let i = 0; i < attrCount; i++) {
    const items = attributeSections.nth(i).locator('[data-testid="attribute-item"]');
    if (await items.count() > 0) {
      await items.first().click();
    }
  }

  // Adjust quantity
  const plus = page.getByTestId('increase-quantity');
  const minus = page.getByTestId('decrease-quantity');
  const value = page.getByTestId('quantity-value');

  await plus.click();
  await expect(value).toHaveText('2');
  await minus.click();
  await expect(value).toHaveText('1');

  // Add to cart should be enabled
  const addToCart = page.getByTestId('add-to-cart');
  await expect(addToCart).toBeVisible();
  await expect(addToCart).not.toBeDisabled();

  await addToCart.click();

  // Verify cart overlay
  await page.getByTestId('cart-btn').click();
  await expect(page.getByTestId('cart-overlay')).toBeVisible();
  expect(await page.locator('[data-testid="cart-overlay"] .cartItem').count()).toBeGreaterThan(0);
});

test('PDP: OUT-OF-STOCK product disables Add to Cart', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Click out-of-stock product
  await page.locator('[data-testid="product-xbox-series-s"]')
    .getByTestId('product-card-image')
    .click();

  await expect(page.getByTestId('pdp-title')).toBeVisible({ timeout: 10000 });

  // "Add to Cart" should be disabled
  const disabledButton = page.locator('[data-testid="add-to-cart"][disabled]');
  await expect(disabledButton).toBeVisible({ timeout: 10000 });
});
