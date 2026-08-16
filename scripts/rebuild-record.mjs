#!/usr/bin/env node
/**
 * Rebuild recorder — films a gallery example being BUILT FROM SCRATCH,
 * the way media/velxio-demo.mp4 does it: blank project, add the board,
 * add each part from the picker, wire pin to pin, write the sketch, Run,
 * and watch the emulation with the serial monitor open.
 *
 *   VELXIO_SHOTS_EMAIL=... VELXIO_SHOTS_PASSWORD=... \
 *     node scripts/rebuild-record.mjs [slug ...] [--force]
 *
 * The gallery example is only the RECIPE (parts, wires, sketch): recipes
 * are extracted from the app's own example data by scripts/dump-recipes.mjs
 * into scripts/recipes.json.
 *
 * Per example, into promo/public/rebuild/:
 *   <slug>.webm   take · <slug>-circuit.png  finished circuit · <slug>.json  beats
 */
import { existsSync, globSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "promo", "public", "rebuild");
const TMP = join(HERE, ".rebuild-video");
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";
const VIEWPORT = { width: 1920, height: 1080 };
const RUN_FOOTAGE_MS = 13000;
const COMPILE_TIMEOUT_MS = 360_000;

/** Board tag -> picker card name (boards are added like any other part). */
const BOARD_CARD = {
  "wokwi-arduino-uno": "Arduino Uno",
  "wokwi-arduino-nano": "Arduino Nano",
  "wokwi-arduino-mega": "Arduino Mega 2560",
  "velxio-attiny85": "ATtiny85",
  "velxio-esp32": "ESP32 DevKit V1",
  "velxio-pi-pico-w": "Raspberry Pi Pico",
};
/** boardType (recipe field) -> picker card name, when the board is not a component. */
const BOARD_BY_TYPE = {
  "arduino-uno": "Arduino Uno",
  "arduino-nano": "Arduino Nano",
  "arduino-mega": "Arduino Mega 2560",
  attiny85: "ATtiny85",
  esp32: "ESP32 DevKit V1",
  "esp32-s3": "ESP32-S3 DevKit",
  "esp32-c3": "ESP32-C3 DevKit",
  "raspberry-pi-pico": "Raspberry Pi Pico",
  "pi-pico-w": "Raspberry Pi Pico W",
};

const CURSOR_SCRIPT = () => {
  const mk = () => {
    if (document.getElementById("vx-cursor")) return;
    const W = 30;
    const c = document.createElement("div");
    c.id = "vx-cursor";
    c.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483647;" +
      `width:${W}px;height:${W}px;left:-80px;top:-80px;` +
      `margin-left:${(-4 * W) / 24}px;margin-top:${(-3 * W) / 24}px;` +
      "filter:drop-shadow(0 2px 3px rgba(0,0,0,.7));";
    c.innerHTML =
      `<svg width="${W}" height="${W}" viewBox="0 0 24 24"><path d="M4 3 L4 19 L8.5 15.5 L11 21 L13.5 20 L11 14.5 L17 14.5 Z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
    document.body.appendChild(c);
    addEventListener(
      "mousemove",
      e => {
        c.style.left = e.clientX + "px";
        c.style.top = e.clientY + "px";
      },
      true
    );
    addEventListener(
      "mousedown",
      e => {
        const r = document.createElement("div");
        r.style.cssText =
          "position:fixed;width:16px;height:16px;border-radius:50%;border:3px solid #0071e3;" +
          `pointer-events:none;z-index:2147483646;left:${e.clientX}px;top:${e.clientY}px;` +
          "transform:translate(-50%,-50%);animation:vxr .55s ease-out forwards;";
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 700);
      },
      true
    );
    const st = document.createElement("style");
    st.textContent = "@keyframes vxr{to{width:72px;height:72px;opacity:0}}";
    document.head.appendChild(st);
    setInterval(() => {
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
    }, 1000);
  };
  if (document.readyState !== "loading") mk();
  else addEventListener("DOMContentLoaded", mk);
};

const BBOX = `(() => {
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,n=0;
  const eat=r=>{ if(!r||r.width<3||r.height<3)return;
    if(r.width>innerWidth*0.85||r.height>innerHeight*0.85)return;
    if(r.bottom<90||r.top>innerHeight-20)return;
    x0=Math.min(x0,r.left);y0=Math.min(y0,r.top);x1=Math.max(x1,r.right);y1=Math.max(y1,r.bottom);n++; };
  for (const el of document.querySelectorAll("*")) {
    if(!el.tagName.includes("-"))continue;
    if(/^(velxio-agent|velxio-news)/i.test(el.tagName))continue;
    eat(el.getBoundingClientRect());
  }
  for (const p of document.querySelectorAll('path[stroke="#1a1a1a"]')) eat(p.getBoundingClientRect());
  return n?{x:x0,y:y0,w:x1-x0,h:y1-y0}:null;
})()`;

const VERIFIER_PROBE = `[...document.querySelectorAll("*")]
  .filter(e => !e.childElementCount)
  .map(e => (e.textContent || "").trim())
  .filter(t => /burnt out|above the 20 mA|is shorted|carrying [\\d.]+e\\+\\d+ A/i.test(t))
  .slice(0, 4)`;

async function launch() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    const c = globSync(
      `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`
    )
      .sort()
      .reverse();
    return chromium.launch({ headless: true, executablePath: c[0] });
  }
}

const recipes = JSON.parse(await readFile(join(HERE, "recipes.json"), "utf8"));
const catalog = JSON.parse(await readFile(join(HERE, "catalog.json"), "utf8"));
const cardByTag = Object.fromEntries(catalog.map(c => [c.tagName, c.name]));

const FORCE = process.argv.includes("--force");
const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const slugs = args.length ? args : recipes.map(r => r.id);

mkdirSync(OUT, { recursive: true });
const browser = await launch();
const results = [];

for (const slug of slugs) {
  const recipe = recipes.find(r => r.id === slug);
  if (!recipe) {
    console.log(`FAIL ${slug} — no recipe`);
    results.push({ slug, ok: false });
    continue;
  }
  const jsonPath = join(OUT, `${slug}.json`);
  if (!FORCE && existsSync(jsonPath)) {
    console.log(`skip ${slug}`);
    results.push({ slug, ok: true });
    continue;
  }

  rmSync(TMP, { recursive: true, force: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    // deviceScaleFactor stays 1: at 2 the pin hit areas do not respond to
    // synthetic clicks and every wire silently misses.
    recordVideo: { dir: TMP, size: VIEWPORT },
  });
  await context.addInitScript(CURSOR_SCRIPT);
  const page = await context.newPage();
  const simLog = [];
  page.on("console", m => {
    if (/in-browser|guest crashed/i.test(m.text())) simLog.push(m.text());
  });

  const T0 = Date.now();
  const beats = [];
  const mark = (label, extra = {}) =>
    beats.push({ label, t: Date.now() - T0, ...extra });
  const moveTo = async (x, y, steps = 24) => {
    await page.mouse.move(x, y, { steps });
    await page.waitForTimeout(180);
  };
  const clickAt = async (x, y, label, pause = 700, extra) => {
    await moveTo(x, y);
    if (label) mark(label, { x: Math.round(x), y: Math.round(y), ...extra });
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(pause);
  };
  const clickEl = async (loc, label, pause) => {
    const b = await loc.boundingBox({ timeout: 12000 }).catch(() => {
      throw new Error(`element not found: ${label}`);
    });
    if (!b) throw new Error(`no box for ${label}`);
    await clickAt(b.x + b.width / 2, b.y + b.height / 2, label, pause);
  };

  /** Click a pin the way a user does: park the pointer on it, wait until
   *  the pin's own hit area is actually under the cursor (the overlays
   *  are rendered on hover, so clicking a "known" coordinate too early
   *  lands on the canvas and only adds a waypoint), then press. */
  /** Click a pin the way a user does — pointer on the part, press on the
   *  pin — but keep the real mouse on the part BODY while pressing.
   *
   *  A part's pin hit areas are mounted only while the part is hovered,
   *  and they sit on its outline: the moment the pointer reaches the pin
   *  they unmount, the press lands on the canvas and the app records a
   *  waypoint instead of a connection. Boards are big enough that this
   *  never shows; every small part failed 100% of the time.
   *
   *  So: hover the part (pins mount), park the VISIBLE cursor on the pin
   *  for the camera, and deliver the press to the pin element itself. */
  const wirePin = async (hostId, pinName, towards) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const c = await page.evaluate(id => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, hostId);
      if (!c) return null;
      await page.mouse.move(c.x, c.y, { steps: 12 });
      await page.waitForTimeout(320);
      const hit = await page.evaluate(
        ({ id, pinName, towards }) => {
          const norm = t => String(t).replace(/[.\s]?\d+$/, "");
          const host = document.getElementById(id);
          if (!host) return null;
          const h = host.getBoundingClientRect();
          const target = towards || { x: h.x + h.width / 2, y: h.y + h.height / 2 };
          const pad = 44;
          let best = null;
          let bestD = Infinity;
          for (const o of document.querySelectorAll('[data-pin-overlay="true"]')) {
            const t = o.getAttribute("title") || "";
            if (t !== pinName && norm(t) !== pinName) continue;
            const r = o.getBoundingClientRect();
            const cx = r.x + r.width / 2;
            const cy = r.y + r.height / 2;
            if (
              cx < h.x - pad || cx > h.right + pad ||
              cy < h.y - pad || cy > h.bottom + pad
            )
              continue;
            const d = (cx - target.x) ** 2 + (cy - target.y) ** 2;
            if (d < bestD) {
              bestD = d;
              best = { el: o, x: cx, y: cy };
            }
          }
          if (!best) return null;
          // put the on-camera pointer on the pin
          const cur = document.getElementById("vx-cursor");
          if (cur) {
            cur.style.left = best.x + "px";
            cur.style.top = best.y + "px";
          }
          const opts = {
            bubbles: true,
            cancelable: true,
            clientX: best.x,
            clientY: best.y,
          };
          best.el.dispatchEvent(new MouseEvent("mousedown", opts));
          best.el.dispatchEvent(new MouseEvent("mouseup", opts));
          best.el.dispatchEvent(new MouseEvent("click", opts));
          return { x: best.x, y: best.y };
        },
        { id: hostId, pinName, towards: towards || null }
      );
      if (hit) {
        await page.waitForTimeout(430);
        return hit;
      }
      await page.waitForTimeout(250);
    }
    return null;
  };


  /** Custom-element ids currently on the canvas. */
  const domIds = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("*")]
        .filter(e => e.tagName.includes("-") && e.id && !/^velxio-(agent|news)/i.test(e.tagName))
        .map(e => e.id)
    );

  /** Add a catalog part by exact card name; returns the new element id. */
  async function addPart(cardName, label) {
    const before = new Set(await domIds());
    await clickEl(page.locator('button[title="Add Component"]'), `picker-${label}`, 900);
    const search = page.locator('input[placeholder*="Search" i]');
    await search.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");
    await page.keyboard.type(cardName.split("(")[0].trim().slice(0, 22), { delay: 90 });
    let pt = null;
    for (let i = 0; i < 10 && !pt; i++) {
      await page.waitForTimeout(450);
      pt = await page.evaluate(name => {
        for (const el of document.querySelectorAll(".component-picker-modal .card-name")) {
          if ((el.textContent || "").trim() !== name) continue;
          const r = (el.closest(".component-card") || el).getBoundingClientRect();
          if (r.width > 5) return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }
        return null;
      }, cardName);
    }
    if (!pt) throw new Error(`card not found: ${cardName}`);
    await clickAt(pt.x, pt.y, `add-${label}`, 1400, { part: cardName });
    const after = await domIds();
    const added = after.find(id => !before.has(id));
    if (!added) throw new Error(`part did not land: ${cardName}`);
    return added;
  }

  /** Drag an element (by dom id) to a screen point. */
  async function dragTo(domId, x, y, label) {
    const b = await page.evaluate(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, domId);
    if (!b) return;
    await page.mouse.move(b.x, b.y, { steps: 14 });
    await page.mouse.down();
    await page.mouse.move(x, y, { steps: 26 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    if (label) mark(label, { x: Math.round(x), y: Math.round(y) });
  }

  /** Screen point of a named pin of a component (pins render on hover).
   *  Recipes name pins plainly ("GND", "5V", "3V3") while boards expose
   *  numbered duplicates ("GND.1", "GND2", "3V3.1"), so matching is
   *  tolerant; among the candidates that belong to THIS component, the
   *  one nearest the other endpoint wins — shorter, tidier wires and no
   *  ambiguity between a board's several grounds. */
  async function pinPoint(domId, pinName, towards) {
    const host = await page.evaluate(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
    }, domId);
    if (!host) return null;
    // Where the pin SHOULD be, from the element's own pinInfo: hovering
    // there makes its overlay appear even on parts too small to hover by
    // their centre (a resistor is 11 px tall).
    const guess = await page.evaluate(
      ({ id, pinName }) => {
        const el = document.getElementById(id);
        const info = el?.pinInfo;
        if (!Array.isArray(info)) return null;
        const norm = t => String(t).replace(/[.\s]?\d+$/, "");
        const pin =
          info.find(p => p.name === pinName) ||
          info.find(p => norm(p.name) === pinName);
        if (!pin) return null;
        const r = el.getBoundingClientRect();
        const scale = el.offsetWidth ? r.width / el.offsetWidth : 1;
        return { x: r.x + pin.x * scale, y: r.y + pin.y * scale };
      },
      { id: domId, pinName }
    );
    await page.mouse.move(guess ? guess.x : host.cx, guess ? guess.y : host.cy, { steps: 8 });
    await page.waitForTimeout(280);
    const near = guess
      ? await page.evaluate(g => {
          let best = null;
          let bestD = 24 * 24;
          for (const p of document.querySelectorAll('[data-pin-overlay="true"]')) {
            const r = p.getBoundingClientRect();
            const cx = r.x + r.width / 2;
            const cy = r.y + r.height / 2;
            const d = (cx - g.x) ** 2 + (cy - g.y) ** 2;
            if (d < bestD) {
              bestD = d;
              best = { x: cx, y: cy };
            }
          }
          return best;
        }, guess)
      : null;
    if (near) return near;
    if (guess) return guess;
    return page.evaluate(
      ({ host, pinName, towards }) => {
        const norm = t => t.replace(/[.\s]?\d+$/, "");
        const target = towards || { x: host.cx, y: host.cy };
        const pad = 46;
        let best = null;
        let bestD = Infinity;
        for (const p of document.querySelectorAll('[data-pin-overlay="true"]')) {
          const title = p.getAttribute("title") || "";
          if (title !== pinName && norm(title) !== pinName) continue;
          const r = p.getBoundingClientRect();
          const cx = r.x + r.width / 2;
          const cy = r.y + r.height / 2;
          // must belong to this component (its overlay sits on its body)
          if (
            cx < host.x - pad || cx > host.x + host.w + pad ||
            cy < host.y - pad || cy > host.y + host.h + pad
          )
            continue;
          const d = (cx - target.x) ** 2 + (cy - target.y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = { x: cx, y: cy };
          }
        }
        return best;
      },
      { host, pinName, towards: towards || null }
    );
  }

  const wireCount = () =>
    page.evaluate(() => document.querySelectorAll('path[stroke="#1a1a1a"]').length);

  let ok = false;
  let out = {};
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
    await page.goto(`${BASE}/editor`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);
    await page.evaluate(() => {
      for (const el of document.querySelectorAll(".velxio-news-overlay")) el.remove();
      document
        .querySelector('button[aria-label="Minimize chat"], button[title="Minimize"]')
        ?.click();
    });
    mark("start");

    // blank canvas
    const overlay = page.locator(".new-project-overlay");
    // a cold editor load can take a few seconds to raise the starter modal
    for (let i = 0; i < 14 && !(await overlay.count()); i++)
      await page.waitForTimeout(500);
    if (!(await overlay.count()))
      await clickEl(page.locator('button[title^="New workspace"]'), "open-templates", 1100);
    await clickEl(overlay.getByText("Blank project").first(), "blank", 1800);

    // board first
    const boardComp = (recipe.components || []).find(c => BOARD_CARD[c.type]);
    const boardCard = boardComp
      ? BOARD_CARD[boardComp.type]
      : BOARD_BY_TYPE[recipe.boardType];
    if (!boardCard) throw new Error(`no board card for ${recipe.boardType}`);
    const boardId = await addPart(boardCard, "board");

    // Layout. Recipe coordinates pack parts tighter than reads on video,
    // and in the Both layout the canvas is only the right-hand pane — so
    // ignore the recipe geometry and lay the circuit out for the camera:
    // board at the bottom-left of the pane, parts on a grid above it with
    // real gaps, ordered as the recipe lists them.
    const pane = await page.evaluate(() => {
      let best = null;
      for (const el of document.querySelectorAll("div")) {
        const c = el.className?.toString?.() || "";
        if (!/canvas/i.test(c)) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 500 && r.height > 400 && (!best || r.width > best.w))
          best = { x: r.x, y: Math.max(r.y, 90), w: r.width, h: r.height };
      }
      return (
        best || {
          x: innerWidth / 2,
          y: 90,
          w: innerWidth / 2,
          h: innerHeight - 150,
        }
      );
    });
    const others = (recipe.components || []).filter(c => !BOARD_CARD[c.type]);
    const cols = others.length <= 2 ? 1 : others.length <= 6 ? 2 : 3;
    const rows = Math.max(1, Math.ceil(others.length / cols));
    // Gaps big enough that nothing overlaps, small enough that the whole
    // circuit still reads in one frame (wires stay short).
    const gapX = Math.min(300, Math.max(180, (pane.w - 260) / cols));
    const gapY = Math.min(170, Math.max(120, (pane.h - 420) / rows));
    const top = pane.y + 120;
    const slotFor = i => ({
      x: pane.x + 200 + (i % cols) * gapX,
      y: top + Math.floor(i / cols) * gapY,
    });
    // the board sits just below the last row of parts
    await dragTo(
      boardId,
      pane.x + 260 + ((cols - 1) * gapX) / 2,
      Math.min(top + (rows - 1) * gapY + 195, pane.y + pane.h - 150),
      "place-board"
    );

    const idMap = {};
    if (boardComp) idMap[boardComp.id] = boardId;
    else idMap.__board = boardId;
    for (const [i, c] of others.entries()) {
      const card = cardByTag[c.type];
      if (!card) throw new Error(`no catalog card for ${c.type}`);
      const id = await addPart(card, c.id);
      idMap[c.id] = id;
      const p = slotFor(i);
      await dragTo(id, p.x, p.y, `place-${c.id}`);
    }

    // NOTE: wiring must happen at 1:1. Zooming the canvas first looked
    // like a good idea (the pins separate) but the pin hit areas stop
    // responding — every click misses and the circuit ends up empty.
    // wires
    let wired = 0;
    for (const w of recipe.wires || []) {
      const a = idMap[w.start.componentId] || idMap.__board;
      const b = idMap[w.end.componentId] || idMap.__board;
      if (!a || !b) continue;
      const centre = async id =>
        page.evaluate(i => {
          const el = document.getElementById(i);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }, id);
      const ca = await centre(a);
      const cb = await centre(b);
      const before = await wireCount();
      const p1 = await wirePin(a, w.start.pinName, cb);
      const afterFirst = await wireCount();
      const p2 = p1 ? await wirePin(b, w.end.pinName, p1) : null;
      const afterSecond = await wireCount();
      if (process.env.WIRE_DEBUG)
        console.log(
          `    dbg ${w.start.pinName}->${w.end.pinName} hit1=${!!p1} hit2=${!!p2} counts ${before}/${afterFirst}/${afterSecond}`
        );
      // Escape FIRST, then count. The wire-in-progress preview is drawn
      // with the same outline stroke as a finished wire, so counting
      // before cancelling scores a missed click as a landed wire.
      await page.keyboard.press("Escape");
      await page.waitForTimeout(260);
      let landed = (await wireCount()) > before;
      if (!landed && p1 && p2) {
        const r1 = await wirePin(a, w.start.pinName, cb);
        const r2 = r1 ? await wirePin(b, w.end.pinName, r1) : null;
        if (r1 && r2) {
          await page.keyboard.press("Escape");
          await page.waitForTimeout(260);
          landed = (await wireCount()) > before;
        }
      }
      if (!landed) console.log(`    miss ${w.start.pinName}->${w.end.pinName}`);
      if (landed) wired++;
    }
    const finalWires = await page.evaluate(() => ({
      outline: document.querySelectorAll('path[stroke="#1a1a1a"]').length,
      allPaths: document.querySelectorAll("svg path").length,
      colored: document.querySelectorAll('path[stroke="#22c55e"], path[stroke="#cc0000"]').length,
    }));
    console.log(`    wires on canvas: ${JSON.stringify(finalWires)} (counted ${wired})`);

    // back to 1:1 for the still and the run
    const resetView = page.locator("button.zoom-level");
    if (await resetView.count()) {
      await resetView.click();
      await page.waitForTimeout(700);
    }
    // leave no wire in progress and dismiss the wiring hint banner
    await page.keyboard.press("Escape");
    const hint = page.locator('button:has-text("Cancel")');
    if (await hint.count()) await hint.first().click().catch(() => {});
    await page.waitForTimeout(400);
    mark("wired", { wires: wired, of: (recipe.wires || []).length });

    // the sketch
    await clickAt(430, 260, "focus-code", 350);
    await page.keyboard.press("Control+a");
    const firstLine = (recipe.code || "").split("\n")[0].slice(0, 46);
    await page.keyboard.type(firstLine, { delay: 45 });
    await page.waitForTimeout(500);
    await page.evaluate(code => {
      const m = window.monaco?.editor?.getModels?.()[0];
      if (m) m.setValue(code);
    }, recipe.code || "");
    mark("code");
    await page.waitForTimeout(1200);

    // finished-circuit still for the intro card
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("div,span"))
        if (/^DC\s*SPICE .* nets/.test((el.textContent || "").trim())) {
          el.dataset.vxHidden = "1";
          el.style.visibility = "hidden";
          break;
        }
    });
    const box = await page.evaluate(BBOX);
    const pad = 44;
    const clip = box
      ? {
          x: Math.max(0, Math.floor(box.x - pad)),
          y: Math.max(60, Math.floor(box.y - pad)),
          width: Math.min(VIEWPORT.width - Math.max(0, Math.floor(box.x - pad)), Math.ceil(box.w + 2 * pad)),
          height: Math.min(VIEWPORT.height - Math.max(60, Math.floor(box.y - pad)), Math.ceil(box.h + 2 * pad)),
        }
      : undefined;
    await page.screenshot({ path: join(OUT, `${slug}-circuit.png`), clip });
    await page.evaluate(() => {
      const el = document.querySelector('[data-vx-hidden="1"]');
      if (el) el.style.visibility = "";
    });

    // serial monitor open, so the run shows what the sketch prints
    const serial = page.locator('button[title="Toggle Serial Monitor"]');
    if (await serial.count()) await clickEl(serial, "serial", 700);

    // The output console accumulates: while wiring, a half-connected LED
    // legitimately trips the checker. Snapshot those complaints now so
    // only NEW ones (from the finished circuit) count against the take.
    const verifierBefore = await page.evaluate(VERIFIER_PROBE);

    // run
    const runBtn = page.locator('button[title*="Run" i]').first();
    const boardless = await runBtn.isDisabled().catch(() => false);
    let live = boardless;
    if (boardless) mark("run");
    else {
      await clickEl(runBtn, "run", 350);
      // the circuit verifier dialog can take a moment to appear
      const anyway = page.locator('button:has-text("Run anyway")');
      for (let i = 0; i < 10; i++) {
        if (await anyway.count()) {
          await clickEl(anyway.first(), "run-anyway", 400);
          break;
        }
        await page.waitForTimeout(400);
      }
      await moveTo(960, 1000, 16);
    }
    const tRun = Date.now();
    while (!live && Date.now() - tRun < COMPILE_TIMEOUT_MS) {
      if (simLog.some(l => /guest crashed/i.test(l))) break;
      // a late verifier dialog would otherwise stall the whole take
      const late = page.locator('button:has-text("Run anyway")');
      if (await late.count()) await clickEl(late.first(), "run-anyway-late", 400);
      if (simLog.some(l => l.includes("in-browser"))) live = true;
      else {
        const running = await page.evaluate(
          () => !!document.querySelector('button[title="Stop"]:not([disabled])')
        );
        if (running && Date.now() - tRun > 12000) live = true;
      }
      if (!live) await page.waitForTimeout(1500);
    }
    mark("live");
    await page.waitForTimeout(RUN_FOOTAGE_MS);
    mark("end");

    // What does the circuit check say? A demo with a burnt LED, a short
    // or an impossible current is a demo of a mistake — reject the take.
    const verifierAfter = await page.evaluate(VERIFIER_PROBE);
    const stale = new Set(verifierBefore);
    const verifier = verifierAfter.filter(t => !stale.has(t));

    out = {
      slug,
      title: recipe.title || slug,
      board: recipe.boardLabel || recipe.boardType || "",
      description: recipe.description || "",
      parts: (recipe.components || []).length,
      wires: (recipe.wires || []).length,
      wired,
      beats,
      box,
      live,
      verifier,
      crashed: simLog.some(l => /guest crashed/i.test(l)),
    };
    ok =
      live &&
      !out.crashed &&
      wired === (recipe.wires || []).length &&
      verifier.length === 0;
  } catch (e) {
    out = { slug, error: String(e).slice(0, 200) };
  }
  await context.close();
  const webm = globSync(`${TMP}/*.webm`)[0];
  if (ok && webm) {
    cpSync(webm, join(OUT, `${slug}.webm`));
    await writeFile(jsonPath, JSON.stringify(out, null, 1));
    console.log(`ok   ${slug} — ${out.wired}/${out.wires} wires, live at ${Math.round(beats.find(b => b.label === "live").t / 1000)}s`);
  } else {
    console.log(
      `FAIL ${slug} — ${out.error ? out.error : `live=${out.live} wires=${out.wired}/${out.wires} verifier=${JSON.stringify((out.verifier || []).slice(0, 2))}`}`
    );
  }
  rmSync(TMP, { recursive: true, force: true });
  results.push({ slug, ok });
}
await browser.close();
console.log(`\n${results.filter(r => r.ok).length}/${results.length} rebuilt`);
