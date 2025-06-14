import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('PDP: user can view product details and interact with attributes', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('response', res => console.log(`[Response] ${res.status()} ${res.url()}`));
  page.on('request', req => console.log(`[Request] ${req.method()} ${req.url()}`));

  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Navigated to home page');

  try {
    await Promise.race([
      page.waitForSelector('[data-testid="product-card"]', { state: 'attached', timeout: 15000 }),
      page.waitForSelector('[data-testid="no-products-message"]', { state: 'visible', timeout: 15000 }),
      page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 15000 }),
    ]);
  } catch (error) {
    console.error('Failed to find products or status messages');
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
  console.log(`Found ${count} product cards`);

  if (count === 0) throw new Error('No products found');

  // ✅ Click the specific product
  await page.locator('[data-testid="product-apple-iphone-12-pro"]')
    .getByTestId('product-card-image')
    .click();

  await expect(page.getByTestId('pdp-title')).toBeVisible({ timeout: 10000 });
  console.log('Navigated to PDP');

  // ✅ Ensure gallery is present
  await expect(page.getByTestId('image-gallery')).toBeVisible();

  // ✅ Select swatch or text attributes
  const attributeSections = page.locator('[data-testid^="attribute-"]');
  const attrCount = await attributeSections.count();

  for (let i = 0; i < attrCount; i++) {
    const attributeItems = attributeSections.nth(i).locator('[data-testid="attribute-item"]');
    const itemCount = await attributeItems.count();
    if (itemCount > 0) {
      await attributeItems.first().click();
      console.log(`Selected attribute ${i + 1}`);
    }
  }

  // ✅ Adjust quantity
  const plusBtn = page.getByTestId('increase-quantity');
  const minusBtn = page.getByTestId('decrease-quantity');
  const quantityText = page.getByTestId('quantity-value');

  await plusBtn.click();
  await expect(quantityText).toHaveText('2');
  await minusBtn.click();
  await expect(quantityText).toHaveText('1');
  console.log('Quantity adjustment works');

  // ✅ Add to cart if available
  const addToCartBtn = page.getByTestId('add-to-cart');
  await expect(addToCartBtn).toBeVisible({ timeout: 10000 });

  if (await addToCartBtn.isDisabled()) {
    await expect(addToCartBtn).toHaveText('OUT OF STOCK');
    console.log('Product is out of stock — cannot add to cart');
    return; // Skip rest of test
  }

  await expect(addToCartBtn).toHaveText('ADD TO CART');
  await addToCartBtn.click();
  console.log('Clicked Add to Cart');

  // ✅ Open cart and verify product is added
  await page.getByTestId('cart-btn').click();
  await expect(page.getByTestId('cart-overlay')).toBeVisible();
  const itemsInCart = await page.locator('[data-testid="cart-overlay"] .cartItem').count();
  expect(itemsInCart).toBeGreaterThan(0);
  console.log(`Product added to cart: ${itemsInCart} item(s) found`);
});
