// Round-3 fix: Agronomie's tagline didn't reflect that it's a FINANCING company
// (not an operator) — real site copy says "Financing Agro-Tech". Single line, centered
// vertically against the logo, matching the accent-bar layout already in place.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const FUNDCO = path.resolve(__dirname, '../..');
const EXPORT = path.resolve(__dirname, '..', 'export');

function textSvg(w, h, parts) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${parts}</svg>`);
}

(async () => {
  const canvasW = 600, canvasH = 84;
  const logoBuf = fs.readFileSync(path.join(FUNDCO, 'agronomie/public/images/agronomie-logo.png'));
  const logoH = 70;
  const logoW = Math.round(logoH * (1598 / 952));
  const accentX = logoW + 30;
  const textX = accentX + 16;

  const scale = async (mult) => {
    const cw = canvasW * mult, ch = canvasH * mult;
    const lw = logoW * mult, lh = logoH * mult;
    const logoResized = await sharp(logoBuf).resize({ width: Math.round(lw), height: Math.round(lh), fit: 'fill' }).png().toBuffer();
    const overlaySvg = textSvg(cw, ch, `
      <rect x="${accentX * mult}" y="${17 * mult}" width="${2 * mult}" height="${50 * mult}" fill="#26b762"/>
      <text x="${textX * mult}" y="${50 * mult}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${22 * mult}" fill="#0b2f6b">Financing</text>
      <text x="${textX * mult}" y="${(50 + 26) * mult}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${22 * mult}" fill="#1c9450">Agro-Tech</text>
    `);
    const overlayPng = await sharp(overlaySvg).png().toBuffer();
    const top = Math.round((canvasH - logoH) / 2 * mult);
    return sharp({ create: { width: Math.round(cw), height: Math.round(ch), channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([
        { input: logoResized, left: 0, top },
        { input: overlayPng, left: 0, top: 0 },
      ])
      .png({ quality: 90, palette: true, compressionLevel: 9 })
      .toBuffer();
  };

  const png1x = await scale(1);
  const png2x = await scale(2);
  fs.writeFileSync(path.join(EXPORT, 'agronomie-ng-logo-signature.png'), png1x);
  fs.writeFileSync(path.join(EXPORT, 'agronomie-ng-logo-signature@2x.png'), png2x);
  console.log('agronomie-ng-logo-signature', '1x', png1x.length, 'bytes', '2x', png2x.length, 'bytes');
})().catch((e) => { console.error(e); process.exit(1); });
