import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('user can add item to cart and place an order', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('response', response => console.log(`[Response] ${response.status()} ${response.url()}`));
  page.on('request', request => console.log(`[Request] ${request.method()} ${request.url()}`));

  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Navigation complete');

  await expect(page.getByTestId('category-title')).toBeVisible();
  console.log('Category title visible');

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
    console.error('Error loading products:', errorText);
    throw new Error(`Product loading error: ${errorText}`);
  }

  if (await page.getByTestId('no-products-message').isVisible()) {
    console.log('No products available message shown');
    throw new Error('No products available in the store');
  }

  const productCards = page.getByTestId('product-card');
  const count = await productCards.count();
  console.log(`Found ${count} product cards`);

  if (count === 0) {
    const productsGrid = await page.getByTestId('products-grid').innerHTML();
    console.log('Products grid content:', productsGrid);
    const loadingState = await page.getByTestId('loading-indicator').isVisible();
    console.log('Loading indicator visible:', loadingState);
    throw new Error('No product cards found in the products grid');
  }

  let productFound = false;
  const maxAttempts = Math.min(count, 3);

  for (let i = 0; i < maxAttempts && !productFound; i++) {
    console.log(`Attempting with product ${i + 1}/${maxAttempts}`);

    try {
      await productCards.nth(i).getByTestId('product-card-image').click();
      console.log('Clicked product image');

      await expect(page.getByTestId('pdp-title')).toBeVisible({ timeout: 10000 });
      console.log('PDP title visible');

      const addToCartBtn = page.getByTestId('add-to-cart-btn');
      await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
      console.log('Add to cart button visible');

      // Updated attribute selection logic
      const colorLocator = page.locator(
        '[data-testid="product-attribute-color-44ff03"],' +
        '[data-testid="product-attribute-color-green"]'
      ).first();
      await expect(colorLocator).toBeVisible({ timeout: 10000 });

      const capacityLocator = page.locator('[data-testid="product-attribute-capacity-512g"]');
      await expect(capacityLocator).toBeVisible();

      await colorLocator.click();
      await capacityLocator.click();

      if (!(await addToCartBtn.isDisabled())) {
        await addToCartBtn.click();
        await addToCartBtn.click();
        console.log('Added product to cart twice');
        productFound = true;
        break;
      } else {
        console.log('Add to cart button disabled');
        const disabledReason = await addToCartBtn.getAttribute('aria-disabled');
        console.log('Add to cart button disabled reason:', disabledReason);
      }
    } catch (error) {
      console.error(`Error with product ${i + 1}:`, error instanceof Error ? error.message : error);
    } finally {
      if (!productFound) {
        await page.goBack();
        await page.waitForSelector('[data-testid="products-grid"]');
        console.log('Returned to product listing');
      }
    }
  }

  if (!productFound) {
    throw new Error('Failed to find an addable product after multiple attempts');
  }

  const cartOverlay = page.getByTestId('cart-overlay');
  const overlayBackdrop = page.getByTestId('cart-overlay-backdrop');

  if (await cartOverlay.isVisible()) {
    console.log('Cart overlay already open, closing first...');
    await overlayBackdrop.click();
    await expect(cartOverlay).toBeHidden({ timeout: 5000 });
    console.log('Cart overlay closed');
  }

  await page.getByTestId('cart-btn').click();
  await expect(cartOverlay).toBeVisible({ timeout: 5000 });
  console.log('Cart overlay opened');

  const quantityText = await page.getByTestId('cart-item-quantity').textContent();
  expect(quantityText?.trim()).toBe('2');
  console.log('Verified cart item quantity is 2');

  await page.getByTestId('place-order-btn').click();

  const orderSuccess = page.getByTestId('order-success');
  await expect(orderSuccess).toHaveText(/order placed successfully/i, { timeout: 8000 });
  await expect(orderSuccess).toBeVisible();
  console.log('Order success message shown');
});