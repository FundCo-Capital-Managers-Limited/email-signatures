const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'templates');
const BASE = 'https://raw.githubusercontent.com/FundCo-Capital-Managers-Limited/email-signatures/main/export';

const SLUGS = [
  'fundco-ng',
  'onecapinvestment-ng',
  'grosolar-ng',
  'agronomie-ng',
  'electrifymicrogrid-ng',
  'e-mobilite-ng',
  'regenloop-ng',
  'cleanenergyfund-ng',
  'meshworks-ng',
  'greenkiosk-ng',
];

function slugToToken(slug) {
  return slug.toUpperCase().replace(/-/g, '_');
}

const report = [];

for (const slug of SLUGS) {
  const token = slugToToken(slug);
  const placeholder = `[LOGO_URL_${token}]`;
  const fileName = `${slug}-logo-signature@2x.png`;
  const url = `${BASE}/${fileName}`;
  const htmlPath = path.join(TEMPLATES, `${slug}-footer.html`);
  let html = fs.readFileSync(htmlPath, 'utf8');
  const occurrences = html.split(placeholder).length - 1;
  html = html.split(placeholder).join(url);
  fs.writeFileSync(htmlPath, html, 'utf8');
  report.push({ slug, placeholder, url, occurrences });
}

console.log(JSON.stringify(report, null, 2));
