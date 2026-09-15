const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'templates');

const SAMPLE = {
  '%%DisplayName%%': 'Jane Doe',
  '%%Title%%': 'Marketing Manager',
  '%%Department%%': 'Communications',
  '%%StreetAddress%%': 'Plot 1610, Adeola Hopewell Street, VI, Lagos',
  '%%TelephoneNumber%%': '+234 1 555 0100',
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });

  let html = fs.readFileSync(path.join(TEMPLATES, 'fundco-ng-footer.html'), 'utf8');
  for (const [tok, val] of Object.entries(SAMPLE)) html = html.split(tok).join(val);
  const wrapped = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#ffffff;">${html}</body></html>`;
  await page.setContent(wrapped, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const imgStatus = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({ src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete }));
  });
  console.log('IMG STATUS:', JSON.stringify(imgStatus, null, 2));

  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({ path: path.join(ROOT, 'source-assets', '_live_url_check.png'), clip: { x: 0, y: 0, width: 600, height: Math.ceil(height) } });

  await browser.close();
})();
