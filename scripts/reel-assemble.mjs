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
 */
import * as nodeFs from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } = nodeFs;
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "promo", "public", "reels-take");
const BASE = process.env.VELXIO_BASE || "http://127.0.0.1:3080";
const TIDY = readFileSync(join(HERE, "reel-tidy.js"), "utf8");
// the reel's middle band (between the hook and the brand strip)
const FRAME = { w: 1080, h: 1230 };
const FPS = 30;

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const liveIdx = argv.indexOf("--live");
const LIVE_SEC = liveIdx >= 0 ? Number(argv[liveIdx + 1]) : 10;
const ids = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--live");
if (!ids.length) throw new Error("usage: reel-assemble.mjs <example-id> ...");

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
div[style*="2px solid rgb(0, 122, 204)"]{display:none!important}
.canvas-content{top:0!important;height:100%!important}
`;

const HIDE_SPICE = `(() => {
  // the SPICE status pill, and the voltage a hovered pin shows ("5.00V")
  const go = () => { for (const t of document.querySelectorAll(".canvas-world svg text"))
    if (/SPICE|^-?\d+(\.\d+)?\s?[mu]?[VA]$/.test((t.textContent || "").trim())) { const g = t.closest("g"); if (g) g.style.visibility = "hidden"; } };
  go(); setInterval(go, 200);
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
  return { boards: boards.length, parts: parts.length, wires: wireParts.length };
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
  await probe.ctx.close();
  const pad = 1.14;
  const vw = Math.ceil(Math.max(box.w * pad, box.h * pad * (FRAME.w / FRAME.h), 420));
  const vh = Math.round(vw * (FRAME.h / FRAME.w));
  const dsf = FRAME.w / vw;
  console.log(`   circuit ${Math.round(box.w)}x${Math.round(box.h)} -> viewport ${vw}x${vh} @${dsf.toFixed(2)}x`);

  // pass 2: same tidy at the filming scale, centred in the frame
  const { ctx, page, tidy } = await openTidy(browser, id, { width: vw, height: vh }, dsf);
  console.log(`   tidy ${JSON.stringify(tidy)}`);
  const b2 = await page.evaluate(CIRCUIT_BOX);
  const world = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector(".canvas-world")).transform).a || 1);
  const dx = Math.round((vw / 2 - (b2.x + b2.w / 2)) / world), dy = Math.round((vh / 2 - (b2.y + b2.h / 2)) / world);
  await page.evaluate(CENTRE, { dx, dy });

  const comps = await page.evaluate(() => window.__vx.sim.getState().components.map(c => ({ id: c.id, type: c.metadataId || c.type || "" })));
  const inputs = comps.filter(c => INPUT_RE.test(c.type));

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
    for (const inp of inputs.slice(0, 3)) {
      const at = await page.evaluate(i => {
        const el = document.getElementById(i);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, s: Math.min(r.width, r.height) };
      }, inp.id);
      if (!at) continue;
      const rec = { id: inp.id, type: inp.type, t: Date.now() / 1000 - T0, press: [] };
      beats.inputs.push(rec);
      const now = () => Date.now() / 1000 - T0;
      if (/potentiometer|slide-pot/.test(inp.type)) {
        const r = at.s * 0.28;
        const p = deg => { const a = ((deg - 90) * Math.PI) / 180; return [at.cx + r * Math.cos(a), at.cy + r * Math.sin(a)]; };
        await page.mouse.move(...p(-135), { steps: 30 });
        await page.waitForTimeout(250);
        await page.mouse.down();
        rec.press.push(now());
        for (let d = -135; d <= 135; d += 6) { await page.mouse.move(...p(d), { steps: 2 }); await page.waitForTimeout(45); }
        for (let d = 135; d >= -40; d -= 6) { await page.mouse.move(...p(d), { steps: 2 }); await page.waitForTimeout(45); }
        await page.mouse.up();
      } else {
        await page.mouse.move(at.cx, at.cy, { steps: 30 });
        await page.waitForTimeout(300);
        for (let k = 0; k < 3; k++) {
          await page.mouse.down(); rec.press.push(now()); await page.waitForTimeout(900);
          await page.mouse.up(); await page.waitForTimeout(800);
        }
        // a sensor opens its control panel: sweep its first slider
        const sl = await page.evaluate(() => {
          const el = document.querySelector(".sensor-control-panel .sensor-slider");
          if (!el) return null; const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y + r.height / 2, w: r.width };
        });
        if (sl && sl.w > 30) {
          const f = k => sl.x + 6 + (sl.w - 12) * k;
          await page.mouse.move(f(0.15), sl.y, { steps: 20 }); await page.mouse.down();
          for (const k of [0.35, 0.6, 0.85, 0.95, 0.6, 0.4]) { await page.mouse.move(f(k), sl.y, { steps: 10 }); await page.waitForTimeout(420); }
          await page.mouse.up();
        }
      }
      await page.waitForTimeout(700);
      rec.done = now();
    }
    await page.mouse.move(vw + 60, vh * 0.8, { steps: 25 });
  }
  const rest = LIVE_SEC - (Date.now() / 1000 - T0 - beats.live);
  if (rest > 0) await page.waitForTimeout(rest * 1000);
  mark("end");
  await cdp.send("Page.stopScreencast");
  await ctx.close();

  // frames -> constant 30 fps (a screencast only sends frames that changed)
  const list = [];
  for (let n = 0; n < frames.length; n++) {
    const d = (n + 1 < frames.length ? frames[n + 1] : T0 + beats.end) - frames[n];
    list.push(`file '${String(n).padStart(5, "0")}.jpg'`, `duration ${Math.max(0.001, d).toFixed(4)}`);
  }
  list.push(`file '${String(frames.length - 1).padStart(5, "0")}.jpg'`);
  writeFileSync(join(framesDir, "list.txt"), list.join("\n"));
  const offset = frames[0] - T0; // screencast clock vs ours
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", join(framesDir, "list.txt"),
    "-vf", `fps=${FPS},scale=${FRAME.w}:${FRAME.h}:force_original_aspect_ratio=decrease,pad=${FRAME.w}:${FRAME.h}:(ow-iw)/2:(oh-ih)/2:color=0x1e1e1e,format=yuv420p`,
    "-c:v", "libx264", "-crf", "16", "-preset", "medium", mp4]);
  for (const k of ["assembled", "run", "live", "end"]) beats[k] -= offset;
  for (const i of beats.inputs) {
    i.t -= offset;
    i.done -= offset;
    i.press = i.press.map(x => x - offset);
  }
  rmSync(framesDir, { recursive: true, force: true });

  // the code, whole, in the real editor
  const code = await captureCode(browser, id, join(OUT, `${id}-code.png`));
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify({ id, beats, live, tidy, inputs, code, frame: FRAME }, null, 1));
  console.log(`   ${mp4}  ${JSON.stringify(beats)}`);
}
await browser.close();

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
