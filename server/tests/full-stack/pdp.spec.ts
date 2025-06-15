import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  // Step 1: Navigate to homepage
  await page.goto('https://scandiwebstore-frontend-git-main-james-projects-8c83301a.vercel.app/all');
  
  // Step 2: Go to Tech category
  const techLink = page.locator('a[href="/tech"]');
  await expect(techLink).toBeVisible();
  await techLink.click();
  
  // Wait for category title to appear
  await expect(page.locator('h1:has-text("Tech")')).toBeVisible();

  // Step 3: Find iPhone 12 Pro card
  const productCard = page.locator('[data-testid="product-apple-iphone-12-pro"]');
  await expect(productCard).toBeVisible({ timeout: 15000 });
  
  // Step 4: Open product details page
  await productCard.locator('img').first().click();
  await expect(page.locator('[data-testid="product-title"]')).toHaveText('iPhone 12 Pro');

  // Step 5: Verify out-of-stock indicator
  await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible();

  // FIXED: Use ONLY color name format - this is the critical fix
  const colorLocator = page.locator('[data-testid="product-attribute-color-Green"]').first();
  await expect(colorLocator).toBeVisible({ timeout: 10000 });
  
  // Step 7: Find and verify capacity attribute
  const capacityLocator = page.locator('[data-testid="product-attribute-capacity-512G"]').first();
  await expect(capacityLocator).toBeVisible();

  // Step 8: Select attributes
  await colorLocator.click();
  await capacityLocator.click();

  // Step 9: Increase quantity
  await page.locator('[data-testid="increase-quantity"]').click();
  await expect(page.locator('[data-testid="quantity-value"]')).toHaveText('2');

  // Step 10: Verify add-to-cart is disabled
  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeDisabled();
});