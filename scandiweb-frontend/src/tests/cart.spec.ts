import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' }); // Run tests sequentially

test('user can add item to cart and place an order', async ({ page }) => {
  // Enable detailed logging
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('response', response => 
    console.log(`[Response] ${response.status()} ${response.url()}`)
  );
  page.on('request', request => 
    console.log(`[Request] ${request.method()} ${request.url()}`)
  );

  // 1. Navigate to the page with longer timeout
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Navigation complete');

  // 2. Verify critical elements exist
  await expect(page.getByTestId('category-title')).toBeVisible();
  console.log('Category title visible');

  // 3. Wait for either products or error state
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

  // 4. Check for error state first
  if (await page.getByTestId('error-message').isVisible()) {
    const errorText = await page.getByTestId('error-message').textContent();
    console.error('Error loading products:', errorText);
    throw new Error(`Product loading error: ${errorText}`);
  }

  // 5. Check for empty state
  if (await page.getByTestId('no-products-message').isVisible()) {
    console.log('No products available message shown');
    throw new Error('No products available in the store');
  }

  // 6. Verify products exist
  const productCards = page.getByTestId('product-card');
  const count = await productCards.count();
  console.log(`Found ${count} product cards`);

  if (count === 0) {
    // Diagnostic dump
    const productsGrid = await page.getByTestId('products-grid').innerHTML();
    console.log('Products grid content:', productsGrid);
    const loadingState = await page.getByTestId('loading-indicator').isVisible();
    console.log('Loading indicator visible:', loadingState);
    throw new Error('No product cards found in the products grid');
  }

  // 7. Product interaction logic
  let productFound = false;
  const maxAttempts = Math.min(count, 3); // Try up to 3 products

  for (let i = 0; i < maxAttempts && !productFound; i++) {
    console.log(`Attempting with product ${i + 1}/${maxAttempts}`);
    
    try {
      // Click product image specifically
      await productCards.nth(i).getByTestId('product-card-image').click();
      console.log('Clicked product image');
      
      // Wait for PDP to load with detailed checks
      await expect(page.getByTestId('pdp-title')).toBeVisible({ timeout: 10000 });
      console.log('PDP title visible');
      
      // Verify add to cart button
      const addToCartBtn = page.getByTestId('add-to-cart-btn');
      await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
      console.log('Add to cart button visible');

      // Handle attributes if present
      const attributeSections = page.locator('[data-testid^="attribute-"]');
      const attrCount = await attributeSections.count();
      console.log(`Found ${attrCount} attribute sections`);

      for (let j = 0; j < attrCount; j++) {
        await attributeSections.nth(j).locator('[data-testid="attribute-item"]').first().click();
        console.log(`Selected attribute ${j + 1}`);
      }

      if (!(await addToCartBtn.isDisabled())) {
        await addToCartBtn.click();
        console.log('Added product to cart');
        productFound = true;
        break;
      } else {
        console.log('Add to cart button disabled');
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

  // 8. Cart and checkout flow
  await page.getByTestId('cart-btn').click();
  await expect(page.getByTestId('cart-overlay')).toBeVisible();
  console.log('Cart overlay visible');
  
  await page.getByTestId('place-order-btn').click();
  await expect(page.getByTestId('order-success')).toBeVisible({ timeout: 5000 });
  console.log('Order success message shown');
});