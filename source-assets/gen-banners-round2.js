// Round-2 tagline/spacing fixes for Agronomie, GroSolar, Regenloop, Meshworks.
// Run with: node gen-banners-round2.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const FUNDCO = path.resolve(__dirname, '../../Fundco');
const EXPORT = path.resolve(__dirname, '..', 'export');

function textSvg(w, h, parts) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${parts}</svg>`);
}

async function buildBanner({ canvasW, canvasH, logoBuffer, logoW, logoH, logoTop, logoLeft, extraSvgParts, outBase }) {
  const scale = async (mult) => {
    const cw = canvasW * mult, ch = canvasH * mult;
    const lw = logoW * mult, lh = logoH * mult;
    const top = (logoTop !== undefined ? logoTop : (canvasH - logoH) / 2) * mult;
    const left = (logoLeft !== undefined ? logoLeft : 0) * mult;
    const logoResized = await sharp(logoBuffer).resize({ width: Math.round(lw), height: Math.round(lh), fit: 'fill' }).png().toBuffer();
    const overlayPng = await sharp(textSvg(cw, ch, extraSvgParts(mult))).png().toBuffer();
    const canvas = sharp({ create: { width: Math.round(cw), height: Math.round(ch), channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
    return canvas
      .composite([
        { input: logoResized, left: Math.round(left), top: Math.round(top) },
        { input: overlayPng, left: 0, top: 0 },
      ])
      .png({ quality: 90, palette: true, compressionLevel: 9 })
      .toBuffer();
  };
  const png1x = await scale(1);
  const png2x = await scale(2);
  fs.writeFileSync(path.join(EXPORT, `${outBase}.png`), png1x);
  fs.writeFileSync(path.join(EXPORT, `${outBase}@2x.png`), png2x);
  console.log(outBase, '1x', png1x.length, 'bytes', '2x', png2x.length, 'bytes');
}

(async () => {
  // ---------- AGRONOMIE: shorten tagline to "Powering Cold Chain" ----------
  {
    const canvasW = 600, canvasH = 84;
    const logoBuf = fs.readFileSync(path.join(FUNDCO, 'agronomie/public/images/agronomie-logo.png'));
    const logoH = 70;
    const logoW = Math.round(logoH * (1598 / 952));
    const accentX = logoW + 30;
    const textX = accentX + 16;
    await buildBanner({
      canvasW, canvasH, logoBuffer: logoBuf, logoW, logoH,
      outBase: 'agronomie-ng-logo-signature',
      extraSvgParts: (m) => `
        <rect x="${accentX * m}" y="${17 * m}" width="${2 * m}" height="${50 * m}" fill="#26b762"/>
        <text x="${textX * m}" y="${38 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${20 * m}" fill="#0b2f6b">Powering</text>
        <text x="${textX * m}" y="${62 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${20 * m}" fill="#1c9450">Cold Chain</text>
      `,
    });
  }

  // ---------- GROSOLAR: swap tagline to "Financing the Solar Future" ----------
  {
    const canvasW = 600, canvasH = 80;
    const svgSrc = path.join(FUNDCO, '_shared-logos/grosolar-logo.svg');
    const rasterBuf = await sharp(svgSrc, { density: 600 }).png().toBuffer();
    const meta = await sharp(rasterBuf).metadata();
    const logoH = 56;
    const logoW = Math.round(logoH * (meta.width / meta.height));
    const dividerX = logoW + 20;
    const textX = dividerX + 20;
    await buildBanner({
      canvasW, canvasH, logoBuffer: rasterBuf, logoW, logoH,
      outBase: 'grosolar-ng-logo-signature',
      extraSvgParts: (m) => `
        <rect x="${dividerX * m}" y="${12 * m}" width="${1 * m}" height="${56 * m}" fill="#d9d9d9"/>
        <text x="${textX * m}" y="${45 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="${20 * m}" fill="#002554">Financing the Solar Future</text>
      `,
    });
  }

  // ---------- REGENLOOP: replace tagline with something more specific to biogas/circular economy ----------
  {
    const canvasW = 480, canvasH = 100;
    const logoBuf = fs.readFileSync(path.join(FUNDCO, 'regenloop/public/images/regenloop-logo-full.png'));
    const logoH = 56;
    const logoW = Math.round(logoH * (1198 / 238));
    const logoLeft = Math.round((canvasW - logoW) / 2);
    await buildBanner({
      canvasW, canvasH, logoBuffer: logoBuf, logoW, logoH, logoTop: 8, logoLeft,
      outBase: 'regenloop-ng-logo-signature',
      extraSvgParts: (m) => `
        <text x="${(canvasW / 2) * m}" y="${86 * m}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${17 * m}" fill="#e8a33d">Turning Waste Into Clean Energy</text>
      `,
    });
  }

  // ---------- MESHWORKS: add breathing room between logo block and tagline ----------
  {
    const canvasW = 300, canvasH = 98; // was 88 -> +10px so the tagline has real air below the wordmark
    const logoBuf = fs.readFileSync(path.join(FUNDCO, 'meshworks/public/meshworks-logo.jpg'));
    // matte the light-gray ~#f7f7f7 background to white (matches round-1 treatment) then to transparent-safe white
    const { data, info } = await sharp(logoBuf).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    const out = Buffer.from(data);
    const n = info.width * info.height;
    for (let p = 0; p < n; p++) {
      const i = p * info.channels;
      const r = out[i], g = out[i + 1], b = out[i + 2];
      if (r > 235 && g > 235 && b > 235) { out[i] = 255; out[i + 1] = 255; out[i + 2] = 255; }
    }
    const mattedBuf = await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer();
    const logoH = 58; // slightly smaller than round-1's ~62 to make room for the extra gap without growing the canvas too much
    const logoW = Math.round(logoH * (847 / 295));
    const logoLeft = Math.round((canvasW - logoW) / 2);
    await buildBanner({
      canvasW, canvasH, logoBuffer: mattedBuf, logoW, logoH, logoTop: 4, logoLeft,
      outBase: 'meshworks-ng-logo-signature',
      extraSvgParts: (m) => `
        <text x="${(canvasW / 2) * m}" y="${90 * m}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${15 * m}" fill="#1a5c3a">Power the Future with Meshworks</text>
      `,
    });
  }
})().catch((e) => { console.error(e); process.exit(1); });
