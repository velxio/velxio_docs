#!/usr/bin/env node
/**
 * Record the footage of a vertical reel from a GALLERY example: the
 * circuit assembles itself (board, then each part pops in, then every wire
 * grows from pin to pin at the same time), Run, and the pointer works the
 * inputs. No picker, no wiring by hand, no pointer before the run.
 *
 *   node scripts/reel-assemble.mjs <example-id> [--live <sec>] [--force]
 *
 * Gallery layouts are often cramped and old examples carry no wire routes,
 * so reel-tidy.js lays the parts out around the board (each on the side
 * its pins leave from) and routes every wire around every body, the board
 * included, before anything is filmed. The app still simulates the same
 * netlist: only positions and waypoints change, nothing is saved.
 *
 * Output in promo/public/reels-take/:
 *   <id>.mp4        30 fps CFR, the frame is exactly the reel's middle band
 *   <id>.json       beats {assembled, run, live, inputs[]} in seconds
 *   <id>-code.png   the whole sketch in the real editor, for the code scene
 *   <id>-still.png  the assembled circuit at 3x, for the parts tour
 */
import * as nodeFs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } = nodeFs;
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "promo", "public", "reels-take");
const BASE = process.env.VELXIO_BASE || "http://127.0.0.1:3080";
const TIDY = readFileSync(join(HERE, "reel-tidy.js"), "utf8");
const COPY = JSON.parse(readFileSync(join(HERE, "reels.json"), "utf8"));
// reel-auto.mjs writes its copy here, per example; it wins over reels.json
const AUTO = join(HERE, "..", "promo", "public", "reels-copy");
const copyFor = id => ({ ...COPY[id], ...(existsSync(join(AUTO, `${id}.json`)) ? JSON.parse(readFileSync(join(AUTO, `${id}.json`), "utf8")) : {}) });
// the reel's middle band (between the hook and the brand strip)
const FRAME = { w: 1080, h: 1230 };
const FPS = 30;

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const liveIdx = argv.indexOf("--live");
const LIVE_SEC = liveIdx >= 0 ? Number(argv[liveIdx + 1]) : 10;
const ids = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--live");
if (!ids.length) throw new Error("usage: reel-assemble.mjs <example-id> ...");

// parts whose click opens the app's SensorControlPanel (sliders / a trigger button)
const SENSOR_RE = /dht|hc-sr04|ultrasonic|photoresistor|ldr|pir|ntc|gas-sensor|sound-sensor|heart-beat|bmp280|mpu6050/;
const INPUT_RE = /pushbutton|button|potentiometer|slide-pot|joystick|slide-switch|dht|ultrasonic|hc-sr04|photoresistor|ldr|pir|ntc|keypad|encoder|gas-sensor|sound-sensor|heart-beat/;

const launch = () => {
  const pw = `${process.env.HOME}/.cache/ms-playwright`;
  const exe = readdirSync(pw)
    .filter(d => d.startsWith("chromium-"))
    .sort()
    .map(d => join(pw, d, "chrome-linux64", "chrome"))
    .filter(existsSync)
    .pop();
  return chromium.launch({ headless: true, executablePath: exe });
};

const FIND_STORES = `(async () => {
  if (window.__vx) return !!window.__vx.sim;
  const urls = [...new Set(performance.getEntriesByType("resource").map(e => e.name).filter(n => /\\/assets\\/.*\\.js$/.test(n)))];
  const out = {};
  for (const u of urls) { let m; try { m = await import(u); } catch { continue; }
    for (const v of Object.values(m)) { let s; try { s = v?.getState?.(); } catch { continue; }
      if (!s || typeof s !== "object") continue;
      if ("wires" in s && "components" in s) out.sim = v;
      if ("files" in s && "activeFileId" in s) out.editor = v;
    } }
  window.__vx = out; return !!out.sim;
})()`;

// Everything on the embed that is not the circuit. Hidden, never removed:
// these nodes are React's (removing one crashes the tree on unmount).
const CHROME_CSS = `
.canvas-header,.velxio-embed-badge,.velxio-embed-status,.zoom-controls,.board-dock,
.gh-star-banner,.velxio-news-overlay,
div[title="Idle"],div[title="Compiled"],div[title="Running"]{display:none!important}
.component-label{display:none!important}
/* ElectricalOverlay: the SPICE pill and the voltage of the hovered wire */
.canvas-world svg[style*="z-index: 20"]:not(.wire-layer){display:none!important}
.velxio-embed-play-layer{opacity:0!important;pointer-events:none!important}
.sensor-control-panel{top:10px!important;left:50%!important;right:auto!important;bottom:auto!important;transform:translateX(-50%) scale(1.5)!important;transform-origin:top center!important}
div[style*="2px solid rgb(0, 122, 204)"]{display:none!important}
.canvas-content{top:0!important;height:100%!important}
`;

const HIDE_SPICE = `(() => {
  // the SPICE status pill, and the voltage a hovered pin shows ("5.00V")
  const go = () => { for (const t of document.querySelectorAll(".canvas-world svg text"))
    if (/SPICE|^-?\d+(\.\d+)?\s?[mu]?[VA]$/.test((t.textContent || "").trim())) { const g = t.closest("g"); if (g) g.style.visibility = "hidden"; } };
  go(); setInterval(go, 200);
})()`;

// a click ripple at the pointer with no mouse event: the knob is driven by value
const GRAB = `(() => {
  const c = document.getElementById("vx-cursor"); if (!c) return;
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;width:16px;height:16px;border-radius:50%;border:3px solid #0071e3;pointer-events:none;z-index:2147483646;left:" + c.style.left + ";top:" + c.style.top + ";transform:translate(-50%,-50%);animation:vxr .55s ease-out forwards;";
  document.body.appendChild(r); setTimeout(() => r.remove(), 700);
})()`;

const CURSOR = `(() => {
  if (document.getElementById("vx-cursor")) return;
  const W = 34, c = document.createElement("div");
  c.id = "vx-cursor";
  c.style.cssText = "position:fixed;pointer-events:none;z-index:2147483647;width:" + W + "px;height:" + W + "px;left:-80px;top:-80px;margin-left:-5px;margin-top:-4px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7));";
  c.innerHTML = '<svg width="' + W + '" height="' + W + '" viewBox="0 0 24 24"><path d="M4 3 L4 19 L8.5 15.5 L11 21 L13.5 20 L11 14.5 L17 14.5 Z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  document.body.appendChild(c);
  addEventListener("mousemove", e => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
  addEventListener("mousedown", e => {
    const r = document.createElement("div");
    r.style.cssText = "position:fixed;width:16px;height:16px;border-radius:50%;border:3px solid #0071e3;pointer-events:none;z-index:2147483646;left:" + e.clientX + "px;top:" + e.clientY + "px;transform:translate(-50%,-50%);animation:vxr .55s ease-out forwards;";
    document.body.appendChild(r); setTimeout(() => r.remove(), 700);
  }, true);
  const st = document.createElement("style");
  st.textContent = "@keyframes vxr{to{width:72px;height:72px;opacity:0}}";
  document.head.appendChild(st);
})()`;

/** In the page: hide every body and wire, then bring them back in order.
 *  Resolves when the last wire has landed. */
const ASSEMBLE = async ({ partMs, wireMs }) => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const back = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  // a board's container is zero-size at the world origin: animate its visible children
  const boards = [...document.querySelectorAll("[data-board-overlay]")].flatMap(o =>
    [...o.parentElement.children].filter(c => c !== o && c.getBoundingClientRect().width > 20));
  const sim = window.__vx.sim.getState();
  const wrap = id => document.querySelector(`.dynamic-component-wrapper[data-component-id="${CSS.escape(id)}"]`);
  // parts closest to the board first
  const bb = boards[0]?.getBoundingClientRect();
  const parts = sim.components.map(c => wrap(c.id)).filter(Boolean).sort((a, b) => {
    if (!bb) return 0;
    const d = el => { const r = el.getBoundingClientRect(); return Math.hypot(r.x + r.width / 2 - (bb.x + bb.width / 2), r.y + r.height / 2 - (bb.y + bb.height / 2)); };
    return d(a) - d(b);
  });
  const groups = [...document.querySelectorAll(".wire-layer > g, .wire-layer g")].filter(g => g.querySelector("path") && g.parentElement.closest("g") === null);
  const fade = (el, ms) => new Promise(res => {
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      el.style.opacity = String(ease(t));
      if (t < 1) requestAnimationFrame(step); else res();
    };
    step();
  });
  const pop = (el, ms) => new Promise(res => {
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      el.style.opacity = String(Math.min(1, t * 2.2));
      // the scale property, not transform: transform carries the part's rotation
      el.style.scale = String(0.55 + 0.45 * back(t));
      if (t < 1) requestAnimationFrame(step); else { el.style.scale = ""; res(); }
    };
    step();
  });
  for (const el of [...boards, ...parts]) { el.style.opacity = "0"; }
  const wireParts = groups.map(g => {
    const paths = [...g.querySelectorAll("path")].map(p => ({ p, L: p.getTotalLength() }));
    const dots = [...g.querySelectorAll("circle")];
    for (const { p, L } of paths) { p.style.strokeDasharray = `${L} ${L + 2}`; p.style.strokeDashoffset = String(L); }
    for (const d of dots) d.style.opacity = "0";
    return { paths, dots };
  });
  window.__vxReady = true;
  while (!window.__vxGo) await wait(20);
  await wait(250);
  // a board is positioned inside a zero-size container, so it fades rather than scales
  await Promise.all(boards.map(b => fade(b, 450)));
  await wait(120);
  for (const el of parts) { pop(el, 380); await wait(partMs); }
  await wait(380);
  const t0 = performance.now();
  await new Promise(res => {
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / wireMs), k = ease(t);
      for (const { paths, dots } of wireParts) {
        for (const { p, L } of paths) p.style.strokeDashoffset = String(L * (1 - k));
        if (dots[0]) dots[0].style.opacity = "1";
        if (dots[1]) dots[1].style.opacity = t >= 1 ? "1" : "0";
      }
      if (t < 1) requestAnimationFrame(step); else res();
    };
    step();
  });
  for (const { paths } of wireParts) for (const { p } of paths) { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; }

  // Pin names on the PARTS' wired pins, so a paused frame shows what goes
  // where (boards print their own). A tag sits on the wire's first stub,
  // turned along it, which is the one place it cannot hide another pin's
  // name: neighbouring pins are ~10 px apart across the stub, not along it.
  const world = document.querySelector(".canvas-world");
  const wr = world.getBoundingClientRect();
  const z = new DOMMatrix(getComputedStyle(world).transform).a || 1;
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60;opacity:0;transition:opacity .45s";
  document.body.appendChild(layer);
  const boardIds = new Set(window.__vxBoards ? window.__vxBoards.getState().boards.map(b => b.id) : []);
  const NOISE = /^(\d+|\d+\.[lr]|[12])$/i; // resistor legs, button legs: names that say nothing
  const seen = new Set();
  for (const w of window.__vx.sim.getState().wires) {
    for (const [end, next] of [[w.start, (w.waypoints || [])[0] || w.end], [w.end, (w.waypoints || []).slice(-1)[0] || w.start]]) {
      if (boardIds.has(end.componentId) || NOISE.test(end.pinName)) continue;
      const key = end.componentId + ":" + end.pinName;
      if (seen.has(key)) continue;
      seen.add(key);
      const x = wr.left + end.x * z, y = wr.top + end.y * z;
      const dx = next.x - end.x, dy = next.y - end.y;
      const vertical = Math.abs(dy) > Math.abs(dx);
      const sgn = vertical ? Math.sign(dy) || 1 : Math.sign(dx) || 1;
      const t = document.createElement("div");
      t.textContent = end.pinName;
      t.style.cssText = "position:absolute;font:700 7.5px/1 ui-monospace,Menlo,Consolas,monospace;color:#fff;" +
        "background:rgba(14,14,16,.88);border:1px solid rgba(255,255,255,.28);border-radius:3px;padding:1.5px 3px;white-space:nowrap;";
      layer.appendChild(t);
      const tw = t.offsetWidth, th = t.offsetHeight, off = 5 + tw / 2;
      const cx = vertical ? x : x + sgn * off, cy = vertical ? y + sgn * off : y;
      t.style.left = cx - tw / 2 + "px";
      t.style.top = cy - th / 2 + "px";
      if (vertical) t.style.transform = "rotate(-90deg)";
    }
  }
  requestAnimationFrame(() => (layer.style.opacity = "1"));
  await wait(450);
  return { boards: boards.length, parts: parts.length, wires: wireParts.length };
};

/** In the page, after the assembly: one stop per board and per part TYPE
 *  (repeats folded into one, with a count), each with the box it covers on
 *  screen and the facts the app itself holds about it: the picker metadata,
 *  the pins and the buses they carry. reel-cards.mjs turns those facts into
 *  the card text; nothing here is written by hand. */
// parts built into a board, toured as parts of their own when the board
// carries them: a kit with nothing else on the canvas still gets a tour.
// sel is looked up in the board element's shadow DOM; the card comes from
// part-facts.json under the same type.
const ONBOARD = {
  "m5stack-core": [{ sel: "canvas", type: "onboard-ili9342c" }, { sel: ".btn", type: "onboard-m5-buttons" }],
  "cardputer-adv": [
    { sel: "canvas", type: "onboard-st7789-cardputer" },
    { sel: ".key", type: "onboard-cardputer-keyboard" },
    { sel: "#rgbled", type: "onboard-ws2812" },
    { sel: "#irled", type: "onboard-ir-tx" },
  ],
  "stellar-unicorn": [{ sel: "canvas", type: "onboard-stellar-matrix" }, { sel: ".btn", type: "onboard-unicorn-buttons" }],
  "badger-2350": [{ sel: "canvas", type: "onboard-badger-epaper" }, { sel: ".btn", type: "onboard-badger-buttons" }],
  "esp32-c3-lcdkit": [
    { sel: "canvas", type: "onboard-gc9a01" },
    { sel: ".knob", type: "onboard-ec11" },
    { sel: "#lcdkit-rgb-led", type: "onboard-ws2812" },
    { sel: "#lcdkit-ir-rx", type: "onboard-ir-rx" },
  ],
};

const TOUR = async onboard => {
  const meta = await fetch("/components-metadata.json").then(r => r.json()).then(j => j.components || []).catch(() => []);
  const union = rs => rs.reduce((a, r) => !a ? { x: r.left, y: r.top, r: r.right, b: r.bottom }
    : { x: Math.min(a.x, r.left), y: Math.min(a.y, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom) }, null);
  const box = u => u && { x: u.x, y: u.y, w: u.r - u.x, h: u.b - u.y };
  const pinFacts = el => {
    const pins = (el?.pinInfo || []).map(p => ({ name: p.name, bus: [...new Set((p.signals || []).map(s => s.type))].join("/") }));
    return { pinCount: pins.length, buses: [...new Set(pins.flatMap(p => p.bus ? p.bus.split("/") : []))].filter(b => b !== "power"), pins: pins.slice(0, 48) };
  };
  const stops = [];
  for (const b of window.__vxBoards ? window.__vxBoards.getState().boards : []) {
    const ov = document.querySelector(`[data-board-overlay][data-board-id="${CSS.escape(b.id)}"]`) || document.querySelector("[data-board-overlay]");
    const kids = ov ? [...ov.parentElement.children].filter(c => c !== ov && c.getBoundingClientRect().width > 20) : [];
    const el = kids.flatMap(k => [k, ...k.querySelectorAll("*")]).find(n => n.pinInfo);
    stops.push({ kind: "board", type: b.boardKind, ids: [b.id], count: 1, rect: box(union(kids.map(k => k.getBoundingClientRect()))),
      facts: { boardKind: b.boardKind, language: b.languageMode, libraries: b.libraries || [], ...pinFacts(el) } });
    const host = kids.flatMap(k => [k, ...k.querySelectorAll("*")]).find(n => n.shadowRoot);
    for (const o of onboard[b.boardKind] || []) {
      // every match counts: ".btn" is the row of buttons, ".key" the keyboard
      const u = union([...(host?.shadowRoot.querySelectorAll(o.sel) || [])].map(n => n.getBoundingClientRect()).filter(r => r.width));
      if (!u) continue;
      const r = { left: u.x, top: u.y, width: u.r - u.x, height: u.b - u.y };
      // an LED a few px across still needs room for the spotlight
      const pad = Math.max(0, (28 - Math.min(r.width, r.height)) / 2);
      stops.push({ kind: "part", type: o.type, ids: [b.id], count: 1,
        rect: { x: r.left - pad, y: r.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad }, facts: { onboard: true } });
    }
  }
  const byType = new Map();
  for (const c of window.__vx.sim.getState().components) {
    const t = c.metadataId || c.type || "";
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t).push(c);
  }
  for (const [type, cs] of byType) {
    const els = cs.map(c => document.getElementById(c.id)).filter(Boolean);
    if (!els.length) continue;
    const m = meta.find(x => x.tagName === type || x.id === type || "wokwi-" + x.id === type) || {};
    stops.push({ kind: "part", type, ids: cs.map(c => c.id), count: cs.length, rect: box(union(els.map(e => e.getBoundingClientRect()))),
      facts: { name: m.name, category: m.category, description: m.description, tags: m.tags,
        props: Object.fromEntries(Object.entries(cs[0].properties || {}).filter(([, v]) => typeof v !== "object" && String(v).length < 40)),
        ...pinFacts(els[0]) } });
  }
  return stops.filter(s => s.rect && s.rect.w > 4);
};

const CIRCUIT_BOX = `(() => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const el of document.querySelectorAll(".dynamic-component-wrapper[data-component-id] > *, [data-board-overlay], .wire-layer path")) {
    const r = el.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
})()`;

/** Shift every part and board so the circuit's centre lands on (cx, cy). */
const CENTRE = async ({ dx, dy }) => {
  const sim = window.__vx.sim.getState();
  for (const c of sim.components) sim.updateComponent(c.id, { x: c.x + dx, y: c.y + dy });
  const bs = window.__vxBoards;
  if (bs) for (const b of bs.getState().boards) bs.getState().updateBoard(b.id, { x: b.x + dx, y: b.y + dy });
  sim.setWires(sim.wires.map(w => ({ ...w, waypoints: (w.waypoints || []).map(p => ({ x: p.x + dx, y: p.y + dy })) })));
  await new Promise(r => setTimeout(r, 200));
  window.__vx.sim.getState().recalculateAllWirePositions();
  await new Promise(r => setTimeout(r, 300));
};

async function openTidy(browser, id, viewport, dsf) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf });
  const page = await ctx.newPage();
  page.on("pageerror", e => console.log("    pageerror:", e.message.slice(0, 160)));
  await page.goto(`${BASE}/embed/example/${id}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".canvas-world", { timeout: 30000 });
  await page.addStyleTag({ content: CHROME_CSS });
  // a board that takes the keyboard (the Cardputer) is focused by the first
  // key press, and its focus ring framed the board for the rest of the take
  // (the global focus style draws it as a box-shadow, --color-focus-ring)
  await page.addStyleTag({ content: ".canvas-world :focus,.canvas-world :focus-visible{outline:none!important;box-shadow:none!important}" });
  await page.waitForTimeout(1500);
  // the embed zooms to fit the ORIGINAL layout; film at 1:1 and centre it ourselves
  await page.evaluate(() => document.querySelector(".zoom-level")?.click());
  await page.waitForTimeout(500);
  if (!(await page.evaluate(FIND_STORES))) throw new Error("simulator store not found");
  // the board store: the other zustand store with boards + updateBoard
  await page.evaluate(async () => {
    const urls = [...new Set(performance.getEntriesByType("resource").map(e => e.name).filter(n => /\/assets\/.*\.js$/.test(n)))];
    for (const u of urls) { let m; try { m = await import(u); } catch { continue; }
      for (const v of Object.values(m)) { let s; try { s = v?.getState?.(); } catch { continue; }
        if (s && typeof s === "object" && Array.isArray(s.boards) && s.updateBoard) window.__vxBoards = v; } }
  });
  await page.evaluate(HIDE_SPICE);
  await page.evaluate(TIDY);
  const tidy = await page.evaluate(() => window.__vxTidy());
  return { ctx, page, tidy };
}

const browser = await launch();
mkdirSync(OUT, { recursive: true });
for (const id of ids) {
  const mp4 = join(OUT, `${id}.mp4`);
  if (existsSync(mp4) && !FORCE) { console.log(`skip ${id} (exists)`); continue; }
  console.log(`== ${id}`);

  // pass 1: how big is the tidy circuit?
  const probe = await openTidy(browser, id, { width: 2400, height: 2400 }, 1);
  const box = await probe.page.evaluate(CIRCUIT_BOX);
  const sensors = await probe.page.evaluate(re => window.__vx.sim.getState().components
    .filter(c => new RegExp(re).test(c.metadataId || "")).length, SENSOR_RE.source);
  await probe.ctx.close();
  // a sensor's control panel docks at the top of the frame: keep that strip free
  const PANEL = sensors ? 200 : 0;
  const pad = 1.14;
  const vw = Math.ceil(Math.max(box.w * pad, (box.h * pad + PANEL) * (FRAME.w / FRAME.h), sensors ? 560 : 420));
  const vh = Math.round(vw * (FRAME.h / FRAME.w));
  const dsf = FRAME.w / vw;
  console.log(`   circuit ${Math.round(box.w)}x${Math.round(box.h)} -> viewport ${vw}x${vh} @${dsf.toFixed(2)}x`);

  // pass 2: same tidy at the filming scale, centred in the frame
  const { ctx, page, tidy } = await openTidy(browser, id, { width: vw, height: vh }, dsf);
  console.log(`   tidy ${JSON.stringify(tidy)}`);
  const b2 = await page.evaluate(CIRCUIT_BOX);
  const world = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector(".canvas-world")).transform).a || 1);
  const dx = Math.round((vw / 2 - (b2.x + b2.w / 2)) / world), dy = Math.round((PANEL + (vh - PANEL) / 2 - (b2.y + b2.h / 2)) / world);
  await page.evaluate(CENTRE, { dx, dy });

  const comps = await page.evaluate(() => window.__vx.sim.getState().components.map(c => ({ id: c.id, type: c.metadataId || c.type || "" })));
  // the copy may pick the inputs and their order: { "inputs": ["pir", "ldr"] },
  // and hold one back until the sketch is ready for it: { "id": "btn", "wait": 2 }
  const pick = copyFor(id).inputs;
  const inputs = pick
    ? pick.map(i => typeof i === "string" ? { id: i } : i)
        .map(i => /^board:/.test(i.id)
          ? { id: i.id, type: "board-control", action: i.action || "tap", ...(i.key != null ? { key: keyCap(String(i.key)) } : {}), wait: Number(i.wait) || 0 }
          : { ...comps.find(c => c.id === i.id), wait: Number(i.wait) || 0 }).filter(c => c.type != null)
    : comps.filter(c => INPUT_RE.test(c.type));

  // screencast
  const framesDir = join(OUT, `.${id}-frames`);
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async f => {
    const n = frames.length;
    writeFileSync(join(framesDir, `${String(n).padStart(5, "0")}.jpg`), Buffer.from(f.data, "base64"));
    frames.push(f.metadata.timestamp);
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });

  const assembling = page.evaluate(ASSEMBLE, { partMs: 260, wireMs: 1500 });
  await page.waitForFunction(() => window.__vxReady === true);
  if (process.env.REEL_DEBUG) {
    await page.screenshot({ path: join(OUT, `.${id}-hidden.png`) });
    console.log("   debug", await page.evaluate(() => ({
      boards: [...document.querySelectorAll("[data-board-overlay]")].map(o => [...o.parentElement.children].map(c => c.tagName + ":" + Math.round(c.getBoundingClientRect().width) + ":" + c.style.opacity)),
      groups: document.querySelectorAll(".wire-layer g").length,
    })));
  }
  await page.waitForTimeout(300);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: FRAME.w, maxHeight: FRAME.h, everyNthFrame: 1 });
  const T0 = Date.now() / 1000;
  const beats = {};
  const mark = k => (beats[k] = Date.now() / 1000 - T0);
  await page.waitForTimeout(400);
  await page.evaluate(() => (window.__vxGo = true));
  const counts = await assembling;
  mark("assembled");
  console.log(`   assembled ${JSON.stringify(counts)}`);
  // the parts tour is cut from one sharp still of the assembled circuit, so
  // its zoom can go in 3x without the take's resolution showing
  const stops = await page.evaluate(TOUR, ONBOARD);
  await cdp.send("Page.stopScreencast");
  const shot = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: vw, height: vh, scale: 3 * dsf } });
  writeFileSync(join(OUT, `${id}-still.png`), Buffer.from(shot.data, "base64"));
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: FRAME.w, maxHeight: FRAME.h, everyNthFrame: 1 });
  await page.waitForTimeout(900);

  // run
  mark("run");
  await page.evaluate(() => document.querySelector(".velxio-embed-play")?.click());
  const t = Date.now();
  let live = false;
  while (Date.now() - t < 240000) {
    // the embed's badge turns into "Powered by Velxio" once the program is
    // compiled AND started; the board's status dot says Running earlier
    live = await page.evaluate(() => /Powered by/.test(document.querySelector(".velxio-embed-badge")?.textContent || ""));
    if (live) break;
    await page.waitForTimeout(250);
  }
  mark("live");
  console.log(`   live=${live} after ${((Date.now() - t) / 1000).toFixed(1)} s`);
  // the circuit solver loads lazily: an input worked before it is up does nothing
  await page.waitForTimeout(3000);

  // work the inputs, pointer only now
  beats.inputs = [];
  if (inputs.length) {
    await page.evaluate(CURSOR);
    await page.mouse.move(vw - 20, vh - 20);
    for (const inp of inputs.slice(0, 5)) {
      const at = await page.evaluate(i => {
        // "board:<selector>" inside a board's shadow DOM ("board:knob" is the class
        // knob); "board:keyboard" is the key cap with that label
        const sel = i.id === "board:keyboard" ? `.key[data-label="${CSS.escape(i.key || "")}"]`
          : /^board:[\w-]+$/.test(i.id) ? "." + i.id.slice(6) : i.id.slice(6);
        const el = /^board:/.test(i.id)
          ? [...document.querySelectorAll("*")].map(h => h.shadowRoot?.querySelector(sel)).find(Boolean)
          : document.getElementById(i.id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, s: Math.min(r.width, r.height) };
      }, { id: inp.id, key: inp.key });
      if (!at) { console.log(`   input not found: ${inp.id}${inp.key ? " " + inp.key : ""}`); continue; }
      if (inp.wait) await page.waitForTimeout(Math.min(8, inp.wait) * 1000);
      const rec = { id: inp.id, type: inp.type, ...(inp.action ? { action: inp.action } : {}), ...(inp.key ? { key: inp.key } : {}), t: Date.now() / 1000 - T0, press: [] };
      beats.inputs.push(rec);
      const now = () => Date.now() / 1000 - T0;
      if (inp.type === "board-control") await workBoardControl(page, inp, at, () => rec.press.push(now()));
      else if (/potentiometer/.test(inp.type)) await turnKnob(page, inp.id, () => rec.press.push(now()));
      else if (SENSOR_RE.test(inp.type)) await workSensor(page, inp.id, () => rec.press.push(now()));
      else {
        await glide(page, at.cx, at.cy, 750);
        await page.waitForTimeout(300);
        for (let k = 0; k < 3; k++) {
          await page.mouse.down(); rec.press.push(now()); await page.waitForTimeout(900);
          await page.mouse.up(); await page.waitForTimeout(800);
        }
      }
      await page.waitForTimeout(700);
      rec.done = now();
    }
    await glide(page, vw + 60, vh * 0.8, 700);
  }
  const rest = LIVE_SEC - (Date.now() / 1000 - T0 - beats.live);
  if (rest > 0) await page.waitForTimeout(rest * 1000);
  mark("end");
  await cdp.send("Page.stopScreencast");
  await ctx.close();

  // frames -> constant 30 fps (a screencast only sends frames that changed).
  // A frame unlike both neighbours while they match each other is a half-
  // painted one (seen on the Cardputer: the board cut off mid-draw for one
  // frame) and goes; its time goes to the frame before it
  const torn = tornFrames(framesDir, frames.length);
  if (torn.size) console.log(`   dropped ${torn.size} half-painted frame(s)`);
  const keep = [...frames.keys()].filter(n => !torn.has(n));
  const list = [];
  for (let j = 0; j < keep.length; j++) {
    const n = keep[j];
    const d = (j + 1 < keep.length ? frames[keep[j + 1]] : T0 + beats.end) - frames[n];
    list.push(`file '${String(n).padStart(5, "0")}.jpg'`, `duration ${Math.max(0.001, d).toFixed(4)}`);
  }
  list.push(`file '${String(keep[keep.length - 1]).padStart(5, "0")}.jpg'`);
  writeFileSync(join(framesDir, "list.txt"), list.join("\n"));
  const offset = frames[0] - T0; // screencast clock vs ours
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", join(framesDir, "list.txt"),
    "-vf", `fps=${FPS},scale=${FRAME.w}:${FRAME.h}:force_original_aspect_ratio=decrease,pad=${FRAME.w}:${FRAME.h}:(ow-iw)/2:(oh-ih)/2:color=0x1e1e1e,format=yuv420p`,
    // no B-frames, a keyframe every half second: the render seeks into this
    // file at every scene, and a long GOP is where a half-decoded frame came from
    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-bf", "0", "-g", "15", mp4]);
  for (const k of ["assembled", "run", "live", "end"]) beats[k] -= offset;
  for (const i of beats.inputs) {
    i.t -= offset;
    i.done -= offset;
    i.press = i.press.map(x => x - offset);
  }
  rmSync(framesDir, { recursive: true, force: true });

  // the code, whole, in the real editor
  const code = await captureCode(browser, id, join(OUT, `${id}-code.png`));
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify({ id, beats, live, tidy, inputs, code, frame: FRAME, tour: { vw, vh, stops } }, null, 1));
  console.log(`   ${mp4}  ${JSON.stringify(beats)}`);
}
await browser.close();

/** Indexes of screencast frames that differ from both neighbours (mean grey
 *  difference over 9 on 54x62 thumbnails) while the neighbours agree. */
function tornFrames(dir, n) {
  const FW = 54, FH = 62, S = FW * FH;
  const raw = spawnSync("ffmpeg", ["-v", "error", "-start_number", "0", "-i", join(dir, "%05d.jpg"),
    "-vf", `scale=${FW}:${FH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const m = Math.min(n, Math.floor(raw.length / S));
  const diff = (a, b) => { let t = 0; for (let i = 0; i < S; i++) t += Math.abs(raw[a * S + i] - raw[b * S + i]); return t / S; };
  const out = new Set();
  for (let k = 1; k < m - 1; k++)
    if (diff(k - 1, k + 1) < 3 && diff(k, k - 1) > 9 && diff(k, k + 1) > 9) out.add(k);
  return out;
}

/** Move the pointer by gliding the DRAWN cursor, then the real one in one
 *  jump. page.mouse.move with steps waits a frame per step, and a busy page
 *  (a raycaster on a TFT) turned a 30-step move into 20 s. */
async function glide(page, x, y, ms = 650) {
  await page.evaluate(([x, y, ms]) => {
    const c = document.getElementById("vx-cursor");
    if (!c) return;
    c.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`;
    c.style.left = x + "px"; c.style.top = y + "px";
  }, [x, y, ms]);
  await page.waitForTimeout(ms + 40);
  await page.evaluate(() => { const c = document.getElementById("vx-cursor"); if (c) c.style.transition = ""; });
  await page.mouse.move(x, y);
}

/** Screenshot the sketch in the real Monaco, tall enough to hold every
 *  line, so the reel can scroll it without the editor re-rendering. */
async function captureCode(browser, id, png) {
  const ctx = await browser.newContext({ viewport: { width: 760, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/example/${id}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".gh-star-banner,.velxio-news-overlay,.minimap,.decorationsOverviewRuler{display:none!important}.monaco-editor .current-line{border:0!important;background:none!important}" });
  await page.waitForFunction(() => window.monaco?.editor?.getEditors?.().length > 0, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(FIND_STORES);
  await page.evaluate(() => window.__vx.editor?.getState().setViewMode?.("code"));
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const ed = window.monaco?.editor?.getEditors?.()[0];
    if (!ed) return null;
    const lines = ed.getModel().getLineCount();
    const longest = Math.max(...ed.getModel().getValue().split("\n").map(l => l.replace(/\t/g, "  ").length));
    const lh = ed.getOption(window.monaco.editor.EditorOption.lineHeight);
    return { lines, lh, longest, lang: ed.getModel().getLanguageId() };
  });
  if (!info) { await ctx.close(); return null; }
  // grow the page until the editor shows every line
  const el = page.locator(".editor-wrapper").first();
  const cur = await el.boundingBox();
  const extra = Math.max(0, info.lines * info.lh + 40 - cur.height);
  // as narrow as the longest line allows: the reel shows the shot at 1080 px wide,
  // so a narrower editor means bigger text on the phone
  const width = Math.round(Math.min(720, Math.max(480, info.longest * 9.4 + 120)));
  await page.setViewportSize({ width, height: Math.min(14000, Math.round(900 + extra)) });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const ed = window.monaco.editor.getEditors()[0]; ed.updateOptions({ wordWrap: "off" }); ed.layout(); ed.setScrollTop(0); ed.setPosition({ lineNumber: 1, column: 1 }); document.activeElement?.blur?.(); });
  // anything the page lays over the editor (sign-up prompt, toasts): hide it
  await page.evaluate(() => {
    const ed = document.querySelector(".editor-wrapper .monaco-editor");
    const box = ed.getBoundingClientRect();
    for (const n of document.querySelectorAll("body *")) {
      if (ed.contains(n) || n.contains(ed)) continue;
      const cs = getComputedStyle(n);
      if (cs.position !== "fixed" && cs.position !== "absolute" && cs.position !== "sticky") continue;
      const r = n.getBoundingClientRect();
      if (r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom && r.width * r.height > 0)
        n.style.setProperty("visibility", "hidden", "important");
    }
  });
  await page.waitForTimeout(500);
  const eb = await el.boundingBox();
  await page.screenshot({ path: png, clip: { x: eb.x, y: eb.y, width: eb.width, height: Math.min(eb.height, info.lines * info.lh + 24) } });
  await ctx.close();
  return info;
}

/** The label a board keyboard prints on a cap, from what a model writes:
 *  " " or "space" is spc, "enter" is ok, letters are upper case. */
function keyCap(k) {
  const n = k.trim().toLowerCase();
  if (k === " " || n === "space" || n === "spc") return "spc";
  if (n === "enter" || n === "return" || n === "ok") return "ok";
  if (/^(del|tab|fn|aa|ctrl|opt|alt)$/.test(n)) return n === "aa" ? "Aa" : n;
  return k.length === 1 ? k.toUpperCase() : k;
}

/** A control drawn on the board itself ("board:knob" = the element with
 *  class "knob" in some board's shadow DOM), worked with the real mouse so
 *  the board's own pointer handlers decide what it means:
 *    tap   a short press
 *    hold  press and keep it down 4 s; a knob that steers on the wheel while
 *          held (the LCDkit) gets a few notches each way
 *    turn  grab the rim and sweep the pointer around the centre, back and forth */
async function workBoardControl(page, inp, at, onPress) {
  if (inp.action === "turn") {
    const r = at.s * 0.36, pt = deg => [at.cx + r * Math.cos(deg * Math.PI / 180), at.cy + r * Math.sin(deg * Math.PI / 180)];
    let a = -90;
    await glide(page, ...pt(a), 750);
    await page.waitForTimeout(250);
    await page.mouse.down(); onPress();
    for (const sweep of [110, -200, 90]) {
      const n = Math.max(6, Math.round(Math.abs(sweep) / 8)), from = a;
      for (let s = 1; s <= n; s++) {
        a = from + sweep * (s / n);
        await page.mouse.move(...pt(a));
        await page.waitForTimeout(25);
      }
      await page.waitForTimeout(200);
    }
    await page.mouse.up();
    return;
  }
  await glide(page, at.cx, at.cy, 750);
  await page.waitForTimeout(300);
  if (inp.action === "hold" && /knob/.test(inp.id)) {
    await page.mouse.down(); onPress();
    await page.waitForTimeout(700);
    for (const dy of [100, 100, 100, -100, -100, -100, -100, 100]) { await page.mouse.wheel(0, dy); await page.waitForTimeout(380); }
    await page.mouse.up();
    return;
  }
  if (inp.action === "hold") {
    await page.mouse.down(); onPress(); await page.waitForTimeout(1500); await page.mouse.up();
    return;
  }
  for (let k = 0; k < (inp.action === "taps" ? 3 : 1); k++) {
    // long enough for a sketch that polls its buttons once a frame
    await page.mouse.down(); onPress(); await page.waitForTimeout(160); await page.mouse.up();
    await page.waitForTimeout(inp.action === "taps" ? 850 : 0);
  }
}

/** Turn a potentiometer by VALUE, with the pointer drawn along the knob.
 *  Dragging it for real is fragile: the element takes the angle from the
 *  centre of its own #knob path (not of the part), through a matrix taken
 *  at mousedown, and a drag a few px off read as jumps. So the value goes
 *  through the element's own updateValue() (the same 'input' event a drag
 *  raises, which is what the app listens to), and the cursor rides an arc
 *  around the knob at exactly the angle the knob shows. */
async function turnKnob(page, id, onGrab) {
  const k = await page.evaluate(i => {
    const el = document.getElementById(i);
    const knob = el?.shadowRoot?.querySelector("#knob");
    if (!el || !knob || typeof el.updateValue !== "function") return null;
    const r = knob.getBoundingClientRect();
    return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, r: Math.max(r.width, r.height) * 0.36,
      min: el.min ?? 0, max: el.max ?? 1023, a0: el.startDegree ?? -135, a1: el.endDegree ?? 135, v: el.value ?? 0 };
  }, id);
  if (!k) return;
  const at = f => {
    const deg = k.a0 + (k.a1 - k.a0) * f, rad = (deg * Math.PI) / 180;
    return [k.cx + k.r * Math.sin(rad), k.cy - k.r * Math.cos(rad)];
  };
  let f = (k.v - k.min) / (k.max - k.min || 1);
  await glide(page, ...at(f), 700);
  await page.waitForTimeout(250);
  await page.evaluate(GRAB);
  onGrab();
  for (const [to, ms] of [[1, 1500], [0, 1900], [0.6, 1100]]) {
    const from = f, n = Math.max(8, Math.round(ms / 40));
    for (let s = 1; s <= n; s++) {
      const t = s / n, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      f = from + (to - from) * e;
      await page.evaluate(([i, v]) => document.getElementById(i).updateValue(v), [id, k.min + (k.max - k.min) * f]);
      await page.mouse.move(...at(f));
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(250);
  }
}

/** Click a sensor, then work its control panel the way a person would:
 *  grab each slider at its thumb and drag it across, or press the trigger
 *  button (PIR). Falls back to setting the range input if the drag did not
 *  move it, with the pointer still riding the thumb. */
async function workSensor(page, id, onPress) {
  const c = await page.evaluate(i => {
    const r = document.getElementById(i)?.getBoundingClientRect();
    return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
  }, id);
  if (!c) return;
  await glide(page, c.x, c.y, 650);
  await page.waitForTimeout(250);
  await page.mouse.down(); onPress(); await page.mouse.up();
  await page.waitForTimeout(700);
  const sliders = await page.evaluate(() => [...document.querySelectorAll(".sensor-control-panel input[type=range]")].length);
  // one slider per sensor: each value costs ~0.5 s of solving on this page
  for (let n = 0; n < Math.min(1, sliders); n++) {
    const sl = () => page.evaluate(k => {
      const el = document.querySelectorAll(".sensor-control-panel input[type=range]")[k];
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y + r.height / 2, w: r.width, v: Number(el.value), min: Number(el.min), max: Number(el.max) };
    }, n);
    const s0 = await sl();
    const TH = 8; // half the thumb: the track is inset by it at both ends
    const px = f => s0.x + TH + (s0.w - 2 * TH) * f;
    let f = (s0.v - s0.min) / (s0.max - s0.min || 1);
    await glide(page, px(f), s0.y, 450);
    await page.evaluate(GRAB);
    onPress();
    // By value, not by drag: on this page every drag event re-solves the
    // circuit (~190 ms each), so a real drag crawled (21 s for a DHT22).
    // The value goes in through the native setter + 'input' (what React's
    // onChange hears) and the pointer glides to the thumb with a transition.
    for (const to of [0.08, 0.92]) {
      const from = f, steps = 4;
      for (let k = 1; k <= steps; k++) {
        f = from + (to - from) * (k / steps);
        await page.evaluate(([n, v, x, y]) => {
          const el = document.querySelectorAll(".sensor-control-panel input[type=range]")[n];
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          const c = document.getElementById("vx-cursor");
          if (c) { c.style.transition = "left .4s ease-in-out, top .4s ease-in-out"; c.style.left = x + "px"; c.style.top = y + "px"; }
        }, [n, s0.min + (s0.max - s0.min) * f, px(f), s0.y]);
        await page.waitForTimeout(130);
      }
      await page.waitForTimeout(220);
    }
    // park the real pointer where the drawn one is, and drop the transition
    await page.evaluate(() => { const c = document.getElementById("vx-cursor"); if (c) c.style.transition = ""; });
    await page.mouse.move(px(f), s0.y);
    await page.waitForTimeout(400);
  }
  const trig = page.locator(".sensor-control-panel .sensor-trigger-button").first();
  if (await trig.count()) {
    const b = await trig.boundingBox();
    await glide(page, b.x + b.width / 2, b.y + b.height / 2, 500);
    await page.mouse.down(); onPress(); await page.mouse.up();
    await page.waitForTimeout(1600);
  }
  const close = page.locator(".sensor-control-panel .sensor-panel-close").first();
  if (await close.count()) {
    const b = await close.boundingBox();
    await glide(page, b.x + b.width / 2, b.y + b.height / 2, 450);
    await page.mouse.down(); await page.mouse.up();
    await page.waitForTimeout(400);
  }
}
