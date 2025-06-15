import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('[data-testid^="product-"]', { hasText: 'iPhone 12 Pro' });
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.locator('[data-testid="product-title"]')).toHaveText('iPhone 12 Pro');

  // Select required attributes before adding to cart
  await page.getByTestId('product-attribute-color-Black').click();
  await page.getByTestId('product-attribute-capacity-512GB').click();

  // Click + button to increase quantity
  await page.getByTestId('quantity-increase').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  // Now the button should be enabled
  const addToCart = page.locator('[data-testid="add-to-cart"]');
  await expect(addToCart).toBeEnabled();

  await addToCart.click();

  await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();
});
