import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('https://scandiwebstore-frontend-git-main-james-projects-8c83301a.vercel.app/all');
  
  const techLink = page.locator('a[href="/tech"]');
  await expect(techLink).toBeVisible();
  await techLink.click();
  await expect(page.locator('h1:has-text("Tech")')).toBeVisible();

  const productCard = page.locator('[data-testid="product-apple-iphone-12-pro"]');
  await expect(productCard).toBeVisible({ timeout: 15000 });
  await productCard.locator('img').first().click();
  await expect(page.locator('[data-testid="product-title"]')).toHaveText('iPhone 12 Pro');
  await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible();

  // Updated color selector
  await page.waitForSelector('[data-testid^="product-attribute-color-"]');
  const colorLocator = page.locator(
    '[data-testid="product-attribute-color-44ff03"],' +
    '[data-testid="product-attribute-color-green"]'
  ).first();
  await expect(colorLocator).toBeVisible({ timeout: 10000 });
  
  // Updated capacity selector
  await page.waitForSelector('[data-testid^="product-attribute-capacity-"]');
  const capacityLocator = page.locator('[data-testid="product-attribute-capacity-512g"]').first();
  await expect(capacityLocator).toBeVisible();

  await colorLocator.click();
  await capacityLocator.click();

  await page.locator('[data-testid="increase-quantity"]').click();
  await expect(page.locator('[data-testid="quantity-value"]')).toHaveText('2');

  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeDisabled();
});