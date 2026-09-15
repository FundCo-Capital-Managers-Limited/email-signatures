// One-off generator for Agronomie / EML / E-Mobilite email signature banners.
// Run with: node gen-banners.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const FUNDCO = path.resolve(__dirname, '../Fundco');
const EXPORT = path.resolve(__dirname, 'export');
const SRCASSETS = path.resolve(__dirname, 'source-assets');

function textSvg(w, h, parts) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${parts}</svg>`
  );
}

// Turn a near-white opaque background transparent (for logos exported on white cards).
async function whiteToTransparent(inputPath, { threshold = 245, feather = 20 } = {}) {
  const img = sharp(inputPath);
  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  const n = info.width * info.height;
  for (let p = 0; p < n; p++) {
    const i = p * info.channels;
    const r = out[i], g = out[i + 1], b = out[i + 2];
    const minC = Math.min(r, g, b);
    if (minC >= threshold) {
      out[i + 3] = 0;
    } else if (minC >= threshold - feather) {
      // feather the edge
      const t = (threshold - minC) / feather; // 0 (white) .. 1 (real color)
      out[i + 3] = Math.round(255 * t);
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } }).png();
}

async function buildBanner({ slug, canvasW, canvasH, logoBuffer, logoW, logoH, extraSvgParts, outBase }) {
  const scale = async (mult) => {
    const cw = canvasW * mult, ch = canvasH * mult;
    const lw = logoW * mult, lh = logoH * mult;
    const logoResized = await sharp(logoBuffer).resize({ width: lw, height: lh, fit: 'fill' }).png().toBuffer();
    const overlaySvg = textSvg(cw, ch, extraSvgParts(mult));
    const overlayPng = await sharp(overlaySvg).png().toBuffer();
    const canvas = sharp({
      create: { width: cw, height: ch, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    });
    const composed = await canvas
      .composite([
        { input: logoResized, left: 0, top: Math.round((ch - lh) / 2) },
        { input: overlayPng, left: 0, top: 0 },
      ])
      .png({ quality: 90, palette: true, compressionLevel: 9 })
      .toBuffer();
    return composed;
  };
  const png1x = await scale(1);
  const png2x = await scale(2);
  fs.writeFileSync(path.join(EXPORT, `${outBase}.png`), png1x);
  fs.writeFileSync(path.join(EXPORT, `${outBase}@2x.png`), png2x);
  console.log(outBase, '1x', png1x.length, 'bytes', '2x', png2x.length, 'bytes');
}

(async () => {
  // ---------- AGRONOMIE ----------
  {
    const canvasW = 600, canvasH = 84;
    const logoSrc = path.join(FUNDCO, 'agronomie/public/images/agronomie-logo.png');
    const logoBuf = fs.readFileSync(logoSrc);
    const logoH = 70;
    const logoW = Math.round(logoH * (1598 / 952)); // ~117
    const accentX = logoW + 30;
    const textX = accentX + 16;
    await buildBanner({
      slug: 'agronomie-ng',
      canvasW, canvasH,
      logoBuffer: logoBuf,
      logoW, logoH,
      outBase: 'agronomie-ng-logo-signature',
      extraSvgParts: (m) => `
        <rect x="${accentX * m}" y="${17 * m}" width="${2 * m}" height="${50 * m}" fill="#26b762"/>
        <text x="${textX * m}" y="${38 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${20 * m}" fill="#0b2f6b">Powering Nigeria's</text>
        <text x="${textX * m}" y="${62 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${20 * m}" fill="#1c9450">Cold Chain</text>
      `,
    });
  }

  // ---------- ELECTRIFY MICROGRID (EML) ----------
  // Compact logo-only mark (no baked tagline) — used in a banner-beside-text
  // row layout in the footer HTML, with the tagline as live typed text.
  {
    const logoH = 60;
    const logoW = Math.round(logoH * (3050 / 700)); // ~261
    const canvasW = logoW, canvasH = logoH;
    const svgSrc = path.join(FUNDCO, 'electrifymicrogrid/public/images/electrify-logo.svg');
    const rasterBuf = await sharp(svgSrc, { density: 600 }).png().toBuffer(); // 3050x700, transparent bg
    await buildBanner({
      slug: 'electrifymicrogrid-ng',
      canvasW, canvasH,
      logoBuffer: rasterBuf,
      logoW, logoH,
      outBase: 'electrifymicrogrid-ng-logo-signature',
      extraSvgParts: () => ``,
    });
  }

  // ---------- E-MOBILITE ----------
  {
    const canvasW = 600, canvasH = 84;
    const logoSrc = path.join(FUNDCO, 'e-mobilite/public/images/e-mobilite-logo-real.png');
    const transparentSharp = await whiteToTransparent(logoSrc, { threshold: 248, feather: 18 });
    const transparentBuf = await transparentSharp.toBuffer();
    fs.mkdirSync(SRCASSETS, { recursive: true });
    fs.writeFileSync(path.join(SRCASSETS, 'e-mobilite-logo-transparent.png'), transparentBuf);
    const logoH = 56;
    const logoW = Math.round(logoH * (1615 / 480)); // ~188
    const barX = logoW + 18;
    const textX = barX + 16;
    await buildBanner({
      slug: 'e-mobilite-ng',
      canvasW, canvasH,
      logoBuffer: transparentBuf,
      logoW, logoH,
      outBase: 'e-mobilite-ng-logo-signature',
      extraSvgParts: (m) => `
        <rect x="${barX * m}" y="0" width="${6 * m}" height="${canvasH * m}" fill="#d4ff3d"/>
        <text x="${textX * m}" y="${38 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${18 * m}" fill="#071726">Own the Ride.</text>
        <text x="${textX * m}" y="${60 * m}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${18 * m}" fill="#0e9de0">Finance the Future.</text>
      `,
    });
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
