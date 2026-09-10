// Run with Playwright installed: node tests/closing-cta.cjs [base URL]
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      // Exercise form-to-calendar wiring without creating a real lead or booking.
      const leads = [];
      await page.route('**/*', route => {
        if (route.request().method() === 'POST') {
          leads.push(route.request().postData());
          return route.fulfill({ status: 200, body: '{}' });
        }
        return route.continue();
      });
      await page.goto(process.argv[2] || 'http://127.0.0.1:8766/', { waitUntil: 'networkidle' });
      const actions = page.locator('#book .cta-actions');
      assert.equal(await actions.count(), 1, 'Closing CTA must group adjacent actions');
      const book = actions.getByRole('link', { name: 'Book a call' });
      const agent = actions.getByRole('link', { name: 'See your agent' });
      await actions.scrollIntoViewIfNeeded();
      assert.equal(await book.getAttribute('data-source'), 'final');
      assert.equal(await agent.getAttribute('href'), 'prototype/');
      assert.equal(await agent.getAttribute('data-open-book'), null);
      const b = await book.boundingBox();
      const a = await agent.boundingBox();
      assert.ok(a && b && a.width > 0 && b.width > 0);
      assert.ok(a.x >= 0 && a.x + a.width <= width && b.x >= 0 && b.x + b.width <= width, 'Buttons fit viewport');
      if (width >= 768) assert.ok(Math.abs(a.y - b.y) < 2 && a.x > b.x + b.width, 'Desktop actions are side by side');
      else assert.ok(a.y >= b.y + b.height, 'Mobile actions stack without overlap');
      await book.click();
      assert.ok(await page.locator('#bookingModal').evaluate(el => el.classList.contains('open')));
      await page.locator('#bName').fill('CTA verification');
      await page.locator('#bEmail').fill('cta-test@example.com');
      await page.locator('#bookingForm').evaluate(form => form.requestSubmit());
      await page.waitForFunction(() => document.querySelector('#calendlyFrame').src.includes('calendly.com/noah-automationbuilders/30min?'));
      assert.ok(await page.locator('#bookingCalendly').isVisible());
      const calendar = new URL(await page.locator('#calendlyFrame').getAttribute('src'));
      assert.equal(calendar.searchParams.get('email'), 'cta-test@example.com');
      assert.ok(leads.some(body => body.includes('final')), 'Booking preserves final source attribution');
      await page.keyboard.press('Escape');
      await agent.click();
      await page.waitForURL('**/prototype/');
      assert.ok(await page.locator('body').innerText());
      assert.deepEqual(errors, [], 'No uncaught JavaScript errors');
      console.log(`PASS ${width}px: layout, booking modal/calendar wiring (POST intercepted), prototype navigation, no JS exceptions`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
