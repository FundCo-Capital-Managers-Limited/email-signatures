# Email signature project — shared spec

This repo is standalone (its own git history), separate from the website repos in the
sibling `Fundco/` folder. Deliverable: one HTML email footer (Exchange Online transport-rule
disclaimer) + banner images + preview screenshot per company below.

## Repo layout
```
email-signatures/
  export/           -> banner PNGs, 1x + 2x, per company: <domain-slug>-logo-signature.png / @2x.png
  templates/         -> one HTML file per company: <domain-slug>-footer.html
  previews/          -> one PNG per company, matching template name: <domain-slug>-footer-preview.png
  source-assets/     -> (optional) any intermediate/cropped logo files used to build banners
  SPEC.md            -> this file
  MANIFEST.md        -> master list of every [LOGO_URL_*] placeholder token, to be written after all companies done
  README.md          -> Task 4 deliverable, written after all companies done
  deploy-signatures.ps1 -> Task 4 deliverable, written after all companies done
```
`<domain-slug>` = the real domain with dots replaced by hyphens, e.g. `fundco-ng`, `onecapinvestment-ng`.

## Company data table

| Company | Domain (real, confirmed) | Logo source (in sibling `Fundco/` folder) | Primary hex | Secondary/accent hex | Navy/dark hex | Font (site uses, NOT email-safe) | Tagline seed (yours to refine) |
|---|---|---|---|---|---|---|---|
| FundCo Capital Managers (PARENT — catch-all rule, lowest priority) | fundco.ng | `fundco/public/images/fundco-logo-email-499.png` (already 499x115, pre-sized for email — use as-is or regenerate at higher res from `fundco-logo.svg` if sharper) | `#004a91` | dark `#002c57` | `#424242` | Montserrat | "Capital for Africa's Energy Transition" |
| OneCap Investment Limited | onecapinvestment.ng | `onecap/public/images/onecap-logo-full.png` (1535x480, white bg) | `#2f9e63` | navy `#00417d` | dark `#001830` | Inter | "Private Capital. Public Impact." |
| Agronomie | agronomie.ng | `agronomie/public/images/agronomie-logo.png` (1598x952, alpha) | `#26b762` | navy `#0b2f6b` | brand-dark `#1c9450` | Poppins | "Powering Nigeria's Cold Chain" |
| Electrify Microgrid Limited (EML) | electrifymicrogrid.ng | `electrifymicrogrid/public/images/electrify-logo.svg` (366x84, vector) | `#30a349` | accent `#fda822` | navy `#192d41` | Poppins | "Decentralized Power, Delivered" |
| E-Mobilite | e-mobilite.ng | `e-mobilite/public/images/e-mobilite-logo-real.png` (1615x480, white bg) | `#0e9de0` | accent (lime) `#d4ff3d` | navy `#071726` | Space Grotesk | "Own the Ride. Finance the Future." |
| Regenloop | regenloop.ng | `regenloop/public/images/regenloop-logo-full.png` (1198x238, white bg) | `#5fb645` | accent `#e8a33d` | navy/dark `#153c1d` | Sora | "Closing the Loop on Waste" |
| Clean Energy Local Currency Fund (CEF) | cleanenergyfund.ng | `cleanenergyfund/src/assets/logo.png` (603x126, alpha) | blue `#0f388a` | teal `#20b6aa` | navy `#0a255c` | Montserrat (heading) / Open Sans (body) | "Financing Nigeria's Energy Transition" |
| MeshWorks Solar Limited | meshworks.ng | `meshworks/public/meshworks-logo.jpg` (847x295, light-gray bg ~#f7f7f7, only raster available) | primary `#1a5c3a` | accent/gold `#d9a441` | — | Geist | "Power the Future with Meshworks" |
| GreenKiosk | greenkiosk.ng | `greenkiosk/public/greenkiosk-logo.png` (165x43, small — check `greenkiosk/public/images/greenkiosk-logo.png` too for a larger source, use whichever is higher-res) | emerald `#39B86C` | teal `#4FC3C2` / purple `#7A4DD8` | navy `#1B3557` | Geist | "Solar-Powered Micro-Hubs for Rural Nigeria" |
| GroSolar | **grosolar.ng (UNCONFIRMED — no live site yet; flag this clearly in the footer's HTML as an HTML comment AND in the README as TBD, do not silently treat it as final)** | `../_shared-logos/grosolar-logo.svg` (151x35, vector, orange/gold gradient icon `#FF9733→#FCD733` + navy wordmark `#002554`) | navy `#002554` | gradient `#FF9733`→`#FCD733` | — | (no site yet — use a clean system sans; don't invent a brand font) | "Solar Energy, Simplified" (placeholder — no live copy exists yet, flag as your own invention) |

Notes:
- Every hex above was read directly from each site's own CSS/Tailwind/globals file or the logo SVG itself — nothing guessed.
- oklch/HSL source values were already converted to hex for MeshWorks and CEF — use the hex given, don't reconvert.
- GroSolar is pre-launch. Its domain is a placeholder assumption (matches the `.ng` pattern every other subsidiary uses) — mark it unmistakably as TBD everywhere it appears (HTML comment near the top of the footer file, and a dedicated flagged line in the README/MANIFEST) so it's never mistaken for a confirmed value when the deployment script is run.

## Font fallback policy (applies to ALL companies)
Outlook desktop (Word rendering engine), OWA, Outlook mobile, Gmail, and Apple Mail do NOT
reliably support `@font-face`/Google Fonts in transport-rule HTML. Never reference a Google
Font by name in the HTML. Instead pick a safe fallback STACK per company that approximates
the site font's character, and document your choice:
- Geometric/rounded sans (Poppins, Montserrat, Geist, Space Grotesk, Sora) → `'Segoe UI', Arial, Helvetica, sans-serif` (Segoe UI is the closest geometric-humanist safe font and is what Outlook/Windows renders natively anyway)
- Grotesque/neutral sans (Inter, Manrope) → `Arial, Helvetica, sans-serif`
- Serif if any company ever needs one → `Georgia, 'Times New Roman', serif`
Record your exact choice per company in the HTML (a comment is fine) AND you'll list it again in the final shared README (Task 4 — don't write the README yet, just be consistent so it's easy to compile later).

## Image prep rules (Task 1)
- Build a banner LOCKUP: logo + optional short tagline, sized for a 600px-wide footer — typical banner height 60-90px depending on the company's logo aspect ratio, your creative call per company.
- Background: transparent PNG if the logo already reads well on any background (white or colored), OR a solid brand-color background baked into the banner if the logo needs a color card behind it (e.g. a white logo needs a dark card) — your call per company, matching what actually looks best for that specific mark.
- Export TWO files per company: `<slug>-logo-signature.png` (1x, e.g. 600x90) and `<slug>-logo-signature@2x.png` (2x, e.g. 1200x180). The HTML `<img>` tag references the @2x file's URL but sets `width`/`height` attributes to the 1x display size (so it renders crisp/retina without bloating perceived size).
- Target under ~40KB per exported file (pngquant-style palette reduction via `sharp`'s `.png({quality, palette:true})`, or re-export as optimized PNG-8 where the mark is simple/flat-color; a few complex/gradient marks — e.g. GroSolar's gradient — may not hit 40KB cleanly, that's fine, just flag it).
- Save all exports to `email-signatures/export/`.
- Use `require('../email-signatures/node_modules/sharp')` from within the `Fundco/` folder, or `require('sharp')` from within `email-signatures/` itself (it's already installed there as a devDependency — check `email-signatures/package.json`).

## HTML footer rules (Task 2 — applies to every company)
1. Table-based layout ONLY. All styles INLINE on every element (`style="..."` attributes). NO `<style>` block anywhere, no external CSS, no flexbox/grid/CSS grid properties.
2. Use MSO conditional comments (`<!--[if mso]>...<![endif]-->`) wherever Outlook desktop needs `<v:roundrect>`/VML tricks, extra spacer cells, or fixed `<table>` widths to avoid image gaps or column collapse — every other client falls back to the plain HTML inside a `<!--[if !mso]><!-->...<!--<![endif]-->` pair if needed.
3. Reference the company's banner image via a placeholder token in the `src`, formatted `[LOGO_URL_<SLUG>]` where `<SLUG>` is the domain slug UPPERCASED with hyphens (e.g. `[LOGO_URL_FUNDCO_NG]`). Always set explicit `width` and `height` attributes (1x display size) and real `alt` text (company name, not "logo").
4. Fixed total width ~600px. Non-responsive — no media queries, no percentage widths that would reflow; let it degrade gracefully (e.g. horizontal scroll or simple truncation) rather than break.
5. Keep total file size well under 8,000 characters — check with `(Get-Content file -Raw).Length` or `wc -c` after writing; if a company's design is pushing close to that limit, simplify rather than let it balloon.
6. Include Exchange dynamic tokens for the person's own info — NEVER hardcode a name: `%%DisplayName%%`, `%%Title%%`, `%%Department%%`, `%%StreetAddress%%`, `%%TelephoneNumber%%`. Use FundCo's known real HQ address as the STATIC company-address line (separate from the dynamic `%%StreetAddress%%` token, which represents the individual signer's own AD-profile address if their org uses per-person addresses — both can coexist: dynamic token for the person, static line for the company's registered office) — the confirmed FundCo group address is **"Plot 1610, Adeola Hopewell Street, VI, Lagos"** for every FundCo-affiliated company EXCEPT ones based elsewhere (none of these 10 are — GroSolar and CEF are also Lagos/Nigeria-based per their site content; if any company's own site content contradicts this, use the site's own address instead and flag it).
7. GENUINE design range required — do not reuse one skeleton with just a recolor. Examples of axes to vary per company: banner-above-text vs. banner-beside-text (logo left, info right, in one row); a colored left accent bar/rule vs. no accent; a bottom color strip vs. none; a two-line vs. three-line info block; a small tagline under the logo vs. logo-only; a boxed "card" footer (background color, padding, rounded corners via MSO `<v:roundrect>` where needed) vs. a plain flush-left footer. Pick what suits each company's specific brand assets and let the differences be real.
8. Add ONE unique HTML comment marker per company, placed somewhere non-rendering (e.g. right after `<body>` or as the very first line): `<!-- FTR-<SLUG>-V1 -->` (e.g. `<!-- FTR-FUNDCO-NG-V1 -->`).
9. Filename: `<slug>-footer.html` in `email-signatures/templates/` (e.g. `fundco-ng-footer.html`).

## Preview rendering (Task 3)
For each footer HTML file, render it in headless Chromium (use `playwright-core` — already installed in this repo's `node_modules`, and a cached Chromium binary already exists at `%LOCALAPPDATA%\ms-playwright`, so `npx playwright install chromium` should be instant/no-op if it's compatible; if the installed `playwright-core` version doesn't match the cached browser revision, run `npx playwright install chromium` fresh) at exactly 600px viewport width, with the `%%...%%` tokens replaced by this sample data ONLY in the rendered preview copy (never edit the token in the actual template file):
- `%%DisplayName%%` → `Jane Doe`
- `%%Title%%` → `Marketing Manager`
- `%%Department%%` → `Communications`
- `%%StreetAddress%%` → `Plot 1610, Adeola Hopewell Street, VI, Lagos` (or the company's own address if it differs per rule #6 above)
- `%%TelephoneNumber%%` → `+234 1 555 0100`
Also replace each `[LOGO_URL_*]` placeholder with a `file://` path to the actual exported PNG from `export/` so the preview shows the real banner, not a broken image icon. Screenshot just the footer element (not a blank white page around it) at native size, save as `email-signatures/previews/<slug>-footer-preview.png`.

## Working method
Do NOT touch git config in this repo (leave default local identity as whatever the environment provides — this is a brand new repo, no prior history to match). Do NOT push anywhere (no remote is configured). Commit your work when your assigned companies are complete and verified, with a clear message.
