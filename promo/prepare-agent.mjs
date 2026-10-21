#!/usr/bin/env node
/**
 * Bridge from an agent take to the "agent" composition (src/AgentPromo.tsx).
 *
 *   node prepare-agent.mjs [--take /path/to/out/agent-promo] [--offset 0]
 *
 * Reads  <take>/agent-raw.webm + <take>/agent-promo.json
 *        (produced by velxio-prod/scripts/capture-agent-promo.mjs)
 * Writes public/agent/agent-raw.webm, public/agent/boards/*, public/agent/logo.svg
 *        src/agent-data.json  (the resolved scene list: for every headline, which
 *        panel of the take to crop, which seconds of it to play, how fast)
 *
 * The scene plan is HERE, not in the TSX: the composition renders whatever
 * list this file emits, so a take with a different rhythm only changes this
 * file's arithmetic. --offset shifts every mark (seconds) if the screencast
 * started later than the recorder's clock.
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d;
};
const TAKE = opt("--take", "/home/dave/velxio-prod/out/agent-promo");
const OFFSET = Number(opt("--offset", "0"));
const PROD = opt("--prod", "/home/dave/velxio-prod");
// The recorder cannot see a display light up; it marks the first sensor
// reading on the serial line instead (serial-data), which the display shows
// at about the same time. Takes without that mark, or a display that lags
// the serial, take the second by hand: --live-start / --steer-start.
const LIVE_START = args.includes("--live-start") ? Number(opt("--live-start")) : null;
const STEER_START = args.includes("--steer-start") ? Number(opt("--steer-start")) : null;

const meta = JSON.parse(readFileSync(join(TAKE, "agent-promo.json"), "utf8"));
const marks = meta.marks.map((m) => ({ ...m, t: m.t + OFFSET }));
const dsf = Number(opt("--dsf", String(meta.dsf || 1)));

// ── assets ────────────────────────────────────────────────────────────────
mkdirSync(join(HERE, "public", "agent", "boards"), { recursive: true });
cpSync(join(PROD, "branding", "logos", "favicon.svg"), join(HERE, "public", "agent", "logo.svg"));
const BOARDS = [
  "raspberry-pi-5-canvas.webp",
  "xiao-esp32s3-sense.svg",
  "cardputer-adv-canvas.webp",
  "stm32-f4-discovery-canvas.webp",
  "pimoroni-pico-plus-2w-canvas.webp",
  "xiao-rp2350.svg",
  "m5stack-core-canvas.webp",
  "badger-2350-canvas.webp",
  "esp32-c6.svg",
  "unihiker-m10.png",
  "stellar-unicorn-canvas.webp",
  "xiao-147-touch-display-canvas.webp",
];
const boards = [];
for (const b of BOARDS) {
  const src = join(PROD, "pro", "frontend", "public", "boards", b);
  if (!existsSync(src)) continue;
  cpSync(src, join(HERE, "public", "agent", "boards", b));
  boards.push(`agent/boards/${b}`);
}

// ── marks ─────────────────────────────────────────────────────────────────
const at = (label, nth = 0) => marks.filter((m) => m.label === label)[nth]?.t;
const all = (label) => marks.filter((m) => m.label === label).map((m) => m.t);
const between = (label, a, b) => all(label).filter((t) => t >= a && t <= b);
const need = (v, what) => {
  if (v === undefined) throw new Error(`mark missing: ${what}`);
  return v;
};

const tTyping = need(at("prompt-typing"), "prompt-typing");
const tSend = need(at("prompt-send"), "prompt-send");
const tDone = need(at("agent-done"), "agent-done");
const tFollowTyping = at("follow-typing");
const tFollowSend = at("follow-send");
const tFollowDone = at("follow-done");
const tEnd = need(at("end") ?? meta.tClose, "end");

const partsT = between("part-added", tSend, tDone);
const wiresT = between("wire-added", tSend, tDone);
const simsT = between("sim-started", tSend, tDone);
const tSim = simsT[simsT.length - 1]; // the run that stayed up
const codeT = between("code-changed", tSend, tSim ?? tDone);
const msgsT = between("message", tSend, tDone);
const simsF = tFollowSend && tFollowDone ? between("sim-started", tFollowSend, tFollowDone) : [];
// first sensor reading on the serial line (recorder mark since 2026-10-08);
// the display shows the same reading at about the same moment
const tData = between("serial-data", tSend, tDone)[0];
const tDataF = tFollowSend && tFollowDone ? between("serial-data", tFollowSend, tFollowDone)[0] : undefined;
const tSimF = simsF[0];

// ── layout (CSS px of the 1680x1000 take; the TSX multiplies by dsf) ──────
const B = meta.boxes;
const box = (tag, key) => B[tag]?.[key] || B.built?.[key] || B.end?.[key] || B.start?.[key];
const canvasBox = box("built", "canvas");
const codeBox = box("built", "code");
const msgBox = box("built", "agentMessages");
const composerBox = box("start", "agentComposer");
const serialBox = box("built", "serial") || box("end", "serial");
const boardBox = box("built", "board");
const lastMessageBox = box("built", "lastMessage");
const compileCardMark = marks.find((m) => m.label === "compile-card" && m.box);
const clampBox = (b, within) => {
  const x = Math.max(within.x, b.x);
  const y = Math.max(within.y, b.y);
  const x2 = Math.min(within.x + within.w, b.x + b.w);
  const y2 = Math.min(within.y + within.h, b.y + b.h);
  return { x, y, w: x2 - x, h: y2 - y };
};
// Trim the canvas header strip (board selector, Share button) off the canvas crops
const canvasBody = { x: canvasBox.x + 8, y: canvasBox.y + 60, w: canvasBox.w - 16, h: canvasBox.h - 68 };
// The agent lays the circuit out to the right of and below the board. Two
// crops: the first build (sensor + display) and the steered one, which grew
// further right (LED + resistor at the canvas edge).
const aroundBoard = (right, bottom) =>
  boardBox
    ? clampBox({ x: boardBox.x - 110, y: boardBox.y - 90, w: boardBox.w + 110 + right, h: boardBox.h + 90 + bottom }, canvasBody)
    : canvasBody;
const circuitBox = aroundBoard(380, 300);
const circuitBoxWide = aroundBoard(560, 300);
// The payoff shots: the sensor + display row under the board (--oled-box
// x,y,w,h overrides the guess when the agent laid the parts out elsewhere),
// and the same row stretched right to where the steered build put the LED.
const parseBox = (v) => {
  if (!v) return null;
  const [x, y, w, h] = v.split(",").map(Number);
  return { x, y, w, h };
};
const oledBox =
  parseBox(opt("--oled-box")) ||
  (boardBox
    ? clampBox({ x: boardBox.x - 25, y: boardBox.y + boardBox.h + 72, w: 420, h: 168 }, canvasBody)
    : canvasBody);
const oledLedBox =
  parseBox(opt("--oled-led-box")) ||
  clampBox({ x: oledBox.x, y: oledBox.y, w: Math.max(oledBox.w, 480), h: oledBox.h }, canvasBody);
// Chat crops: the notice + prompt at the top are noise; the tool-call list
// below them is the story. The final answer is its own measured block.
// below the yellow 'chat lives in memory' notice: the prompt bubble, the
// agent's first sentence and the first tool calls
const chatTools = { x: msgBox.x + 4, y: msgBox.y + 72, w: msgBox.w - 8, h: Math.round(msgBox.h * 0.5) };
const answerFull = lastMessageBox ? clampBox({ x: lastMessageBox.x - 4, y: lastMessageBox.y - 4, w: lastMessageBox.w + 8, h: lastMessageBox.h + 8 }, msgBox) : msgBox;
// a window onto the answer about as tall as it is wide, panned down over the
// scene so the text reads at 2x instead of a whole column at 1x
const answerBox = { ...answerFull, h: Math.min(answerFull.h, Math.round(answerFull.w * 0.95)) };
const answerPan = Math.max(0, answerFull.h - answerBox.h);
// The composer without its credit chip and Send row
const promptBox = { x: composerBox.x + 10, y: composerBox.y + 10, w: composerBox.w - 20, h: Math.round(composerBox.h * 0.52) };

/** Place a crop on the 1920x1080 stage: below the headline band, inside the
 *  frame, as big as maxW/maxH allow, centred on cx. */
const fitPlace = (crop, { maxW, maxH, cx = 960, y = 215 }) => {
  const ratio = crop.h / crop.w;
  const w = Math.round(Math.min(maxW, maxH / ratio, 1920 - 80));
  return { x: Math.round(cx - w / 2), y, w };
};
const grow = (b, m) => clampBox({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m }, canvasBody);

// ── scene plan ────────────────────────────────────────────────────────────
/** window [a,b] of the take squeezed into `fit` seconds (rate >= 1). */
const squeeze = (a, b, fit, maxRate = 9) => {
  const span = Math.max(0.5, b - a);
  let rate = Math.max(1, span / fit);
  if (rate > maxRate) {
    rate = maxRate;
    a = b - fit * maxRate; // keep the END (where the result is visible)
  }
  return { start: a, end: b, rate, dur: (b - a) / rate };
};
/** window [a,b] played at rate 1 */
const span = (a, b) => ({ start: a, end: b, rate: 1, dur: b - a });

// Scenes overlap by OVERLAP seconds: the next headline and card come in
// while the previous card is still fading, so the stage is never empty.
const OVERLAP = 0.45;
const scenes = [];
let cursor = 0;
const push = (s) => {
  s.from = cursor;
  s.to = cursor + s.dur;
  cursor = s.to - OVERLAP;
  scenes.push(s);
};

push({ id: "logo", kind: "logo", dur: 3.0 });

{
  const w = squeeze(tTyping - 0.3, tSend + 0.6, 5.4, 2.0);
  push({
    id: "describe",
    kind: "cards",
    headline: ["Describe ", "what you want to build."],
    dur: w.dur + 0.6,
    cards: [{ crop: promptBox, place: fitPlace(promptBox, { maxW: 1180, maxH: 520, y: 420 }), src: w, at: 0.35, tilt: [3, -5] }],
  });
}

if (partsT.length) {
  const w = span(partsT[0] - 1.0, partsT[partsT.length - 1] + 2.4);
  push({
    id: "parts",
    kind: "cards",
    headline: ["Velxio ", "picks the parts,"],
    dur: w.dur + 0.5,
    cards: [
      { crop: grow(circuitBox, 40), place: fitPlace(grow(circuitBox, 40), { maxW: 820, maxH: 790, cx: 600, y: 215 }), src: w, at: 0.25, tilt: [2, 7] },
      { crop: chatTools, place: fitPlace(chatTools, { maxW: 560, maxH: 700, cx: 1400, y: 250 }), src: w, at: 0.5, tilt: [2, -8], dim: true },
    ],
  });
}

if (wiresT.length) {
  const w = span(wiresT[0] - 0.9, wiresT[wiresT.length - 1] + 3.2);
  push({
    id: "wires",
    kind: "cards",
    headline: ["wires ", "every pin,"],
    dur: w.dur + 0.5,
    cards: [{ crop: circuitBox, place: fitPlace(circuitBox, { maxW: 1000, maxH: 810, y: 215 }), src: w, at: 0.2, tilt: [3, -6], zoom: [1.0, 1.09] }],
  });
}

if (codeT.length) {
  // the moment the sketch first appears (later code-changed marks are the
  // agent's revisions: same editor, subtler change)
  const t = codeT.find((x) => x > (wiresT[0] ?? tSend)) ?? codeT[codeT.length - 1];
  const w = span(t - 0.5, t + 5.0);
  const codeTop = { x: codeBox.x, y: codeBox.y, w: codeBox.w, h: Math.min(codeBox.h, Math.round(codeBox.w * 1.25)) };
  push({
    id: "code",
    kind: "cards",
    headline: ["and ", "writes the firmware."],
    dur: w.dur + 0.5,
    cards: [{ crop: codeTop, place: fitPlace(codeTop, { maxW: 980, maxH: 800, y: 215 }), src: w, at: 0.25, tilt: [2, 6], pan: [0, 260] }],
  });
}

if (compileCardMark || (tSim && serialBox)) {
  // the compile progress card while the toolchain works, then the serial
  // monitor as the board boots on the fresh image
  const cards = [];
  let dur = 0;
  if (compileCardMark) {
    const cc = compileCardMark.box;
    const crop = { x: cc.x - 6, y: cc.y - 6, w: cc.w + 12, h: cc.h + 12 };
    const w = span(compileCardMark.t + 0.6, compileCardMark.t + 3.9);
    cards.push({ crop, place: fitPlace(crop, { maxW: 1040, maxH: 520, y: 400 }), src: w, at: 0.25, until: 0.25 + w.dur, tilt: [4, -4], zoom: [1.0, 1.05] });
    dur = 0.25 + w.dur;
  }
  if (tSim && serialBox) {
    const w = span(tSim + 0.4, tSim + 3.2);
    cards.push({ crop: serialBox, place: fitPlace(serialBox, { maxW: 1320, maxH: 600, y: 360 }), src: w, at: Math.max(0.25, dur - 0.25), tilt: [4, -3] });
    dur = Math.max(0.25, dur - 0.25) + w.dur;
  }
  push({ id: "compile", kind: "cards", headline: ["Compiled by the ", "real toolchain."], dur: dur + 0.4, cards });
}

if (tSim) {
  const a = LIVE_START ?? (tData ? tData - 1.6 : tSim + 4.9);
  const w = span(a, Math.min(a + 6.8, tDone + 9));
  push({
    id: "live",
    kind: "cards",
    headline: ["Real firmware, ", "running in your browser."],
    dur: w.dur + 0.5,
    cards: [{ crop: oledBox, place: fitPlace(oledBox, { maxW: 1240, maxH: 760, y: 230 }), src: w, at: 0.2, tilt: [2, -4], zoom: [1.0, 1.14] }],
  });
}

if (msgsT.length) {
  // the final answer, complete and still (agent-done is 10 s after the agent
  // went idle), panned down slowly so the whole thing reads at 2x
  const w = span(tDone - 5.8, tDone - 0.4);
  push({
    id: "explained",
    kind: "cards",
    headline: ["Every step, ", "explained."],
    dur: w.dur + 0.5,
    cards: [{ crop: answerBox, place: fitPlace(answerBox, { maxW: 820, maxH: 810, y: 215 }), src: w, at: 0.25, tilt: [2, -6], pan: [0, answerPan], zoom: [1.0, 1.0] }],
  });
}

if (tFollowTyping && tFollowSend) {
  const w = squeeze(tFollowTyping - 0.3, tFollowSend + 0.6, 4.2, 3.0);
  push({
    id: "steer",
    kind: "cards",
    headline: ["You ", "steer the build."],
    dur: w.dur + 0.5,
    cards: [{ crop: promptBox, place: fitPlace(promptBox, { maxW: 1180, maxH: 520, y: 420 }), src: w, at: 0.3, tilt: [3, -5] }],
  });
}

if (tSimF) {
  const a = STEER_START ?? (tDataF ? tDataF - 1.6 : tSimF - 1.0);
  const w = span(a, a + 7.0);
  push({
    id: "steer-result",
    kind: "cards",
    headline: ["It rebuilds, ", "reruns, and shows you."],
    dur: w.dur + 0.5,
    cards: [{ crop: oledLedBox, place: fitPlace(oledLedBox, { maxW: 1300, maxH: 760, y: 230 }), src: w, at: 0.2, tilt: [2, 5], zoom: [1.0, 1.1] }],
  });
}

const BOARD_NAMES = {
  "raspberry-pi-5-canvas.webp": "Raspberry Pi 5",
  "xiao-esp32s3-sense.svg": "XIAO ESP32S3 Sense",
  "cardputer-adv-canvas.webp": "M5Stack Cardputer",
  "stm32-f4-discovery-canvas.webp": "STM32F4 Discovery",
  "pimoroni-pico-plus-2w-canvas.webp": "Pico Plus 2 W",
  "xiao-rp2350.svg": "XIAO RP2350",
  "m5stack-core-canvas.webp": "M5Stack Core",
  "badger-2350-canvas.webp": "Badger 2350",
  "esp32-c6.svg": "ESP32-C6",
  "unihiker-m10.png": "UNIHIKER M10",
  "stellar-unicorn-canvas.webp": "Stellar Unicorn",
  "xiao-147-touch-display-canvas.webp": "XIAO 1.47 Touch",
};
push({
  id: "boards",
  kind: "boards",
  headline: ["100+ boards. ", "Arduino, ESP32, Raspberry Pi, MicroPython."],
  dur: 4.8,
  boards: boards.map((f) => ({ file: f, name: BOARD_NAMES[f.split("/").pop()] || f.split("/").pop().replace(/[-_]canvas\.\w+$|\.\w+$/g, "") })),
});
push({ id: "claim", kind: "claim", text: "A new way to build electronics.", dur: 3.0 });
push({ id: "outro", kind: "outro", dur: 3.4 });
cursor += OVERLAP; // the last scene runs to its end

// ── the cut ───────────────────────────────────────────────────────────────
// The composition only ever plays ~80 s of a 7-minute take. Rendering from
// the raw VP8 webm (one keyframe every few seconds, 3360x2000) ran at about
// 1 frame/s; cutting the used windows into one H.264 file with a keyframe
// every 15 frames makes OffthreadVideo's seeks cheap. Every card's src
// window is remapped into the cut's timeline.
let takeFile = "agent/agent-raw.webm";
if (!args.includes("--no-cut")) {
  const PAD = 0.4;
  const wins = [];
  for (const sc of scenes) for (const c of sc.cards || []) wins.push([Math.max(0, c.src.start - PAD), c.src.end + PAD]);
  wins.sort((a, b) => a[0] - b[0]);
  const segs = [];
  for (const w of wins) {
    const last = segs[segs.length - 1];
    if (last && w[0] <= last[1] + 0.2) last[1] = Math.max(last[1], w[1]);
    else segs.push([...w]);
  }
  const tmp = join(HERE, "public", "agent", "cut-tmp");
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const list = [];
  segs.forEach(([a, b], i) => {
    const f = join(tmp, `seg${i}.mp4`);
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-ss", String(a), "-t", String(b - a), "-i", join(TAKE, "agent-raw.webm"),
      "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-g", "15", "-pix_fmt", "yuv420p", "-threads", "3", f,
    ]);
    list.push(`file '${f}'`);
  });
  writeFileSync(join(tmp, "list.txt"), list.join("\n"));
  const cut = join(HERE, "public", "agent", "agent-cut.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", join(tmp, "list.txt"), "-c", "copy", cut]);
  // measure the real segment lengths (frame-accurate cuts can differ by a frame)
  let offset = 0;
  const map = segs.map(([a, b], i) => {
    const f = join(tmp, `seg${i}.mp4`);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
    const m = { a, b, offset };
    offset += d;
    return m;
  });
  for (const sc of scenes)
    for (const c of sc.cards || []) {
      const m = map.find((x) => c.src.start >= x.a - 0.01 && c.src.end <= x.b + 0.01);
      if (!m) throw new Error(`window ${c.src.start}-${c.src.end} not inside a cut segment`);
      c.src = { ...c.src, start: m.offset + (c.src.start - m.a), end: m.offset + (c.src.end - m.a), rawStart: c.src.start };
    }
  rmSync(tmp, { recursive: true, force: true });
  takeFile = "agent/agent-cut.mp4";
  console.log(`cut: ${segs.length} segments, ${offset.toFixed(1)}s -> public/agent/agent-cut.mp4`);
} else {
  cpSync(join(TAKE, "agent-raw.webm"), join(HERE, "public", "agent", "agent-raw.webm"));
}

// Soundtrack: a calmer track than the main promo's house beat. --audio-start
// is where the music begins (its first real beat, so t=0 lands on a downbeat;
// detect-beats.py prints it), --audio-volume the level under the cards.
const audio = {
  file: opt("--audio", "soundtrack-riverflow.mp3"),
  start: Number(opt("--audio-start", "0")),
  volume: Number(opt("--audio-volume", "0.5")),
};

const data = {
  fps: 30,
  width: 1920,
  height: 1080,
  audio,
  take: { width: meta.viewport.width * dsf, height: meta.viewport.height * dsf, dsf, file: takeFile },
  prompt: meta.prompt,
  follow: meta.follow,
  totalSec: cursor,
  scenes,
};
writeFileSync(join(HERE, "src", "agent-data.json"), JSON.stringify(data, null, 2));
console.log(
  scenes.map((s) => `${s.id.padEnd(13)} ${s.from.toFixed(1).padStart(5)} -> ${s.to.toFixed(1).padStart(5)}s` +
    (s.cards ? `  take ${(s.cards[0].src.rawStart ?? s.cards[0].src.start).toFixed(1)}s x${s.cards[0].src.rate.toFixed(1)}` : "")).join("\n")
);
console.log(`total ${cursor.toFixed(1)}s, ${boards.length} boards`);
