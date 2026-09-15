const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'templates');
const EXPORT = path.join(ROOT, 'export');
const PREVIEWS = path.join(ROOT, 'previews');

const SAMPLE = {
  '%%DisplayName%%': 'Jane Doe',
  '%%Title%%': 'Marketing Manager',
  '%%Department%%': 'Communications',
  '%%StreetAddress%%': 'Plot 1610, Adeola Hopewell Street, VI, Lagos',
  '%%TelephoneNumber%%': '+234 1 555 0100',
};

const COMPANIES = [
  { slug: 'agronomie-ng', token: 'AGRONOMIE_NG' },
  { slug: 'grosolar-ng', token: 'GROSOLAR_NG' },
  { slug: 'regenloop-ng', token: 'REGENLOOP_NG' },
  { slug: 'meshworks-ng', token: 'MESHWORKS_NG' },
];

function toFileUrl(p) {
  return 'file://' + p.split('\\').join('/');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });
  for (const { slug, token } of COMPANIES) {
    let html = fs.readFileSync(path.join(TEMPLATES, `${slug}-footer.html`), 'utf8');
    for (const [tok, val] of Object.entries(SAMPLE)) html = html.split(tok).join(val);
    const logoUrl = toFileUrl(path.join(EXPORT, `${slug}-logo-signature@2x.png`));
    html = html.split(`[LOGO_URL_${token}]`).join(logoUrl);
    const wrapped = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#ffffff;">${html}</body></html>`;
    const localTmp = path.join(ROOT, `._tmp_preview_${slug}.html`);
    fs.writeFileSync(localTmp, wrapped, 'utf8');
    await page.goto(toFileUrl(localTmp));
    await page.waitForTimeout(150);
    const el = await page.evaluateHandle(() => document.body.firstElementChild);
    const box = await el.asElement().boundingBox();
    await page.screenshot({
      path: path.join(PREVIEWS, `${slug}-footer-preview.png`),
      clip: { x: 0, y: 0, width: 600, height: Math.ceil(box.y + box.height) + 4 },
    });
    console.log(slug, 'saved');
    fs.unlinkSync(localTmp);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
