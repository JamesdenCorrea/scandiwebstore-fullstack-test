import { test, expect } from '@playwright/test';

test('user can add item to cart and place an order', async ({ page }) => {
  // Debugging setup
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  await page.goto('/');
  
  // Verify GraphQL response
  const [response] = await Promise.all([
    page.waitForResponse(resp => 
      resp.url().includes('/graphql') && 
      resp.status() === 200
    ),
    page.waitForSelector('[data-testid="products-grid"]', { state: 'attached' })
  ]);
  
  const responseData = await response.json();
  console.log('Products received:', responseData.data?.products?.length);
  
  // Check for error states
  if (await page.getByTestId('error-message').isVisible()) {
    const error = await page.getByTestId('error-message').textContent();
    console.error('Error loading products:', error);
  }
  
  // More flexible product check
  const productCards = page.getByTestId('product-card');
  const count = await productCards.count();
  
  if (count === 0) {
    console.log('No products found, checking for empty state');
    const noProducts = await page.getByTestId('no-products-message').isVisible();
    expect(noProducts).toBe(false); // Fail if we explicitly have no products message
  }
  
  expect(count).toBeGreaterThan(0);

  let productFound = false;

  for (let i = 0; i < count; i++) {
    // Click product image specifically
    await productCards.nth(i).getByTestId('product-card-image').click();
    
    // Wait for PDP to load
    await page.waitForSelector('[data-testid="pdp-title"]', { state: 'visible' });

    try {
      await expect(page.getByTestId('add-to-cart-btn')).toBeVisible({ timeout: 5000 });

      // Handle attributes if present
      const attributeSections = await page.locator('[data-testid^="attribute-"]').count();
      for (let j = 0; j < attributeSections; j++) {
        await page.locator(`[data-testid="attribute-item"]`).first().click();
      }

      const addToCartBtn = page.getByTestId('add-to-cart-btn');
      if (!(await addToCartBtn.isDisabled())) {
        await addToCartBtn.click();
        productFound = true;
        break;
      }
    } catch (error) {
      // Safely handle the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(`Product ${i} failed: ${errorMessage}`);
      await page.goBack();
      await page.waitForSelector('[data-testid="products-grid"]');
      continue;
    }

    await page.goBack();
    await page.waitForSelector('[data-testid="products-grid"]');
  }

  expect(productFound).toBe(true);

  // Cart and checkout flow
  await page.getByTestId('cart-btn').click();
  await expect(page.getByTestId('cart-overlay')).toBeVisible();
  
  await page.getByTestId('place-order-btn').click();
  await expect(page.getByTestId('order-success')).toBeVisible({ timeout: 5000 });
});