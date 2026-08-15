#!/usr/bin/env node
/**
 * Scrape the deployed examples gallery into scripts/gallery-index.json
 * (slug, title, board, difficulty) — the source of truth for which demo
 * videos we can record.
 *
 *   node scripts/gallery-scan.mjs
 */
import { globSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";

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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/examples`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);

// Cards are .example-card divs (no anchors); the slug comes from the
// thumbnail filename (/examples-thumbs/<slug>.webp).
const items = await page.evaluate(() => {
  const out = [];
  for (const card of document.querySelectorAll(".example-card")) {
    const src = card.querySelector("img")?.getAttribute("src") || "";
    const slug = (src.split("/").pop() || "").replace(/\.(webp|png|jpg)$/, "");
    if (!slug) continue;
    const txt = sel => card.querySelector(sel)?.textContent?.trim() || "";
    out.push({
      slug,
      title: txt(".example-title"),
      description: txt(".example-description"),
      difficulty: txt(".example-difficulty"),
      category: txt(".example-category"),
      board: txt(".example-board, [class*=board]"),
    });
  }
  return out;
});
await browser.close();

const seen = new Set();
const uniq = items.filter(i => !seen.has(i.slug) && seen.add(i.slug));
await writeFile(
  join(HERE, "gallery-index.json"),
  JSON.stringify(uniq, null, 1)
);
console.log(`${uniq.length} examples -> scripts/gallery-index.json`);
