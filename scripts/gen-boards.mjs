#!/usr/bin/env node
/**
 * Board reference generator: one page per board with the REAL board art
 * and the full pin map, both taken from the app's own web components.
 *
 *   node scripts/gen-boards.mjs
 *
 * For every board kind, the script instantiates the same custom element
 * the canvas uses (BoardOnCanvas's mapping, frozen below), screenshots it
 * at 2x into src/assets/docs/boards/<kind>.png, reads its live `pinInfo`,
 * and emits src/content/docs/boards/reference/<kind>.md. Fully
 * regenerated per run — never edit the output by hand.
 *
 * Env: VELXIO_BASE (default https://vstaging.moontero.com — must serve a
 * pro build so the overlay board elements are registered too).
 */
import { globSync, mkdirSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const IMG = join(HERE, "..", "src", "assets", "docs", "boards");
const OUT = join(HERE, "..", "src", "content", "docs", "boards", "reference");
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

  "stm32-bluepill":        { tag: "velxio-stm32-bluepill",        title: "STM32 Blue Pill (F103C8)", family: "stm32", langs: [AR] },
  "stm32-bluepill-f103cb": { tag: "velxio-stm32-bluepill-f103cb", title: "STM32 Blue Pill (F103CB)", family: "stm32", langs: [AR] },
  "stm32-blackpill":       { tag: "velxio-stm32-blackpill",       title: "STM32 Black Pill (F411CE)", family: "stm32", langs: [AR] },
  "stm32-blackpill-f401":  { tag: "velxio-stm32-blackpill-f401",  title: "STM32 Black Pill (F401CE)", family: "stm32", langs: [AR] },
  "stm32-f4-discovery":    { tag: "velxio-stm32-f4-discovery",    title: "STM32F4 Discovery", family: "stm32", langs: [AR] },
  "stm32-olimex-h405":     { tag: "velxio-stm32-olimex-h405",     title: "Olimex STM32-H405", family: "stm32", langs: [AR] },
  "stm32-netduino-plus2":  { tag: "velxio-stm32-netduino-plus2",  title: "Netduino Plus 2", family: "stm32", langs: [AR] },
  "stm32-netduino2":       { tag: "velxio-stm32-netduino2",       title: "Netduino 2", family: "stm32", langs: [AR] },

  "raspberry-pi-3": { tag: "velxio-raspberry-pi-3", title: "Raspberry Pi 3 (art shared with Zero/1/2)", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },
  "raspberry-pi-4": { tag: "velxio-raspberry-pi-4", title: "Raspberry Pi 4", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },
  "raspberry-pi-5": { tag: "velxio-raspberry-pi-5", title: "Raspberry Pi 5", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },

  "badger-2350":     { tag: "velxio-badger-2350",     title: "Pimoroni Badger 2350", family: "pro-boards", langs: [AR, MPY], pro: true },
  "cardputer-adv":   { tag: "velxio-cardputer-adv",   title: "M5 Cardputer ADV", family: "pro-boards", langs: ESP_LANGS, pro: true },
  "m5stack-core":    { tag: "velxio-m5stack-core",    title: "M5Stack Core", family: "pro-boards", langs: ESP_LANGS, pro: true },
  "esp32-c6":        { tag: "velxio-esp32-c6-devkit", title: "ESP32-C6 DevKit", family: "pro-boards", langs: ESP_LANGS, pro: true },
  "unihiker-m10":    { tag: "velxio-unihiker-m10",    title: "UNIHIKER M10", family: "raspberry-pi", langs: ["Python on Linux"], pro: true },
  "xiao-esp32s3-sense": { tag: "velxio-xiao-board", attrs: { variant: "esp32s3-sense" }, title: "XIAO ESP32S3 Sense", family: "pro-boards", langs: ESP_LANGS, pro: true },
  "xiao-esp32c6":       { tag: "velxio-xiao-board", attrs: { variant: "esp32c6" }, title: "XIAO ESP32C6", family: "pro-boards", langs: ESP_LANGS, pro: true },
  "xiao-rp2040":        { tag: "velxio-xiao-board", attrs: { variant: "rp2040" }, title: "XIAO RP2040", family: "pro-boards", langs: [AR, MPY], pro: true },
  "galactic-unicorn":       { tag: "velxio-galactic-unicorn",       title: "Pimoroni Galactic Unicorn", family: "pro-boards", langs: [AR, MPY], pro: true },
  "pimoroni-pico-plus-2w":  { tag: "velxio-pimoroni-pico-plus-2w",  title: "Pimoroni Pico Plus 2 W", family: "pro-boards", langs: [AR, MPY], pro: true },
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

const browser = await launch();
const page = await browser.newPage({
  viewport: { width: 900, height: 900 },
  deviceScaleFactor: 2, // crisp board art
});
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(9000); // bundle + overlay register the elements

mkdirSync(IMG, { recursive: true });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let ok = 0;
const failed = [];
for (const [kind, def] of Object.entries(BOARDS)) {
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
    if (pins.length) {
      body += `\n## Pins (${pins.length})\n\n| Pin | Signals |\n| --- | --- |\n`;
      for (const p of pins)
        body += `| **${esc(p.name)}** | ${esc(p.signals.join(", ")) || "—"} |\n`;
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
