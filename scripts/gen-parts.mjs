#!/usr/bin/env node
/**
 * Parts reference generator.
 *
 *   node scripts/gen-parts.mjs
 *
 * Single source of truth: the deployed app itself. Fetches
 * /components-metadata.json (the registry the component picker uses) and
 * instantiates every part's web component in a headless page to read its
 * live `pinInfo` — so the generated pinouts always match the canvas.
 *
 * Also screenshots each part's element into src/assets/docs/parts/<id>.png,
 * so the reference can show WHICH part a page is about. The overview page
 * has promised "a photo and the interactive pinout" since day one; only the
 * pinout half was ever generated.
 *
 * Output: src/content/docs/parts/<category>/<id>.md — one page per part,
 * fully regenerated on each run (delete + rewrite, idempotent). Do not
 * edit the generated pages by hand; edit this generator or the app's
 * registry instead.
 *
 * Env: VELXIO_BASE (default https://vstaging.moontero.com)
 */
import { globSync, mkdirSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "src", "content", "docs", "parts");
const IMG = join(HERE, "..", "src", "assets", "docs", "parts");

/* The tile the part is photographed on.
 *
 * NOT transparent, unlike the board art. Boards are colourful PCBs that read
 * on any ground, but a good part of this catalog is bare SCHEMATIC SYMBOLS
 * (transistors, gates, op-amps) whose ink follows the app's theme — captured
 * on transparency they would be invisible on half the docs pages, since the
 * portal has a light and a dark mode of its own. Baking a light tile makes
 * one image that reads on both, which is exactly what the component picker
 * does with its thumbnails. */
const TILE_BG = "#f4f5f7";
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";

// Category slug -> { dir, label } (dir doubles as the sidebar group name).
// `boards` is intentionally absent: boards have their own hand-written
// section. The stray `sensor` singular in the registry maps to sensors.
const CATEGORIES = {
  displays: { dir: "displays", label: "Displays" },
  sensors: { dir: "sensors", label: "Sensors" },
  sensor: { dir: "sensors", label: "Sensors" },
  input: { dir: "input", label: "Input" },
  output: { dir: "output", label: "Output" },
  motors: { dir: "motors", label: "Motors" },
  communication: { dir: "communication", label: "Communication" },
  passive: { dir: "passive", label: "Passive" },
  logic: { dir: "logic-gates", label: "Logic gates" },
  analog: { dir: "analog", label: "Analog" },
  electromech: { dir: "electromechanical", label: "Electromechanical" },
  other: { dir: "other", label: "Other" },
};

const esc = s =>
  String(s ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("<", "&lt;")
    .replace(/\s+/g, " ")
    .trim();

async function launch() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    const candidates = [
      ...globSync(
        `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`
      ),
      ...globSync(
        `${process.env.HOME}/.cache/ms-playwright/chromium-*/chrome-linux*/chrome`
      ),
    ]
      .sort()
      .reverse();
    if (!candidates.length) throw new Error("no chromium in ms-playwright cache");
    return chromium.launch({ headless: true, executablePath: candidates[0] });
  }
}

// ── fetch the registry ──────────────────────────────────────────────────────
const res = await fetch(`${BASE}/components-metadata.json`);
if (!res.ok) throw new Error(`metadata fetch failed: ${res.status}`);
const { components } = await res.json();
console.log(`registry: ${components.length} components from ${BASE}`);

// ── read live pinInfo from the app's custom elements ────────────────────────
const browser = await launch();
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
// Schematic symbols read their ink from the app's theme through the shadow
// boundary, so the capture has to pin one. Light, to match the tile they are
// photographed on. addInitScript runs before any page script, which is what
// the app's own pre-paint bootstrap needs.
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("velxio-theme", "light");
  } catch {
    /* storage denied — the capture just gets the default theme */
  }
});
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(8000); // app bundle registers every custom element

const pinInfoByTag = await page.evaluate(tags => {
  const out = {};
  for (const tag of tags) {
    try {
      if (!customElements.get(tag)) continue;
      const el = document.createElement(tag);
      document.body.appendChild(el);
      const info = el.pinInfo;
      out[tag] = Array.isArray(info)
        ? info.map(p => ({ name: p.name, signals: (p.signals || []).map(s => s.type || s.signal || "").filter(Boolean) }))
        : null;
      el.remove();
    } catch {
      out[tag] = null;
    }
  }
  return out;
}, components.map(c => c.tagName).filter(Boolean));
const withPins = Object.values(pinInfoByTag).filter(Boolean).length;
console.log(`pinInfo: resolved for ${withPins} tags`);

// ── photograph each part ────────────────────────────────────────────────────
rmSync(IMG, { recursive: true, force: true });
mkdirSync(IMG, { recursive: true });

const artById = {};
const artFailed = [];
for (const c of components) {
  if (!c.tagName || !c.id) continue;
  try {
    const placed = await page.evaluate(
      ({ tag, bg }) => {
        if (!customElements.get(tag)) return { error: `tag ${tag} not defined` };
        document.body.innerHTML = "";
        document.body.style.background = bg;
        document.body.style.margin = "0";
        const el = document.createElement(tag);
        el.id = "shot-target";
        el.style.position = "absolute";
        el.style.left = "24px";
        el.style.top = "24px";
        document.body.appendChild(el);
        return { ok: true };
      },
      { tag: c.tagName, bg: TILE_BG }
    );
    if (placed.error) throw new Error(placed.error);
    // Elements fetch their face SVG asynchronously; screenshotting before it
    // lands yields an empty box or a half-drawn part.
    await page.waitForTimeout(700);

    const el = page.locator("#shot-target");
    const box = await el.boundingBox();
    if (!box || box.width < 6 || box.height < 6)
      throw new Error(`empty bounding box (${JSON.stringify(box)})`);
    // No omitBackground: the tile is the point (see TILE_BG).
    await el.screenshot({ path: join(IMG, `${c.id}.png`) });
    artById[c.id] = true;
  } catch (err) {
    artFailed.push(`${c.id}: ${err.message}`);
  }
}
console.log(`art: captured ${Object.keys(artById).length}/${components.length}`);
if (artFailed.length) console.log(`art failed: ${artFailed.slice(0, 12).join(" | ")}`);

await browser.close();

// ── emit pages ──────────────────────────────────────────────────────────────
for (const { dir } of Object.values(CATEGORIES))
  rmSync(join(OUT, dir), { recursive: true, force: true });

let written = 0;
const skipped = [];
for (const c of components) {
  const cat = CATEGORIES[c.category];
  if (!cat) {
    skipped.push(`${c.id} (${c.category})`);
    continue;
  }
  const pins = pinInfoByTag[c.tagName] || null;
  const desc = c.description || `${c.name} — ${cat.label} part in the Velxio catalog.`;

  let body = `${desc}\n`;
  // Four levels up: the page sits at content/docs/parts/<cat>/, the art at
  // src/assets/docs/parts/.
  if (artById[c.id])
    body += `\n![${esc(c.name)}](../../../../assets/docs/parts/${c.id}.png)\n`;
  if (pins && pins.length) {
    body += `\n## Pins\n\n| Pin | Signals |\n| --- | --- |\n`;
    for (const p of pins)
      body += `| **${esc(p.name)}** | ${esc(p.signals.join(", ")) || "—"} |\n`;
  } else if (c.pinCount) {
    body += `\nThe part exposes **${c.pinCount} pins** — see them live on the canvas.\n`;
  }
  if (c.properties?.length) {
    body += `\n## Attributes\n\nEditable from the [part inspector](/docs/circuit-editor/part-inspector/):\n\n| Attribute | Default | Description |\n| --- | --- | --- |\n`;
    for (const p of c.properties)
      body += `| \`${esc(p.name)}\` | \`${esc(String(p.defaultValue ?? ""))}\` | ${esc(p.description)} |\n`;
  }
  body += `\n## Use it\n\nAdd it from the [component picker](/docs/circuit-editor/placing-components/) — search for “${esc(c.name)}”`;
  if (c.tags?.length) body += ` (tags: ${c.tags.slice(0, 5).map(esc).join(", ")})`;
  body += `.\nRight-click it on the canvas for the in-editor datasheet, and check the\n[examples gallery](https://velxio.dev/examples) for circuits that use it.\n`;

  const file = join(OUT, cat.dir, `${c.id}.md`);
  mkdirSync(dirname(file), { recursive: true });
  await writeFile(
    file,
    `---\ntitle: "${esc(c.name).replaceAll('"', "'")}"\ndescription: "${esc(desc).replaceAll('"', "'").slice(0, 160)}"\n---\n\n<!-- Generated by scripts/gen-parts.mjs — do not edit by hand. -->\n\n${body}`
  );
  written++;
}

// ── visual index ────────────────────────────────────────────────────────────
// The per-part pages carry their own photo now, but you have to already know
// which part you want to open one. This page is the contact sheet: every part
// in the catalog, by category, so a reader who knows what the thing LOOKS
// like can find its name.
//
// Markdown image syntax on purpose — Astro only runs its image pipeline over
// `![]()` and MDX <Image>, so a raw <img src="../..."> would 404 (assets live
// outside public/). The height cap rides in per-page frontmatter rather than
// custom.css so it cannot leak onto other pages.
const COLS = 4;
let gallery = "";
for (const { dir, label } of Object.values(CATEGORIES).filter(
  (v, i, a) => a.findIndex(x => x.dir === v.dir) === i
)) {
  const inCat = components.filter(
    c => CATEGORIES[c.category]?.dir === dir && artById[c.id]
  );
  if (!inCat.length) continue;
  gallery += `\n## ${label}\n\n`;
  gallery += `| ${Array(COLS).fill(" ").join(" | ")} |\n|${" --- |".repeat(COLS)}\n`;
  for (let i = 0; i < inCat.length; i += COLS) {
    const row = inCat.slice(i, i + COLS).map(c => {
      const href = `/docs/parts/${CATEGORIES[c.category].dir}/${c.id}/`;
      return `[![${esc(c.name)}](../../../assets/docs/parts/${c.id}.png)](${href})<br />[${esc(c.name)}](${href})`;
    });
    while (row.length < COLS) row.push(" ");
    gallery += `| ${row.join(" | ")} |\n`;
  }
}
await writeFile(
  join(OUT, "gallery.md"),
  `---
title: "Part gallery"
description: "Every component in the catalog, by category, with its canvas art."
sidebar:
  order: 3
head:
  - tag: style
    content: ".sl-markdown-content table img { max-height: 56px; width: auto; margin: 0 auto; display: block; } .sl-markdown-content table td { text-align: center; vertical-align: top; font-size: 0.8em; }"
---

<!-- Generated by scripts/gen-parts.mjs — do not edit by hand. -->

Every part you can drop on the canvas, drawn exactly as it appears there.
Click one for its pinout, attributes and datasheet.
${gallery}`
);
console.log(`wrote gallery.md with ${Object.keys(artById).length} thumbnails`);

console.log(`wrote ${written} part pages`);
if (skipped.length) console.log(`skipped: ${skipped.join(", ")}`);
