#!/usr/bin/env node
/**
 * Weather-station media: stills + an animated GIF of the public project
 * https://velxio.dev/dave/estacin-meteorolgica-esp32 running live.
 *
 *   node scripts/weather-media.mjs
 *
 * Runs against PRODUCTION on purpose (the project lives in the prod DB),
 * anonymously — loading a public project and pressing Run is normal
 * visitor usage. Captures:
 *   getting-started/weather-loaded.png    circuit + code as it opens
 *   getting-started/weather-running.png   TFT drawing live data
 *   getting-started/weather-serial.png    serial clip
 *   getting-started/weather-station.gif   ~12 s of the sim running
 *
 * Needs ffmpeg on the PATH (webm -> palette-optimized gif).
 */
import { globSync, mkdirSync, rmSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "src", "assets", "docs", "getting-started");
const TMP = join(HERE, ".weather-video");
const PROJECT_URL =
  process.env.VELXIO_WEATHER_URL ||
  "https://velxio.dev/dave/estacin-meteorolgica-esp32";

async function launch() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    const c = [
      ...globSync(
        `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`
      ),
      ...globSync(
        `${process.env.HOME}/.cache/ms-playwright/chromium-*/chrome-linux*/chrome`
      ),
    ]
      .sort()
      .reverse();
    if (!c.length) throw new Error("no chromium in ms-playwright cache");
    return chromium.launch({ headless: true, executablePath: c[0] });
  }
}

mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });

const browser = await launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: TMP, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const simLog = [];
page.on("console", m => {
  if (/esp32sim|guest crashed|in-browser/i.test(m.text())) simLog.push(m.text());
});

/** Count distinct colors on the biggest shadow-DOM canvas (the TFT). */
const TFT_PROBE = `(() => {
  const canvases = [];
  const walk = root => {
    for (const el of root.querySelectorAll("*"))
      if (el.shadowRoot) {
        for (const c of el.shadowRoot.querySelectorAll("canvas")) canvases.push(c);
        walk(el.shadowRoot);
      }
  };
  walk(document);
  const tft = canvases.filter(c => c.width >= 100).sort((a, b) => b.width - a.width)[0];
  if (!tft) return 0;
  const d = tft.getContext("2d").getImageData(0, 0, tft.width, tft.height).data;
  const colors = new Set();
  for (let i = 0; i < d.length; i += 400)
    colors.add((d[i] >> 4) + "," + (d[i + 1] >> 4) + "," + (d[i + 2] >> 4));
  return colors.size;
})()`;

await page.goto(PROJECT_URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(8000);
await page.evaluate(() => {
  for (const el of document.querySelectorAll(".velxio-news-overlay")) el.remove();
});
await page.screenshot({ path: join(OUT, "weather-loaded.png") });

// Full-width canvas for the running shots and the GIF: hide the code pane.
await page.locator('button:has-text("Circuit")').first().click();
await page.waitForTimeout(1500);

await page
  .locator('button[title*="Run" i], button:has-text("Run")')
  .first()
  .click();
const t0 = Date.now();
while (
  Date.now() - t0 < 300_000 &&
  !simLog.some(l => l.includes("in-browser")) &&
  !simLog.some(l => /guest crashed/i.test(l))
) {
  await page.waitForTimeout(2000);
}
if (simLog.some(l => /guest crashed/i.test(l)))
  throw new Error("guest crashed: " + simLog.find(l => /crashed/i.test(l)));

// Wait until the TFT actually DRAWS (init + first sensor sweep), then let
// the dashboard refresh a few times so the GIF footage has motion.
const t1 = Date.now();
let colors = 0;
while (Date.now() - t1 < 360_000) {
  colors = await page.evaluate(TFT_PROBE);
  if (colors > 4) break;
  await page.waitForTimeout(2000);
}
console.log(`tft distinct colors: ${colors}`);
await page.waitForTimeout(3000);

// Zoom the canvas so the TFT text is readable (the user-visible zoom
// buttons scale the real elements — the video records CSS pixels, so
// this genuinely enlarges the display in stills and GIF alike).
for (let i = 0; i < 3; i++) {
  await page.locator('button[title="Zoom in"]').click();
  await page.waitForTimeout(400);
}
// Where did the TFT land after zooming?
const tftBox = await page.evaluate(() => {
  const el = document.querySelector("wokwi-ili9341");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
console.log("tft box:", JSON.stringify(tftBox));
// Crop region: TFT + margin, clamped to the canvas viewport area.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
let crop = { x: 0, y: 90, width: 900, height: 420 };
if (tftBox) {
  const m = 70;
  const x = clamp(tftBox.x - m, 0, 1279);
  const y = clamp(tftBox.y - m, 85, 719);
  crop = {
    x,
    y,
    width: clamp(tftBox.w + 2 * m, 200, 1280 - x),
    height: clamp(tftBox.h + 2 * m, 200, 520 - y),
  };
}
// Even-numbered geometry for ffmpeg
for (const k of ["x", "y", "width", "height"]) crop[k] = Math.floor(crop[k] / 2) * 2;
console.log("crop:", JSON.stringify(crop));

await page.screenshot({ path: join(OUT, "weather-running.png"), clip: crop });
await page.screenshot({
  path: join(OUT, "weather-serial.png"),
  clip: { x: 180, y: 515, width: 725, height: 205 },
});

// GIF footage: TFT refreshes + serial scrolls.
await page.waitForTimeout(14000);

await context.close(); // flushes the video file
await browser.close();

const webm = globSync(`${TMP}/*.webm`)[0];
if (!webm) throw new Error("no video recorded");

// Last ~12 s, cropped to the zoomed TFT region, 720 px wide, 6 fps,
// two-pass palette for a small clean GIF.
const gif = join(OUT, "weather-station.gif");
execSync(
  `ffmpeg -y -sseof -12 -i "${webm}" -vf "crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},fps=6,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${gif}"`,
  { stdio: "pipe" }
);
rmSync(TMP, { recursive: true, force: true });
const kb = Math.round(statSync(gif).size / 1024);
console.log(`gif: ${gif} (${kb} KB)`);
