import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('currency and category switching work from header', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('response', res => console.log(`[Response] ${res.status()} ${res.url()}`));
  page.on('request', req => console.log(`[Request] ${req.method()} ${req.url()}`));

  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Navigated to home page');

  // Ensure one of the three page states is visible (products or messages)
  try {
    await Promise.race([
      page.waitForSelector('[data-testid="product-card"]', { state: 'attached', timeout: 15000 }),
      page.waitForSelector('[data-testid="no-products-message"]', { state: 'visible', timeout: 15000 }),
      page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 15000 }),
    ]);
  } catch (error) {
    const html = await page.content();
    console.error('Timeout while waiting for product cards or messages');
    console.log('Page HTML:', html);
    throw error;
  }

  if (await page.getByTestId('error-message').isVisible()) {
    const errorText = await page.getByTestId('error-message').textContent();
    throw new Error(`Product loading error: ${errorText}`);
  }

  if (await page.getByTestId('no-products-message').isVisible()) {
    throw new Error('No products available in the store');
  }

  const productCount = await page.getByTestId('product-card').count();
  console.log(`Found ${productCount} product cards`);

  await expect(page.getByTestId('category-title')).toBeVisible();

  // 💱 Test currency switching
  await expect(page.getByTestId('currency-switcher')).toBeVisible();
  await page.getByTestId('currency-switcher').click();

  await expect(page.getByTestId('currency-option-USD')).toBeVisible();
  await page.getByTestId('currency-option-USD').click();

  await expect(page.getByTestId('active-currency')).toHaveText('$');
  console.log('Currency switched to USD ($)');

  // 🧭 Test category switching
  await expect(page.getByTestId('category-nav')).toBeVisible();
  await page.getByTestId('category-nav').getByText('Tech').click();

  await expect(page.getByTestId('category-title')).toHaveText('Tech');
  console.log('Switched to Tech category');
});
