import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('has cart overlay working', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('category-title')).toBeVisible();

  const productCard = page.locator('[data-testid="product-iphone-12-pro"]');
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.getByTestId('product-title')).toHaveText('iPhone 12 Pro');

  const colorOption = page.locator('[data-testid^="product-attribute-color-"]').first();
  const capacityOption = page.locator('[data-testid^="product-attribute-capacity-"]').first();

  await expect(colorOption).toBeVisible({ timeout: 10000 });
  await colorOption.click();

  await expect(capacityOption).toBeVisible({ timeout: 10000 });
  await capacityOption.click();

  const addToCart = page.getByTestId('add-to-cart');
  await expect(addToCart).toBeEnabled();
  await addToCart.click();
  await addToCart.click();

  await page.getByTestId('cart-btn').click();
  const cartOverlay = page.getByTestId('cart-overlay');
  await expect(cartOverlay).toBeVisible();

  const quantityText = await page.getByTestId('cart-item-quantity').textContent();
  expect(quantityText?.trim()).toBe('2');

  await page.getByTestId('place-order-btn').click();

  const orderSuccess = page.getByTestId('order-success');
  await expect(orderSuccess).toBeVisible();
  await expect(orderSuccess).toHaveText(/order placed successfully/i);
});
