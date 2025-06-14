import { test, expect } from '@playwright/test';

test('should display product details page and allow adding to cart', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Click on the first product card
  await page.locator('[data-testid="product-card"]').first().click();

  // Wait for the PDP title to be visible
  await expect(page.getByTestId('pdp-title')).toBeVisible();

  // Wait for attributes to render (optional based on your product)
  await expect(page.getByTestId('price-section')).toBeVisible();

  // Check if the Add to Cart button is visible
  const addToCartBtn = page.getByTestId('add-to-cart');
  await expect(addToCartBtn).toBeVisible();

  // OPTIONAL: Check whether it is disabled
  const isDisabled = await addToCartBtn.isDisabled();

  if (isDisabled) {
    console.log('Product is out of stock – skipping Add to Cart flow.');
    // Optionally assert it's correctly disabled
    await expect(addToCartBtn).toBeDisabled();
  } else {
    // Select attribute options if necessary (color, capacity, etc.)
    const capacityOption = page.locator('[data-testid^="product-attribute-capacity-"]').first();
    if (await capacityOption.isVisible()) {
      await capacityOption.click();
    }

    const colorOption = page.locator('[data-testid^="product-attribute-color-"]').first();
    if (await colorOption.isVisible()) {
      await colorOption.click();
    }

    // Adjust quantity
    await page.getByTestId('increase-quantity').click();
    await expect(page.getByTestId('quantity-value')).toHaveText('2');

    // Click Add to Cart
    await addToCartBtn.click();

    // Assert that the CartOverlay opened
    await expect(page.getByTestId('cart-overlay')).toBeVisible();
  }
});
