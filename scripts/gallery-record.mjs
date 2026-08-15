#!/usr/bin/env node
/**
 * Gallery demo recorder — "basic mode": open a gallery example, run it,
 * film it working. One take per example, 1920x1080.
 *
 *   VELXIO_SHOTS_EMAIL=... VELXIO_SHOTS_PASSWORD=... \
 *     node scripts/gallery-record.mjs [slug ...]
 *
 * With no args it records every entry of GALLERY (below). Per example:
 *   promo/public/gallery/<slug>.webm          raw take
 *   promo/public/gallery/<slug>-circuit.png   whole circuit, framed+centered
 *   promo/public/gallery/<slug>.json          {title, board, runAt, liveAt, endAt}
 *
 * Already-recorded examples are skipped unless --force is passed, so a
 * crashed batch can simply be re-run.
 */
import { existsSync, globSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "promo", "public", "gallery");
const TMP = join(HERE, ".gallery-video");
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";
const VIEWPORT = { width: 1920, height: 1080 };
const RUN_FOOTAGE_MS = 14000; // seconds of "it works" footage per example
const COMPILE_TIMEOUT_MS = 360_000;

/** Curated demo set: one line per video, spread across board families. */
export const GALLERY = [
  "blink-led",
  "binary-counter-leds",
  "traffic-light",
  "uno-servo",
  "uno-7segment",
  "lcd-hello",
  "uno-oled-4pin-i2c",
  "uno-stepper-a4988",
  "m5stack-chain-rgb-rainbow",
  "mega-led-chase",
  "nano-fade",
  "attiny85-pwm-fade",
  "esp32-blink-led",
  "esp32-oled-4pin-i2c",
  "esp32-7segment",
  "esp32-joystick",
  "esp32s3-oled-i2c",
  "c3-oled-i2c",
  "c3-blink",
  "c6-oled-i2c",
  "pico-blink",
  "pico-7segment",
  "pico-servo",
  "stm32-bluepill-blink",
  "stm32-oled-4pin-i2c",
  "digital-decoder-2to4",
  "an-bjt-switch",
  "m5stack-core-m5-display",
  "cardputer-adv-m5-display",
  "badger-2350-badge",
];

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

/** Union bounding box of the circuit itself: every custom element on the
 *  canvas (wokwi-* / velxio-* parts and boards) plus the wire outline
 *  paths. Container divs are excluded by the dash-in-tagName rule and by
 *  the size sanity check. */
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
  return n ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0, n } : null;
})()`;

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const FORCE = process.argv.includes("--force");
const slugs = args.length ? args : GALLERY;

const index = JSON.parse(
  await readFile(join(HERE, "gallery-index.json"), "utf8")
);
const meta = Object.fromEntries(index.map(x => [x.slug, x]));

mkdirSync(OUT, { recursive: true });
const browser = await launch();
const results = [];

for (const slug of slugs) {
  const jsonPath = join(OUT, `${slug}.json`);
  if (!FORCE && existsSync(jsonPath)) {
    console.log(`skip ${slug} (already recorded)`);
    results.push({ slug, ok: true, skipped: true });
    continue;
  }
  rmSync(TMP, { recursive: true, force: true });
  const t0 = Date.now();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    // Render at 2x: the still crop comes out sharp enough to fill half a
    // 1080p frame, and the video frames are supersampled down to 1080p.
    deviceScaleFactor: 2,
    recordVideo: { dir: TMP, size: VIEWPORT },
  });
  const page = await context.newPage();
  const log = [];
  page.on("console", m => {
    if (/in-browser|guest crashed|sim|spice/i.test(m.text())) log.push(m.text());
  });
  let ok = false;
  let info = {};
  try {
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
    await page.waitForTimeout(7000);
    await page.evaluate(() => {
      for (const el of document.querySelectorAll(".velxio-news-overlay"))
        el.remove();
      document
        .querySelector('button[aria-label="Minimize chat"], button[title="Minimize"]')
        ?.click();
      const kill = () => {
        for (const el of document.querySelectorAll("div,button")) {
          const t = (el.textContent || "").trim();
          if (t === "Enjoying Velxio?" || t === "Star on GitHub") {
            let top = el;
            while (top.parentElement && getComputedStyle(top).position !== "fixed")
              top = top.parentElement;
            if (top !== document.body) top.remove();
            return;
          }
        }
      };
      kill();
      setInterval(kill, 1000);
    });
    // Circuit-only layout: the canvas gets the full width for both the
    // still and the footage.
    const circuitBtn = page.locator('button:has-text("Circuit")').first();
    if (await circuitBtn.count()) {
      await circuitBtn.click();
      await page.waitForTimeout(1200);
    }

    // Normalize the view (the zoom-level button is "Reset view"), then
    // only zoom OUT if the circuit overflows. Zooming in is not worth it:
    // the app anchors zoom on the canvas centre and drifts the circuit
    // off-screen — sharpness comes from deviceScaleFactor instead.
    const reset = page.locator("button.zoom-level");
    if (await reset.count()) {
      await reset.click();
      await page.waitForTimeout(700);
    }
    const zoomOut = page.locator('button[title="Zoom out"]');
    for (let i = 0; i < 6; i++) {
      const b = await page.evaluate(BBOX);
      if (!b) break;
      if (b.w < VIEWPORT.width * 0.9 && b.h < VIEWPORT.height * 0.82) break;
      if (!(await zoomOut.count())) break;
      await zoomOut.click();
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(600);
    // Hide the SPICE badge for the still (it floats over the circuit and
    // is noise in a promo card); restore it before filming.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("div,span")) {
        if (/^DC\s*SPICE .* nets/.test((el.textContent || "").trim())) {
          el.dataset.vxHidden = "1";
          el.style.visibility = "hidden";
          break;
        }
      }
    });
    const box = await page.evaluate(BBOX);
    const pad = 46;
    const clip = box
      ? {
          x: Math.max(0, Math.floor(box.x - pad)),
          y: Math.max(60, Math.floor(box.y - pad)),
          width: Math.min(
            VIEWPORT.width - Math.max(0, Math.floor(box.x - pad)),
            Math.ceil(box.w + 2 * pad)
          ),
          height: Math.min(
            VIEWPORT.height - Math.max(60, Math.floor(box.y - pad)),
            Math.ceil(box.h + 2 * pad)
          ),
        }
      : undefined;
    await page.screenshot({ path: join(OUT, `${slug}-circuit.png`), clip });
    await page.evaluate(() => {
      const el = document.querySelector('[data-vx-hidden="1"]');
      if (el) el.style.visibility = "";
    });

    // Run and wait for the sim (digital/analog examples have no firmware
    // and go live immediately).
    const runAt = Date.now() - t0;
    // Board-less examples (Digital / Analog categories) have no firmware:
    // the SPICE engine drives them continuously and Run stays disabled.
    const runBtn = page.locator('button[title*="Run" i]').first();
    const boardless = await runBtn.isDisabled().catch(() => false);
    let live = boardless;
    if (!boardless) {
      await runBtn.click();
      const anyway = page.locator('button:has-text("Run anyway")');
      if (await anyway.count()) await anyway.first().click();
    }
    const tRun = Date.now();
    while (!live && Date.now() - tRun < COMPILE_TIMEOUT_MS) {
      if (log.some(l => /guest crashed/i.test(l))) break;
      if (log.some(l => l.includes("in-browser"))) {
        live = true;
        break;
      }
      const running = await page.evaluate(
        () => !!document.querySelector('button[title="Stop"]:not([disabled])')
      );
      if (running && Date.now() - tRun > 12000) {
        live = true;
        break;
      }
      await page.waitForTimeout(1500);
    }
    const liveAt = Date.now() - t0;
    await page.waitForTimeout(RUN_FOOTAGE_MS);
    const endAt = Date.now() - t0;
    info = {
      slug,
      title: meta[slug]?.title || slug,
      board: meta[slug]?.board || "",
      description: meta[slug]?.description || "",
      runAt,
      liveAt,
      endAt,
      live,
      crashed: log.some(l => /guest crashed/i.test(l)),
    };
    ok = live && !info.crashed;
  } catch (e) {
    info = { slug, error: String(e).slice(0, 200) };
    console.error(`  FAIL ${slug}: ${info.error}`);
  }
  await context.close();
  const webm = globSync(`${TMP}/*.webm`)[0];
  if (ok && webm) {
    cpSync(webm, join(OUT, `${slug}.webm`));
    await writeFile(jsonPath, JSON.stringify(info, null, 1));
    console.log(
      `ok   ${slug} — live at ${(info.liveAt / 1000).toFixed(0)}s, take ${(info.endAt / 1000).toFixed(0)}s`
    );
  } else {
    console.log(`FAIL ${slug} ${JSON.stringify(info).slice(0, 140)}`);
  }
  rmSync(TMP, { recursive: true, force: true });
  results.push({ slug, ok });
}
await browser.close();
const good = results.filter(r => r.ok).length;
console.log(`\n${good}/${results.length} usable takes`);
