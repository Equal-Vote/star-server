import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'What is your poll question?' }).click();
  await page.getByRole('textbox', { name: 'What is your poll question?' }).fill('I hate this');
});

