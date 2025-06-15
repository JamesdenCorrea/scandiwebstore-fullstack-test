import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('user can add item to cart and place an order', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('response', response => console.log(`[Response] ${response.status()} ${response.url()}`));
  page.on('request', request => console.log(`[Request] ${request.url()}`));

  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  await expect(page.getByTestId('category-title')).toBeVisible();

  try {
    await Promise.race([
      page.waitForSelector('[data-testid="product-card"]', { state: 'attached', timeout: 15000 }),
      page.waitForSelector('[data-testid="no-products-message"]', { state: 'visible', timeout: 15000 }),
      page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 15000 })
    ]);
  } catch (error) {
    console.error('Failed to find products or status messages');
    const pageContent = await page.content();
    console.log('Current page content:', pageContent);
    throw error;
  }

  if (await page.getByTestId('error-message').isVisible()) {
    const errorText = await page.getByTestId('error-message').textContent();
    throw new Error(`Product loading error: ${errorText}`);
  }

  if (await page.getByTestId('no-products-message').isVisible()) {
    throw new Error('No products available in the store');
  }

  const productCards = page.getByTestId('product-card');
  const count = await productCards.count();

  if (count === 0) {
    const productsGrid = await page.getByTestId('products-grid').innerHTML();
    const loadingState = await page.getByTestId('loading-indicator').isVisible();
    throw new Error('No product cards found in the products grid');
  }

  let productFound = false;
  const maxAttempts = Math.min(count, 3);

  for (let i = 0; i < maxAttempts && !productFound; i++) {
    try {
      await productCards.nth(i).getByTestId('product-card-image').click();
      await expect(page.getByTestId('pdp-title')).toBeVisible({ timeout: 10000 });

      const addToCartBtn = page.getByTestId('add-to-cart-btn');
      await expect(addToCartBtn).toBeVisible({ timeout: 5000 });

      // ✅ Updated to exact match from backend
      const colorLocator = page
        .locator('[data-testid="product-attribute-color-#44FF03"]')
        .first();
      await expect(colorLocator).toBeVisible({ timeout: 10000 });

      const capacityLocator = page
        .locator('[data-testid="product-attribute-capacity-512G"]')
        .first();
      await expect(capacityLocator).toBeVisible();

      await colorLocator.click();
      await capacityLocator.click();

      if (!(await addToCartBtn.isDisabled())) {
        await addToCartBtn.click();
        await addToCartBtn.click();
        productFound = true;
        break;
      }
    } catch (error) {
      console.error(`Error with product ${i + 1}:`, error);
    } finally {
      if (!productFound) {
        await page.goBack();
        await page.waitForSelector('[data-testid="products-grid"]');
      }
    }
  }

  if (!productFound) {
    throw new Error('Failed to find an addable product after multiple attempts');
  }

  const cartOverlay = page.getByTestId('cart-overlay');
  const overlayBackdrop = page.getByTestId('cart-overlay-backdrop');

  if (await cartOverlay.isVisible()) {
    await overlayBackdrop.click();
    await expect(cartOverlay).toBeHidden({ timeout: 5000 });
  }

  await page.getByTestId('cart-btn').click();
  await expect(cartOverlay).toBeVisible({ timeout: 5000 });

  const quantityText = await page.getByTestId('cart-item-quantity').textContent();
  expect(quantityText?.trim()).toBe('2');

  await page.getByTestId('place-order-btn').click();

  const orderSuccess = page.getByTestId('order-success');
  await expect(orderSuccess).toHaveText(/order placed successfully/i, { timeout: 8000 });
  await expect(orderSuccess).toBeVisible();
});
