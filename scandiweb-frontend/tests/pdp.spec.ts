import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('/');

  // Use more robust selector to find iPhone 12 Pro card
  const productCard = page.locator('[data-testid^="product-"]', { 
    has: page.locator('text="iPhone 12 Pro"') 
  });
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.locator('[data-testid="product-title"]')).toHaveText('iPhone 12 Pro');

  // Verify out-of-stock indicator is visible
  await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible();
  
  // USE ONLY COLOR NAME FORMAT (no hex codes)
  await page.getByTestId('product-attribute-color-Green').click();
  await page.getByTestId('product-attribute-capacity-512G').click();

  // Verify add to cart is disabled for out-of-stock product
  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeDisabled();
});

test('can add in-stock product to cart', async ({ page }) => {
  await page.goto('/');
  
  // Use PlayStation 5 which is in stock
  const productCard = page.locator('[data-testid^="product-"]', { 
    has: page.locator('text="PlayStation 5"') 
  });
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.locator('[data-testid="product-title"]')).toHaveText('PlayStation 5');

  // USE ONLY COLOR NAME FORMAT (no hex codes)
  await page.getByTestId('product-attribute-color-Green').click();
  await page.getByTestId('product-attribute-capacity-512G').click();

  // Increase quantity
  await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  // Add to cart
  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeEnabled();
  await addToCart.click();

  // Verify cart overlay
  await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();
});