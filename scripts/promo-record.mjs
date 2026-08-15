#!/usr/bin/env node
/**
 * Promo demo recorder — phase 1 of the promo video pipeline.
 *
 *   node scripts/promo-record.mjs
 *
 * Records the full "build your first circuit" flow at 1280x720 with a
 * visible injected cursor: open editor -> starter picker -> choose ESP32
 * -> Add Component -> search "led" -> place it -> wire GPIO->A and
 * GND->C -> Run -> LED blinks. Every key action logs
 * {t, label, x, y} (video-relative ms) to scripts/promo-events.json so
 * promo-post.mjs can cut zoom-ins on each moment and splice out the
 * compile wait.
 *
 * Output: scripts/promo-raw.webm + scripts/promo-events.json
 */
import { globSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, ".promo-video");
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";

async function launch() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    const c = globSync(
      `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`
    )
      .sort()
      .reverse();
    if (!c.length) throw new Error("no chromium");
    return chromium.launch({ headless: true, executablePath: c[0] });
  }
}

rmSync(TMP, { recursive: true, force: true });
const browser = await launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: TMP, size: { width: 1280, height: 720 } },
});

// Visible cursor + click ripple, survives navigations.
await context.addInitScript(() => {
  const mk = () => {
    if (document.getElementById("vx-cursor")) return;
    // macOS-style arrow cursor. Hotspot math from the saas-product-demo
    // skill: in the 24x24 viewBox the TIP sits at (4,3), so at render
    // width W the element must be shifted by (-4*W/24, -3*W/24) for the
    // tip to be the click point.
    const W = 26;
    const c = document.createElement("div");
    c.id = "vx-cursor";
    c.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483647;" +
      `width:${W}px;height:${W}px;left:-60px;top:-60px;` +
      `margin-left:${(-4 * W) / 24}px;margin-top:${(-3 * W) / 24}px;` +
      "filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));transition:none;";
    c.innerHTML =
      '<svg width="' + W + '" height="' + W + '" viewBox="0 0 24 24">' +
      '<path d="M4 3 L4 19 L8.5 15.5 L11 21 L13.5 20 L11 14.5 L17 14.5 Z"' +
      ' fill="#ffffff" stroke="#111111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
    window.addEventListener(
      "mousemove",
      e => {
        c.style.left = e.clientX + "px";
        c.style.top = e.clientY + "px";
      },
      true
    );
    window.addEventListener(
      "mousedown",
      e => {
        const r = document.createElement("div");
        r.style.cssText =
          "position:fixed;width:14px;height:14px;border-radius:50%;" +
          "border:3px solid #0071e3;pointer-events:none;z-index:2147483646;" +
          `left:${e.clientX}px;top:${e.clientY}px;transform:translate(-50%,-50%);` +
          "animation:vxripple .5s ease-out forwards;";
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 600);
      },
      true
    );
    const st = document.createElement("style");
    st.textContent =
      "@keyframes vxripple{to{width:64px;height:64px;opacity:0}}";
    document.head.appendChild(st);
    // The "Enjoying Velxio?" GitHub-star toast photobombs long takes.
    setInterval(() => {
      for (const el of document.querySelectorAll("div,h1,h2,h3,h4,p,span,button")) {
        const txt = (el.textContent || "").trim();
        if (txt === "Enjoying Velxio?" || txt === "Star on GitHub") {
          let top = el;
          while (
            top.parentElement &&
            getComputedStyle(top).position !== "fixed"
          )
            top = top.parentElement;
          if (top !== document.body) top.remove();
          break;
        }
      }
    }, 1000);
  };
  if (document.readyState !== "loading") mk();
  else document.addEventListener("DOMContentLoaded", mk);
});

const page = await context.newPage();
const simLog = [];
page.on("console", m => {
  if (/in-browser|guest crashed/i.test(m.text())) simLog.push(m.text());
});

const T0 = Date.now();
const events = [];
let cursor = { x: 640, y: 360 };
const mark = (label, x = cursor.x, y = cursor.y) => {
  events.push({ t: Date.now() - T0, label, x: Math.round(x), y: Math.round(y) });
  console.log(`  ${((Date.now() - T0) / 1000).toFixed(1)}s ${label}`);
};

/** Smooth move + click with the fake cursor. */
async function clickAt(x, y, label, { pause = 900 } = {}) {
  await page.mouse.move(x, y, { steps: 30 });
  cursor = { x, y };
  await page.waitForTimeout(250);
  if (label) mark(label, x, y);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(pause);
}
async function clickEl(locator, label, opts) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const box = await locator.boundingBox();
  if (!box) throw new Error(`no box for ${label}`);
  await clickAt(box.x + box.width / 2, box.y + box.height / 2, label, opts);
}

// ── the flow ─────────────────────────────────────────────────────────────────
// Anonymous / is the marketing landing; sign in first so / is the editor.
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
await page.goto(`${BASE}/editor`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
await page.evaluate(() => {
  for (const el of document.querySelectorAll(".velxio-news-overlay")) el.remove();
  // chat minimized from frame one — the modal overlay would swallow a real
  // click, so fire the React handler directly
  document
    .querySelector('button[aria-label="Minimize chat"], button[title="Minimize"]')
    ?.click();
});
await page.waitForTimeout(800);
mark("start");

// 1. The starter picker opens by itself on a fresh /editor visit; if it
//    didn't, open it from the workspace panel. Start from BLANK so the
//    demo genuinely builds the circuit from nothing.
const overlay = page.locator(".new-project-overlay");
if (!(await overlay.count())) {
  await clickEl(page.locator('button[title^="New workspace"]'), "open-templates", { pause: 1300 });
}
await clickEl(overlay.getByText("Blank project").first(), "choose-blank", { pause: 2000 });

/** Add a part via the picker: exact-name card click. */
async function addPart(query, cardText, label, pause = 1600) {
  await clickEl(page.locator('button[title="Add Component"]'), `open-picker-${label}`, { pause: 1200 });
  const search = page.locator('input[placeholder*="Search" i]');
  await search.click();
  // the picker keeps the previous query — clear before typing
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(query, { delay: 140 });
  mark(`search-${label}`);
  // Exact card-name lookup, scoped to the picker modal (a generic text
  // scan can hit Monaco tokens behind the overlay). The result list is
  // debounced, so poll for up to 5 s.
  let pt = null;
  for (let i = 0; i < 10 && !pt; i++) {
    await page.waitForTimeout(500);
    pt = await page.evaluate(title => {
      for (const el of document.querySelectorAll(
        ".component-picker-modal .card-name"
      )) {
        if ((el.textContent || "").trim() !== title) continue;
        const r = (el.closest(".component-card") || el).getBoundingClientRect();
        if (r.width < 5 || r.height < 5) continue;
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }
      return null;
    }, cardText);
  }
  if (!pt) throw new Error(`card not found: ${cardText}`);
  await clickAt(pt.x, pt.y, `add-${label}`, { pause });
}

/** Drag an element's center to a point. */
async function dragTo(selector, to, label) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no box for drag ${selector}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 30 });
  await page.mouse.up();
  cursor = to;
  mark(label, to.x, to.y);
  await page.waitForTimeout(900);
}

// 2. Board, series resistor, LED. Boards don't drag from their body,
//    so leave the ESP32 where the picker drops it and place the small
//    parts RELATIVE to its live position.
await addPart("esp32", "ESP32 DevKit V1", "esp32", 2200);
const boardBox = await page.locator("velxio-esp32").first().boundingBox();
if (!boardBox) throw new Error("no board box");
const bx = boardBox.x + boardBox.width;
const by = boardBox.y;
mark("place-esp32", boardBox.x + boardBox.width / 2, by + boardBox.height / 2);
// The picker drops the board near the canvas' right edge — the open
// space is to its LEFT, so the small parts go there.
await addPart("resistor", "Resistor 220 Ω", "resistor", 1400);
await dragTo("wokwi-resistor", { x: Math.max(boardBox.x - 170, 640), y: by + 100 }, "place-resistor");
await page.evaluate(() => {
  const el = document.querySelector("wokwi-resistor");
  const r = el.getBoundingClientRect();
  el.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: Math.min(r.x + r.width / 2, 700),
      clientY: Math.min(r.y + r.height / 2, 380),
    })
  );
});
await page.waitForTimeout(900);
await clickEl(page.locator('button:has-text("Rotate")').first(), "rotate-resistor", { pause: 500 });
await page.keyboard.press("Escape");
await page.waitForTimeout(600);

await addPart("led", "LED", "led", 1600);
await dragTo("wokwi-led", { x: Math.max(boardBox.x - 300, 600), y: by + 95 }, "place-led");

/** Absolute position of a named pin: use the app's own pin-overlay divs
 *  ([data-pin-overlay][title=name]) — they are rotation-aware, unlike
 *  computing from pinInfo offsets. Titles collide across parts (board
 *  pin "2" vs resistor "2"), so pick the candidate nearest the host. */
async function pinPoint(selector, pinName) {
  // hover the part first in case overlays render lazily
  const host = page.locator(selector).first();
  const hb = await host.boundingBox();
  if (hb) await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2, { steps: 5 });
  await page.waitForTimeout(200);
  return page.evaluate(
    ({ selector, pinName }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const hr = el.getBoundingClientRect();
      const hx = hr.x + hr.width / 2;
      const hy = hr.y + hr.height / 2;
      let best = null;
      let bestD = Infinity;
      for (const p of document.querySelectorAll(
        `[data-pin-overlay="true"][title="${pinName}"]`
      )) {
        const r = p.getBoundingClientRect();
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        const d = (cx - hx) ** 2 + (cy - hy) ** 2;
        if (d < bestD) {
          bestD = d;
          best = { x: cx, y: cy };
        }
      }
      return best;
    },
    { selector, pinName }
  );
}

// 4. Wire GPIO2 -> R.1, R.2 -> LED A, GND -> LED C
const gpio2 = await pinPoint("velxio-esp32", "2");
const r1 = await pinPoint("wokwi-resistor", "1");
const r2 = await pinPoint("wokwi-resistor", "2");
const a = await pinPoint("wokwi-led", "A");
const gnd = await pinPoint("velxio-esp32", "GND");
const c = await pinPoint("wokwi-led", "C");
if (!gpio2 || !r1 || !r2 || !a || !gnd || !c)
  throw new Error("some pin missing for wiring");

const wireCount = () =>
  page.evaluate(
    // every wire renders an outline path with this exact stroke
    () => document.querySelectorAll('path[stroke="#1a1a1a"]').length
  );

/** Click two pins and confirm a wire actually landed; retry once. */
async function wire(p1, p2, label, endPause) {
  const before = await wireCount();
  await clickAt(p1.x, p1.y, `wire-start-${label}`, { pause: 500 });
  await clickAt(p2.x, p2.y, `wire-end-${label}`, { pause: endPause });
  if ((await wireCount()) > before) return;
  console.log(`  ! wire ${label} did not land, retrying`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await clickAt(p1.x, p1.y, null, { pause: 450 });
  await clickAt(p2.x, p2.y, null, { pause: endPause });
  if ((await wireCount()) <= before) throw new Error(`wire ${label} failed twice`);
}

await wire(gpio2, r1, "gpio2-r1", 800);
await wire(r2, a, "r2-a", 900);
await wire(gnd, c, "gnd-c", 1100);

// 5. The code: click into the editor, then drop in a minimal blink sketch
//    (Monaco's auto-closing brackets mangle literal typing, so type the
//    first line for the camera and set the rest through the model).
await clickAt(380, 200, "focus-code", { pause: 400 });
// the blank template ships a default sketch — wipe it on camera, then type
await page.keyboard.press("Control+a");
await page.keyboard.type("// Blink an LED on GPIO 2", { delay: 45 });
await page.waitForTimeout(600);
await page.evaluate(() => {
  const m = window.monaco?.editor?.getModels?.()[0];
  if (m)
    m.setValue(
      [
        "// Blink an LED on GPIO 2",
        "void setup() {",
        "  pinMode(2, OUTPUT);",
        "}",
        "",
        "void loop() {",
        "  digitalWrite(2, HIGH);",
        "  delay(300);",
        "  digitalWrite(2, LOW);",
        "  delay(300);",
        "}",
      ].join("\n")
    );
});
mark("code-set");
await page.waitForTimeout(1400);

// 6. Run
await clickEl(page.locator('button[title*="Run" i]').first(), "run", { pause: 300 });
await page.mouse.move(700, 620, { steps: 15 });
cursor = { x: 700, y: 620 };
await page.waitForTimeout(1200);
const verifDialog = page.locator('text="Circuit verification"');
if (await verifDialog.count()) {
  await page.screenshot({ path: join(HERE, "promo-verif-debug.png") });
  throw new Error("circuit verification blocked Run — wiring is wrong, see promo-verif-debug.png");
}
const t0 = Date.now();
while (
  Date.now() - t0 < 300_000 &&
  !simLog.some(l => l.includes("in-browser")) &&
  !simLog.some(l => /guest crashed/i.test(l))
) {
  await page.waitForTimeout(1500);
}
mark(
  simLog.some(l => /crashed/i.test(l))
    ? "sim-crashed"
    : simLog.some(l => l.includes("in-browser"))
      ? "sim-started"
      : "sim-timeout"
);
await page.waitForTimeout(12000); // blinking footage
mark("end");

await page.screenshot({ path: join(HERE, "promo-final-frame.png") });
await context.close();
await browser.close();

const webm = globSync(`${TMP}/*.webm`)[0];
cpSync(webm, join(HERE, "promo-raw.webm"));
rmSync(TMP, { recursive: true, force: true });
await writeFile(join(HERE, "promo-events.json"), JSON.stringify(events, null, 2));
console.log(`raw video: scripts/promo-raw.webm, ${events.length} events`);
