#!/usr/bin/env node
/**
 * Second pass over the recorded takes: measure where the circuit sits on
 * the 1920x1080 canvas and merge that box into promo/public/gallery/<slug>.json,
 * so the composition can frame the footage on the circuit instead of
 * showing acres of empty canvas.
 *
 *   VELXIO_SHOTS_EMAIL=... VELXIO_SHOTS_PASSWORD=... node scripts/gallery-bbox.mjs
 *
 * Cheap: it loads each example but never compiles or runs it.
 */
import { globSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const TAKES = join(HERE, "..", "promo", "public", "gallery");
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";
const VIEWPORT = { width: 1920, height: 1080 };

const BBOX = `(() => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0;
  const eat = r => {
    if (!r || r.width < 3 || r.height < 3) return;
    if (r.width > innerWidth * 0.85 || r.height > innerHeight * 0.85) return;
    if (r.bottom < 90 || r.top > innerHeight - 20) return;
    x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top);
    x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); n++;
  };
  for (const el of document.querySelectorAll("*")) {
    if (!el.tagName.includes("-")) continue;
    if (/^(velxio-agent|velxio-news)/i.test(el.tagName)) continue;
    eat(el.getBoundingClientRect());
  }
  for (const p of document.querySelectorAll('path[stroke="#1a1a1a"]'))
    eat(p.getBoundingClientRect());
  return n ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
})()`;

const slugs = (process.argv.slice(2).filter(a => !a.startsWith("--")).length
  ? process.argv.slice(2).filter(a => !a.startsWith("--"))
  : globSync(`${TAKES}/*.json`).map(p => p.split("/").pop().replace(/\.json$/, ""))
).sort();

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch {
  const c = globSync(
    `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`
  )
    .sort()
    .reverse();
  browser = await chromium.launch({ headless: true, executablePath: c[0] });
}
for (const slug of slugs) {
  const file = join(TAKES, `${slug}.json`);
  // A fresh context per example: the editor keeps enough state that a
  // second client-side load leaves the canvas empty.
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  try {
    const meta = JSON.parse(await readFile(file, "utf8"));
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      async ({ email, password }) =>
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }).then(r => r.status),
      {
        email: process.env.VELXIO_SHOTS_EMAIL,
        password: process.env.VELXIO_SHOTS_PASSWORD,
      }
    );
    await page.goto(`${BASE}/example/${slug}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6500);
    await page.evaluate(() => {
      for (const el of document.querySelectorAll(".velxio-news-overlay")) el.remove();
      document
        .querySelector('button[aria-label="Minimize chat"], button[title="Minimize"]')
        ?.click();
    });
    const circuitBtn = page.locator('button:has-text("Circuit")').first();
    if (await circuitBtn.count()) {
      await circuitBtn.click();
      await page.waitForTimeout(1000);
    }
    const reset = page.locator("button.zoom-level");
    if (await reset.count()) {
      await reset.click();
      await page.waitForTimeout(700);
    }
    const box = await page.evaluate(BBOX);
    meta.box = box;
    await writeFile(file, JSON.stringify(meta, null, 1));
    console.log(
      `${slug}: ${box ? `${Math.round(box.w)}x${Math.round(box.h)} @ ${Math.round(box.x)},${Math.round(box.y)}` : "no box"}`
    );
  } catch (e) {
    console.error(`FAIL ${slug}: ${String(e).slice(0, 120)}`);
  }
  await context.close();
}
await browser.close();
