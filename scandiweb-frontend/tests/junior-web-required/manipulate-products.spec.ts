import { test, expect } from '@playwright/test';

test('Remove and add different products', async ({ page }) => {
  // Inject dummy product into localStorage before the page loads
  await page.addInitScript(() => {
    localStorage.setItem('addedProducts', JSON.stringify([
      {
        id: 'test-dummy-1',
        sku: 'DUMMY123',
        name: 'Playwright Dummy Product',
        price: 1.99,
        category: 'DVD'
      }
    ]));
  });

  // Visit the Admin page AFTER dummy is injected
  await page.goto('/');

  // Wait for heading to appear
  await expect(page.getByText('Product List')).toBeVisible({ timeout: 5000 });

  // Select the first checkbox
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeVisible({ timeout: 5000 });
  await firstCheckbox.check();

  // Click the delete button
  await page.getByTestId('delete-products-button').click();

  // Open the add form
  await page.getByTestId('admin-add-button').click();

  // Fill in the form
  await page.locator('#sku').fill('Test0001');
  await page.locator('#name').fill('NameTest000');
  await page.locator('#price').fill('123.45');
  await page.locator('#productType').selectOption('DVD');
  await page.locator('#size').fill('700');

  await page.getByText('Save').click();

  // Wait for return to Product List
  await expect(page.getByText('Product List')).toBeVisible({ timeout: 10000 });

  // Check if the new product is visible
  await expect(page.getByText('NameTest000')).toBeVisible({ timeout: 10000 });
});
