import { test, expect } from '@playwright/test';

test('has product details', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('[data-testid^="product-"]', { hasText: 'iPhone 12 Pro' });
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.getByTestId('product-title')).toHaveText('iPhone 12 Pro');

  // ✅ Use mapped color name (not hex code)
  await page.getByTestId('product-attribute-color-Black').click();

  // ✅ Use correct capacity value
  await page.getByTestId('product-attribute-capacity-512GB').click();

  // Quantity
  await page.getByTestId('quantity-increase').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  const addToCart = page.getByTestId('add-to-cart');
  await expect(addToCart).toBeEnabled();
  await addToCart.click();

  await expect(page.getByTestId('cart-overlay')).toBeVisible();
});
