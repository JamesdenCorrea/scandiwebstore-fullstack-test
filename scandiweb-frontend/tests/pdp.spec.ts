import { test, expect } from '@playwright/test';

test('can add to cart', async ({ page }) => {
  console.log("✅ Running the updated PDP test");

  await page.goto('/');
  await page.locator('a[href="/tech"]').click();
  await expect(page.locator('[data-testid^="product-"]')).toBeVisible();

  const productCard = page.locator('[data-testid="product-apple-imac-2021"]');
  await expect(productCard).toBeVisible();
  await productCard.getByTestId('product-card-image').click();

  await expect(page.getByTestId('product-title')).toHaveText('iMac 2021');

  const capacityOption = page.locator('[data-testid^="product-attribute-capacity-"]').first();
  const touchIdOption = page.locator('[data-testid^="product-attribute-touch-id-in-keyboard-"]').first();
  const usbPortsOption = page.locator('[data-testid^="product-attribute-with-usb-3-ports-"]').first();

  await expect(capacityOption).toBeVisible({ timeout: 10000 });
  await capacityOption.click();

  await expect(touchIdOption).toBeVisible({ timeout: 10000 });
  await touchIdOption.click();

  await expect(usbPortsOption).toBeVisible({ timeout: 10000 });
  await usbPortsOption.click();

  await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity-value')).toHaveText('2');

  const addToCart = page.getByTestId('add-to-cart');
  await expect(addToCart).toBeEnabled();
});
