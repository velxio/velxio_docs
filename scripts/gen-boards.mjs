#!/usr/bin/env node
/**
 * Board reference generator: one page per board with the REAL board art
 * and the full pin map, both taken from the app's own web components.
 *
 *   node scripts/gen-boards.mjs [kind ...]
 *
 * For every board kind, the script instantiates the same custom element
 * the canvas uses (BoardOnCanvas's mapping, frozen below), screenshots it
 * at 2x into src/assets/docs/boards/<kind>.png, reads its live `pinInfo`,
 * and emits src/content/docs/boards/reference/<kind>.md. Fully
 * regenerated per run — never edit the output by hand. With kinds as args,
 * only those pages are regenerated and the rest are left untouched.
 *
 * Hand-written per-board guides live in scripts/board-extras/<kind>.md and
 * are spliced into the generated page, so they survive regeneration. Asset
 * paths inside an extras file are relative to the OUTPUT page
 * (../../../../assets/docs/...). Run prettier over the generated .md after
 * a run — the committed pages are formatted, this script's output is not.
 *
 * An extras file must NOT paste example source by hand — that copy goes stale
 * the moment somebody edits the example. Write `{{example:<slug>}}` (add
 * `|python` for a MicroPython one) and the generator pulls the real sketch out
 * of the running editor. Note the one-deploy lag that implies: the code comes
 * from the app THIS BASE is serving, so an example edited but not yet deployed
 * still shows its old text here — which is what a reader would see too.
 *
 * Env: VELXIO_BASE (default https://vstaging.moontero.com — must serve a
 * pro build so the overlay board elements are registered too).
 */
import { existsSync, globSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const IMG = join(HERE, "..", "src", "assets", "docs", "boards");
const OUT = join(HERE, "..", "src", "content", "docs", "boards", "reference");
const EXTRAS = join(HERE, "board-extras");
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";

const AR = "Arduino C++";
const MPY = "MicroPython";
const IDF = "ESP-IDF";
const ESP_LANGS = [AR, MPY, IDF];

/** kind -> how the canvas renders it (tag + attrs), plus doc metadata.
 *  Mirrors BoardOnCanvas.tsx / Esp32Element BOARD_CONFIGS /
 *  Stm32BluePillElement TAG_TO_KIND / the pro board registers. */
const BOARDS = {
  "arduino-uno":  { tag: "wokwi-arduino-uno",  title: "Arduino UNO",      family: "arduino", langs: [AR] },
  "arduino-nano": { tag: "wokwi-arduino-nano", title: "Arduino Nano",     family: "arduino", langs: [AR] },
  "arduino-mega": { tag: "wokwi-arduino-mega", title: "Arduino Mega 2560", family: "arduino", langs: [AR] },
  attiny85:       { tag: "velxio-attiny85",    title: "ATtiny85",         family: "arduino", langs: [AR] },

  esp32:                { tag: "velxio-esp32", attrs: { "board-kind": "esp32" }, title: "ESP32 DevKit V1", family: "esp32", langs: ESP_LANGS },
  "esp32-devkit-c-v4":  { tag: "velxio-esp32", attrs: { "board-kind": "esp32-devkit-c-v4" }, title: "ESP32 DevKit-C V4", family: "esp32", langs: ESP_LANGS },
  "esp32-cam":          { tag: "velxio-esp32", attrs: { "board-kind": "esp32-cam" }, title: "ESP32-CAM", family: "esp32", langs: ESP_LANGS },
  "wemos-lolin32-lite": { tag: "velxio-esp32", attrs: { "board-kind": "wemos-lolin32-lite" }, title: "Wemos Lolin32 Lite", family: "esp32", langs: ESP_LANGS },
  "esp32-s3":           { tag: "velxio-esp32", attrs: { "board-kind": "esp32-s3" }, title: "ESP32-S3 DevKit", family: "esp32-s3-c3", langs: ESP_LANGS },
  "xiao-esp32-s3":      { tag: "velxio-esp32", attrs: { "board-kind": "xiao-esp32-s3" }, title: "XIAO ESP32-S3", family: "esp32-s3-c3", langs: ESP_LANGS },
  "arduino-nano-esp32": { tag: "velxio-esp32", attrs: { "board-kind": "arduino-nano-esp32" }, title: "Arduino Nano ESP32", family: "esp32-s3-c3", langs: ESP_LANGS },
  "esp32-c3":           { tag: "velxio-esp32", attrs: { "board-kind": "esp32-c3" }, title: "ESP32-C3 DevKit", family: "esp32-s3-c3", langs: ESP_LANGS },
  "xiao-esp32-c3":      { tag: "velxio-esp32", attrs: { "board-kind": "xiao-esp32-c3" }, title: "XIAO ESP32-C3", family: "esp32-s3-c3", langs: ESP_LANGS },
  "aitewinrobot-esp32c3-supermini": { tag: "velxio-esp32", attrs: { "board-kind": "aitewinrobot-esp32c3-supermini" }, title: "ESP32-C3 SuperMini", family: "esp32-s3-c3", langs: ESP_LANGS },

  "raspberry-pi-pico": { tag: "velxio-pi-pico-w", title: "Raspberry Pi Pico", family: "pico", langs: [AR, MPY] },
  "pi-pico-w":         { tag: "velxio-pi-pico-w", title: "Raspberry Pi Pico W", family: "pico", langs: [AR, MPY] },

  // `pro: true` = needs a paid plan. Truth source: upstream
  // proBoardGate.ts::isProBoardKind = STM32 + Raspberry Pi Linux (incl.
  // UNIHIKER via piFamily), and nothing else. Overlay-only boards
  // (M5Stack, Pimoroni, XIAO, C6...) run on the free plan — no badge.
  "stm32-bluepill":        { tag: "velxio-stm32-bluepill",        title: "STM32 Blue Pill (F103C8)", family: "stm32", langs: [AR], pro: true },
  "stm32-bluepill-f103cb": { tag: "velxio-stm32-bluepill-f103cb", title: "STM32 Blue Pill (F103CB)", family: "stm32", langs: [AR], pro: true },
  "stm32-blackpill":       { tag: "velxio-stm32-blackpill",       title: "STM32 Black Pill (F411CE)", family: "stm32", langs: [AR], pro: true },
  "stm32-blackpill-f401":  { tag: "velxio-stm32-blackpill-f401",  title: "STM32 Black Pill (F401CE)", family: "stm32", langs: [AR], pro: true },
  "stm32-f4-discovery":    { tag: "velxio-stm32-f4-discovery",    title: "STM32F4 Discovery", family: "stm32", langs: [AR], pro: true },
  "stm32-olimex-h405":     { tag: "velxio-stm32-olimex-h405",     title: "Olimex STM32-H405", family: "stm32", langs: [AR], pro: true },
  "stm32-netduino-plus2":  { tag: "velxio-stm32-netduino-plus2",  title: "Netduino Plus 2", family: "stm32", langs: [AR], pro: true },
  "stm32-netduino2":       { tag: "velxio-stm32-netduino2",       title: "Netduino 2", family: "stm32", langs: [AR], pro: true },

  "raspberry-pi-3": { tag: "velxio-raspberry-pi-3", title: "Raspberry Pi 3 (art shared with Zero/1/2)", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },
  "raspberry-pi-4": { tag: "velxio-raspberry-pi-4", title: "Raspberry Pi 4", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },
  "raspberry-pi-5": { tag: "velxio-raspberry-pi-5", title: "Raspberry Pi 5", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },

  "badger-2350":     { tag: "velxio-badger-2350",     title: "Pimoroni Badger 2350", family: "pro-boards", langs: [AR, MPY] },
  "cardputer-adv":   { tag: "velxio-cardputer-adv",   title: "M5 Cardputer ADV", family: "pro-boards", langs: ESP_LANGS },
  "m5stack-core":    { tag: "velxio-m5stack-core",    title: "M5Stack Core", family: "pro-boards", langs: ESP_LANGS },
  "esp32-c6":        { tag: "velxio-esp32-c6-devkit", title: "ESP32-C6 DevKit", family: "pro-boards", langs: ESP_LANGS },
  "unihiker-m10":    { tag: "velxio-unihiker-m10",    title: "UNIHIKER M10", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },
  "xiao-esp32s3-sense": { tag: "velxio-xiao-board", attrs: { variant: "esp32s3-sense" }, title: "XIAO ESP32S3 Sense", family: "pro-boards", langs: ESP_LANGS },
  "xiao-esp32c6":       { tag: "velxio-xiao-board", attrs: { variant: "esp32c6" }, title: "XIAO ESP32C6", family: "pro-boards", langs: ESP_LANGS },
  "xiao-rp2040":        { tag: "velxio-xiao-board", attrs: { variant: "rp2040" }, title: "XIAO RP2040", family: "pro-boards", langs: [AR, MPY] },
  "galactic-unicorn":       { tag: "velxio-galactic-unicorn",       title: "Pimoroni Galactic Unicorn", family: "pro-boards", langs: [AR, MPY] },
  // Arduino only: the board runs the RISC-V arduino-pico target; the RP2350
  // MicroPython path is wired for the Badger, not for this kind (no
  // supportsMicroPython in its ProBoardDef, so the mode selector never shows).
  "pimoroni-pico-plus-2w":  { tag: "velxio-pimoroni-pico-plus-2w",  title: "Pimoroni Pico Plus 2 W", family: "pro-boards", langs: [AR] },
};

const FAMILY_LABEL = {
  arduino: "Arduino & AVR",
  esp32: "ESP32 (classic)",
  "esp32-s3-c3": "ESP32-S3 and ESP32-C3",
  pico: "Raspberry Pi Pico & Pico W",
  stm32: "STM32",
  "raspberry-pi": "Raspberry Pi (Linux)",
  "pro-boards": "Pro boards",
};

const esc = s =>
  String(s ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("<", "&lt;")
    .replace(/\s+/g, " ")
    .trim();

/** Pull an example's sketch straight out of the running editor.
 *
 *  The gallery data is bundled into the SPA — there is no endpoint for it, and
 *  the gallery cards carry no slug — but /example/<slug> loads the sketch into
 *  Monaco, and Monaco publishes its models on `window.monaco`. That is the one
 *  place the real source is readable, so it is what the docs quote. */
async function exampleCode(page, slug) {
  await page.goto(`${BASE}/example/${slug}`, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 30; i++) {
    const code = await page.evaluate(
      () => window.monaco?.editor?.getModels?.()[0]?.getValue?.() || ""
    );
    if (code.trim().length > 40) return code.replace(/\s+$/, "");
    await page.waitForTimeout(1000);
  }
  throw new Error(`exampleCode: no sketch loaded for ${slug}`);
}

/** Replace every {{example:slug}} / {{example:slug|lang}} with a fenced block. */
async function spliceExamples(page, text) {
  const wanted = [...text.matchAll(/\{\{example:([a-z0-9-]+)(?:\|([a-z]+))?\}\}/g)];
  for (const [token, slug, lang] of wanted) {
    const code = await exampleCode(page, slug);
    text = text.replace(token, "```" + (lang || "cpp") + "\n" + code + "\n```");
  }
  return text;
}

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

const only = process.argv.slice(2).filter(a => !a.startsWith("--"));
for (const k of only)
  if (!BOARDS[k]) {
    console.error(`unknown board kind: ${k}`);
    process.exit(1);
  }

const browser = await launch();
const page = await browser.newPage({
  viewport: { width: 900, height: 900 },
  deviceScaleFactor: 2, // crisp board art
});
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(9000); // bundle + overlay register the elements

// Example sketches are read on their own page: the board page has the element
// injected into a wiped document.body, and navigating away would lose it.
const codePage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
if (process.env.VELXIO_SHOTS_EMAIL && process.env.VELXIO_SHOTS_PASSWORD) {
  await codePage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await codePage.evaluate(
    async c => {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(c),
        credentials: "include",
      });
    },
    {
      email: process.env.VELXIO_SHOTS_EMAIL,
      password: process.env.VELXIO_SHOTS_PASSWORD,
    }
  );
}

mkdirSync(IMG, { recursive: true });
if (!only.length) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let ok = 0;
const failed = [];
for (const [kind, def] of Object.entries(BOARDS)) {
  if (only.length && !only.includes(kind)) continue;
  try {
    const info = await page.evaluate(
      ({ tag, attrs }) => {
        if (!customElements.get(tag)) return { error: `tag ${tag} not defined` };
        document.body.innerHTML = "";
        document.body.style.background = "transparent";
        const el = document.createElement(tag);
        el.id = "shot-target";
        for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
        el.style.position = "absolute";
        el.style.left = "40px";
        el.style.top = "40px";
        document.body.appendChild(el);
        return { ok: true };
      },
      { tag: def.tag, attrs: def.attrs }
    );
    if (info.error) throw new Error(info.error);
    await page.waitForTimeout(1800); // upgrade + async SVG fetch

    const el = page.locator("#shot-target");
    const box = await el.boundingBox();
    if (!box || box.width < 10 || box.height < 10)
      throw new Error(`empty bounding box (${JSON.stringify(box)})`);
    await el.screenshot({ path: join(IMG, `${kind}.png`), omitBackground: true });

    const pins = await page.evaluate(() => {
      const el = document.getElementById("shot-target");
      const info = el?.pinInfo;
      return Array.isArray(info)
        ? info.map(p => ({
            name: p.name,
            signals: (p.signals || [])
              .map(s => s.type || s.signal || "")
              .filter(Boolean),
          }))
        : [];
    });

    let body = `The board as it appears on the Velxio canvas, with its full pin map
read live from the simulator (regenerated by \`scripts/gen-boards.mjs\`,
so it always matches what you can wire).

![${esc(def.title)} board](../../../../assets/docs/boards/${kind}.png)

**Family:** [${FAMILY_LABEL[def.family]}](/docs/boards/${def.family}/) ·
**Languages:** ${def.langs.join(", ")}
`;
    // Hand-written guide, spliced ABOVE the pin table: a reader opening a
    // board page wants to know how to run something on it, and a 40-row pin
    // dump between them and the tutorial buries it.
    const extras = join(EXTRAS, `${kind}.md`);
    if (existsSync(extras))
      body += `\n${await spliceExamples(codePage, readFileSync(extras, "utf8").trim())}\n`;

    if (pins.length) {
      // A grid, not a table: only the three wokwi AVR boards populate
      // pinInfo[].signals, so for the other 34 a two-column table was one dead
      // column of em-dashes and up to 85 rows of scrolling. Raw HTML carries no
      // blank lines — one would end the HTML block and markdown would re-parse
      // the rest of the list as text. Styles live in src/styles/custom.css.
      const anySignals = pins.some(p => p.signals.length);
      body += `\n## Pins (${pins.length})\n\n`;
      body += `<ul class="pin-grid${anySignals ? " has-signals" : ""}">\n`;
      for (const p of pins) {
        const sig = esc(p.signals.join(", "));
        body +=
          `<li><span class="pin-name">${esc(p.name)}</span>` +
          (sig ? `<span class="pin-signals">${sig}</span>` : "") +
          `</li>\n`;
      }
      body += `</ul>\n`;
    }
    body += `\nEvery pin above is clickable on the canvas — click one to start a
[wire](/docs/circuit-editor/wiring/). Board-level behavior, quirks and
example links live on the [family page](/docs/boards/${def.family}/).\n`;

    const fm = [
      "---",
      `title: "${esc(def.title).replaceAll('"', "'")}"`,
      `description: "Pinout and board reference for the ${esc(def.title)} in Velxio."`,
      ...(def.pro ? ["sidebar:", "  badge: PRO"] : []),
      "---",
      "",
      "<!-- Generated by scripts/gen-boards.mjs — do not edit by hand. -->",
      "",
    ].join("\n");
    await writeFile(join(OUT, `${kind}.md`), fm + body);
    ok++;
    console.log(`ok  ${kind} (${pins.length} pins)`);
  } catch (e) {
    failed.push(kind);
    console.error(`FAIL ${kind}: ${e.message}`);
  }
}
await browser.close();
console.log(`${ok} boards generated${failed.length ? `, failed: ${failed.join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
