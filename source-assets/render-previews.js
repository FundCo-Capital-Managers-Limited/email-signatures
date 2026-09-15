// Render footer HTML templates to PNG previews with sample token data.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const os = require('os');

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
  { slug: 'electrifymicrogrid-ng', token: 'ELECTRIFYMICROGRID_NG' },
  { slug: 'e-mobilite-ng', token: 'E_MOBILITE_NG' },
];

function toFileUrl(p) {
  return 'file://' + p.replace(/\\/g, '/');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });

  for (const { slug, token } of COMPANIES) {
    const htmlPath = path.join(TEMPLATES, `${slug}-footer.html`);
    let html = fs.readFileSync(htmlPath, 'utf8');

    for (const [tok, val] of Object.entries(SAMPLE)) {
      html = html.split(tok).join(val);
    }
    const logoUrl = toFileUrl(path.join(EXPORT, `${slug}-logo-signature@2x.png`));
    html = html.split(`[LOGO_URL_${token}]`).join(logoUrl);

    const wrapped = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#ffffff;">${html}</body></html>`;
    const tmpHtml = path.join(os.tmpdir(), `preview-${slug}.html`);
    // write via project dir instead of os.tmpdir to dodge sandbox write issues seen earlier
    const localTmp = path.join(ROOT, `._tmp_preview_${slug}.html`);
    fs.writeFileSync(localTmp, wrapped, 'utf8');

    await page.goto(toFileUrl(localTmp));
    await page.waitForTimeout(150);

    // Find the outermost rendered element (first table or div at body root) to screenshot just the footer.
    const el = await page.evaluateHandle(() => document.body.firstElementChild);
    const box = await el.asElement().boundingBox();
    const outPath = path.join(PREVIEWS, `${slug}-footer-preview.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: 600, height: Math.ceil(box.y + box.height) + 4 },
    });
    console.log(slug, 'saved', outPath, box);
    fs.unlinkSync(localTmp);
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
