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
const page = await browser.newPage();
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
await browser.close();

const withPins = Object.values(pinInfoByTag).filter(Boolean).length;
console.log(`pinInfo: resolved for ${withPins} tags`);

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

console.log(`wrote ${written} part pages`);
if (skipped.length) console.log(`skipped: ${skipped.join(", ")}`);
