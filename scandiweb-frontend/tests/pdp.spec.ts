import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('/');

  // Navigate to Tech category
  await page.locator('a[href="/tech"]').click();
  await expect(page.locator('[data-testid^="product-"]')).toBeVisible();
  
  // Find iPhone 12 Pro card
  const productCard = page.locator('[data-testid="product-apple-iphone-12-pro"]');
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  // Verify product details
  await expect(page.locator('[data-testid="product-title"]')).toHaveText('iPhone 12 Pro');
  await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible();

  // Updated color selector
  const colorLocator = page.locator(
    '[data-testid="product-attribute-color-44ff03"]'
  ).first();
  await expect(colorLocator).toBeVisible({ timeout: 15000 });
  
  // Updated capacity selector
  const capacityLocator = page.locator('[data-testid="product-attribute-capacity-512g"]');
  await expect(capacityLocator).toBeVisible();

  // Select attributes
  await colorLocator.click();
  await capacityLocator.click();

  // Verify quantity controls
  await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  // Verify add to cart is disabled for out-of-stock product
  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeDisabled();
});