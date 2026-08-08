import { test, expect } from '@playwright/test';

test('hero layout mobile snapshot', async ({ page }) => {
  await page.goto('http://localhost:4173/');
  await page.setViewportSize({ width: 390, height: 844 }); // typical mobile
  // wait for hero to be visible
  const hero = page.locator('.oh4-hero');
  await expect(hero).toBeVisible({ timeout: 5000 });
  // take a screenshot of the hero region
  await hero.screenshot({ path: 'test-results/hero-mobile.png' });
  // sanity check: headline line1 should be visible and not overlapped
  await expect(page.locator('.oh4-hl-line1')).toBeVisible();
});
