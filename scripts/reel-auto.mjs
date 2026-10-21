#!/usr/bin/env node
/**
 * A finished reel from any gallery example, unattended. One LLM call writes
 * the words (DeepSeek, JSON mode, no tools, no agent); everything else is
 * the fixed pipeline:
 *
 *   1. read the example from the app's own example data (examples.ts)
 *   2. DeepSeek reads the sketch and the circuit and returns the script:
 *      hook, kicker, chips, WHICH inputs to work and in WHAT ORDER (the order
 *      the sketch reads them, with a wait where it shows a prompt first), how
 *      long to let it run, the order of the parts tour and one line per part
 *      on what it does here, plus the Instagram caption and the Shorts title.
 *      The answer is validated (ids exist, lengths, no emoji / dash) and sent
 *      back once with the errors if it fails.
 *   3. reel-assemble.mjs records the take
 *   4. reel-cards.mjs makes sure every part type in the tour has its card
 *   5. reel-render.mjs renders, reel-check.mjs checks; too long -> shorter
 *      live part and fewer tour stops, rendered again
 *
 *   node scripts/reel-auto.mjs <example-id> ... [--force]
 *   node scripts/reel-auto.mjs --pick 5          the 5 best-scoring examples not done yet
 *
 * Output: promo/out/reels/<id>.mp4 + <id>.txt (captions), the copy in
 * promo/public/reels-copy/<id>.json. Env: VELXIO_BASE as for reel-assemble.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { askJson, STYLE, styleErrors } from "./deepseek.mjs";
import { ensureCards } from "./reel-cards.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROMO = join(HERE, "..", "promo");
const COPY_DIR = join(PROMO, "public", "reels-copy");
const TAKES = join(PROMO, "public", "reels-take");
const OUT = join(PROMO, "out", "reels");
const SRC = process.env.VELXIO_SRC || "/home/dave/velxio-prod/velxio";
const PRO = process.env.VELXIO_PRO || "/home/dave/velxio-prod/pro/frontend/src/pro";

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const pickIdx = argv.indexOf("--pick");
const ids = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--pick");

// parts a pointer can work during the run (reel-assemble knows how)
const INPUT_RE = /pushbutton|button|potentiometer|slide-pot|joystick|slide-switch|dht|ultrasonic|hc-sr04|photoresistor|ldr|pir|ntc|keypad|encoder|gas-sensor|sound-sensor|heart-beat/;
// parts that SHOW something change on the canvas; an example with none of
// them makes a reel where nothing moves (l293d-speed-pwm: the driver with no motor drawn)
const OUTPUT_RE = /(^|-)led|neopixel|ssd1306|ili9341|st7789|lcd|epaper|7segment|servo|stepper-motor|dc-motor|buzzer|matrix|tm1637/;
// boards the embed cannot run unattended: Linux guests (QEMU on the backend, paid)
const SKIP_BOARD = /^raspberry-pi-[0-9]|^raspberry-pi-zero|unihiker/;

/** The gallery as the app ships it: examples.ts bundled with esbuild. */
async function examples() {
  const cacheFile = join(COPY_DIR, ".examples.json");
  if (existsSync(cacheFile) && !argv.includes("--refresh")) return JSON.parse(readFileSync(cacheFile, "utf8"));
  const FE = join(SRC, "frontend");
  const req = createRequire(join(FE, "package.json"));
  const esbuild = req("esbuild");
  const fs = await import("node:fs");
  const r = await esbuild.build({
    entryPoints: [join(FE, "src/data/examples.ts")], bundle: true, format: "esm", write: false, platform: "neutral", logLevel: "error",
    loader: { ".svg": "text", ".png": "dataurl", ".jpg": "dataurl" },
    alias: { "@pro": PRO },
    plugins: [{ name: "raw", setup(b) {
      b.onResolve({ filter: /\?raw$/ }, a => ({ path: resolve(a.resolveDir, a.path.replace(/\?raw$/, "")), namespace: "raw" }));
      b.onLoad({ filter: /.*/, namespace: "raw" }, a => ({ contents: fs.readFileSync(a.path, "utf8"), loader: "text" }));
    } }],
  });
  const m = await import("data:text/javascript;base64," + Buffer.from(r.outputFiles[0].text).toString("base64"));
  mkdirSync(COPY_DIR, { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(m.exampleProjects));
  return m.exampleProjects;
}

const boardsOf = ex => (ex.boards?.length ? ex.boards.map(b => b.boardKind) : ex.boardType ? [ex.boardType] : []);
const sourceOf = ex => {
  const files = ex.files?.length ? ex.files : ex.boards?.find(b => b.code) ? [{ name: "sketch.ino", content: ex.boards.find(b => b.code).code }] : [{ name: "sketch.ino", content: ex.code || "" }];
  // the entry file first, then the rest, capped: a 34-file project still fits
  return files.map(f => `// ===== ${f.name}\n${f.content}`).join("\n\n").slice(0, 14000);
};

/** Why an example cannot be filmed unattended, or null. */
function unfit(ex) {
  if (ex.languageMode && ex.languageMode !== "arduino") return `language ${ex.languageMode}`;
  if (boardsOf(ex).some(b => SKIP_BOARD.test(b))) return "Linux board";
  if (!sourceOf(ex).replace(/\/\/[^\n]*/g, "").trim()) return "no code";
  if (!(ex.components || []).length && !boardsOf(ex).length) return "empty circuit";
  if (!(ex.components || []).some(c => OUTPUT_RE.test(c.metadataId || c.type || ""))) return "nothing on the canvas shows the result";
  return null;
}

/** For --pick: what makes a reel worth watching, from the circuit alone. */
function score(ex) {
  const types = (ex.components || []).map(c => c.metadataId || c.type || "");
  let s = 0;
  if (types.some(t => /ssd1306|ili9341|lcd|epaper|7segment|neopixel|led-bar/.test(t))) s += 4;
  if (types.some(t => /servo|stepper|motor/.test(t))) s += 3;
  // something for the pointer to do makes the best reels
  s += Math.min(4, types.filter(t => INPUT_RE.test(t)).length * 2);
  if (new Set(types).size >= 3) s += 1;
  if (types.length > 14) s -= 2; // dense: hard to read on a phone
  if (/esp32|pico|stm32/.test(boardsOf(ex).join())) s += 0.5;
  return s;
}

const SYSTEM = `You write the script of a 25-40 second vertical video (Instagram Reel / YouTube Short) that shows one electronics project running in Velxio, a free circuit simulator that runs in the browser.
The video, in order: a 2.6 s payoff shot of the project running; the circuit assembling itself; a tour of the parts with an info card each; the code scrolling; Run; a pointer working the inputs.

The COMPONENTS list is everything drawn on the canvas: a part the code drives but that is not in the list (a motor behind a driver chip, a speaker) will NOT be seen. The hook, chips and caption must be about what visibly changes on the canvas (a display, LEDs, a servo), never about something off-canvas.
Read the SKETCH carefully. Everything you claim must be true of THIS code and THIS circuit: if the code maps light to brightness inversely, say so; if it only blinks, do not say it reacts. Never invent features.

Return JSON with:
- "visible": true if what the sketch does shows ON THE CANVAS (a display draws, LEDs light, a servo turns), false if its result only goes to the serial monitor. When false, the other fields can be empty.
- "hook": the line at the top for the whole video, 2 short lines separated by "\\n", max 30 characters per line. Concrete and curious, about what the viewer will SEE happen (e.g. "Turn the knob.\\nThe servo follows."). No questions that the video does not answer.
- "kicker": one line under it, max 44 characters: board + the key parts or library.
- "chips": short step labels (max 18 characters each): {"build", "tour", "code", "run", "input"}. "input" says what the pointer does ("Press it", "Change the light").
- "inputs": the interactive parts the pointer works, in the order the SKETCH reacts to them, as [{"id": "<component id>", "wait": <seconds to wait before touching it, 0 unless the sketch shows a splash or prompt first, max 6>}]. Only ids from INTERACTIVE. At most 4. Leave out an input the code never reads. Empty list if none.
- "liveSec": seconds of the running project to show, 8 to 16 (longer for several inputs or slow visuals).
- "tourOrder": the part TYPES (from PARTS) in the order the sketch uses them (what setup() starts first, then the loop). Omit wires-only passives if there are more than 4 types.
- "roles": {"<type>": "what it does in THIS sketch, max 40 characters"} for each type in tourOrder and for the board type.
- "igCaption": Instagram caption body, 2-4 short sentences, no hashtags, no link (both are added after it).
- "hashtags": 5-8 hashtags without the "#", the first one "velxio".
- "ytTitle": YouTube Shorts title, max 70 characters, ends with " #shorts".
- "ytDescription": 2-3 sentences plus "Open it in your browser: https://velxio.dev/example/<example id>".
${STYLE}`;

function validate(s, ex, interactive, types) {
  const e = [];
  const lines = String(s.hook || "").split("\n");
  if (lines.length < 1 || lines.length > 3) e.push("hook: 1 to 3 lines");
  for (const l of lines) if (l.length > 32) e.push(`hook line "${l}" is over 30 characters`);
  if (!s.kicker || s.kicker.length > 48) e.push("kicker: required, max 44 characters");
  for (const [k, v] of Object.entries(s.chips || {})) if (String(v).length > 20) e.push(`chips.${k} is over 18 characters`);
  if (!Array.isArray(s.inputs)) e.push("inputs must be a list");
  for (const i of s.inputs || []) if (!interactive.some(c => c.id === i.id)) e.push(`inputs: "${i.id}" is not in INTERACTIVE`);
  if (!(s.liveSec >= 6 && s.liveSec <= 18)) e.push("liveSec must be 8 to 16");
  for (const t of s.tourOrder || []) if (!types.includes(t)) e.push(`tourOrder: "${t}" is not in PARTS`);
  for (const [k, v] of Object.entries(s.roles || {})) if (String(v).length > 46) e.push(`roles.${k} is over 40 characters`);
  if (/#/.test(s.igCaption || "")) e.push("igCaption: no hashtags in the body, they go in \"hashtags\"");
  if (!Array.isArray(s.hashtags) || s.hashtags.length < 3) e.push("hashtags: a list of 5-8");
  if (!/#shorts$/.test(s.ytTitle || "") || s.ytTitle.length > 80) e.push('ytTitle: max 70 characters, ending in " #shorts"');
  for (const k of ["hook", "kicker", "igCaption", "ytTitle", "ytDescription"]) e.push(...styleErrors(String(s[k] || ""), k));
  for (const [k, v] of Object.entries(s.roles || {})) e.push(...styleErrors(String(v), `roles.${k}`));
  return e;
}

/** Share of frames (10 fps) in the live part where something on the canvas
 *  changed. Calibrated on the first takes: a scanner that only prints to
 *  serial scored 0.000, OLED counters and the raycaster 0.11 to 0.19. */
function liveActivity(id, from, to) {
  const FW = 216, FH = 246;
  const raw = spawnSync("ffmpeg", ["-v", "error", "-ss", String(from), "-to", String(to), "-i", join(TAKES, `${id}.mp4`),
    "-vf", `fps=10,scale=${FW}:${FH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const n = Math.floor(raw.length / (FW * FH));
  let moving = 0;
  for (let k = 1; k < n; k++) {
    let c = 0;
    for (let i = 0; i < FW * FH && c < 4; i++) if (Math.abs(raw[k * FW * FH + i] - raw[(k - 1) * FW * FH + i]) > 24) c++;
    if (c >= 4) moving++;
  }
  return moving / Math.max(1, n - 1);
}

async function script(ex) {
  const comps = (ex.components || []).map(c => ({ id: c.id, type: c.metadataId || c.type, props: c.properties }));
  const interactive = comps.filter(c => INPUT_RE.test(c.type || ""));
  const types = [...new Set(comps.map(c => c.type))];
  const wires = (ex.wires || []).map(w => `${w.start?.componentId}:${w.start?.pinName} -> ${w.end?.componentId}:${w.end?.pinName}`);
  const user = [
    `EXAMPLE ID: ${ex.id}`,
    `TITLE: ${ex.title}`,
    `DESCRIPTION: ${ex.description || ""}`,
    `BOARDS: ${boardsOf(ex).join(", ")}`,
    `PARTS (types): ${JSON.stringify(types)}`,
    `COMPONENTS: ${JSON.stringify(comps)}`,
    `INTERACTIVE: ${JSON.stringify(interactive.map(c => ({ id: c.id, type: c.type })))}`,
    `WIRES:\n${wires.join("\n")}`,
    `SKETCH:\n${sourceOf(ex)}`,
  ].join("\n\n");
  let errs = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const s = await askJson(SYSTEM, user + (errs.length ? `\n\nYour last answer was rejected:\n- ${errs.join("\n- ")}\nReturn the whole JSON again, fixed.` : ""), { maxTokens: 2500 });
    if (s.visible === false) return s;
    errs = validate(s, ex, interactive, types);
    if (!errs.length) return s;
    console.log(`   script rejected: ${errs.join("; ")}`);
  }
  throw new Error("no valid script after 3 tries");
}

const node = (args, opts = {}) => spawnSync(process.execPath, args, { cwd: join(HERE, ".."), encoding: "utf8", ...opts });

const all = await examples();
let todo = ids;
if (pickIdx >= 0) {
  const n = Number(argv[pickIdx + 1]) || 3;
  todo = all.filter(ex => !unfit(ex) && (FORCE || !existsSync(join(OUT, `${ex.id}.mp4`))))
    .sort((a, b) => score(b) - score(a))
    // one example per circuit: the same OLED counter on three boards is one reel
    .filter((ex, i, arr) => {
      const sig = ex2 => [...new Set((ex2.components || []).map(c => c.metadataId || c.type))].sort().join();
      return arr.findIndex(o => sig(o) === sig(ex)) === i;
    })
    .slice(0, n).map(ex => ex.id);
}
if (!todo.length) throw new Error("usage: reel-auto.mjs <example-id> ... | --pick <n>");

const report = [];
for (const id of todo) {
  const ex = all.find(e => e.id === id);
  console.log(`== ${id}`);
  if (!ex) { report.push([id, "FAIL", "not in the gallery"]); continue; }
  const why = unfit(ex);
  if (why) { report.push([id, "SKIP", why]); console.log(`   skip: ${why}`); continue; }
  try {
    // 1. the words
    const copyFile = join(COPY_DIR, `${id}.json`);
    let s;
    if (existsSync(copyFile) && !FORCE) s = JSON.parse(readFileSync(copyFile, "utf8"));
    else {
      s = await script(ex);
      mkdirSync(COPY_DIR, { recursive: true });
      writeFileSync(copyFile, JSON.stringify(s, null, 1) + "\n");
    }
    if (s.visible === false) { report.push([id, "SKIP", "its result only shows on the serial monitor"]); console.log("   skip: serial only"); continue; }
    console.log(`   hook: ${s.hook.replace(/\n/g, " / ")}  inputs: ${(s.inputs || []).map(i => i.id + (i.wait ? `+${i.wait}s` : "")).join(", ") || "none"}`);

    // 2. the take
    const rec = node(["scripts/reel-assemble.mjs", id, "--live", String(Math.ceil(s.liveSec + 4)), "--force"], { stdio: "inherit" });
    if (rec.status !== 0) throw new Error("recording failed");
    const take = JSON.parse(readFileSync(join(TAKES, `${id}.json`), "utf8"));
    if (!take.live) throw new Error("the sketch never started in the embed");
    // the pointer itself moves pixels, so with inputs this only catches a dead take
    const act = liveActivity(id, take.beats.live + 1, take.beats.end);
    console.log(`   canvas activity while live: ${act.toFixed(3)}`);
    if (act < 0.03) { report.push([id, "SKIP", `nothing on the canvas changes while it runs (${act.toFixed(3)})`]); continue; }

    // 3. the cards
    await ensureCards(take.tour?.stops || []);

    // 4. render + check, shortening until it passes
    let verdict = "";
    for (const shrink of [0, 1, 2]) {
      if (shrink) {
        s.liveSec = Math.max(7, s.liveSec - 4);
        s.tourMax = Math.max(2, 5 - shrink);
        writeFileSync(copyFile, JSON.stringify(s, null, 1) + "\n");
      }
      const r = node(["scripts/reel-render.mjs", id, "--force"]);
      process.stdout.write(r.stdout);
      const chk = node(["scripts/reel-check.mjs", join("promo/out/reels", `${id}.mp4`)]);
      verdict = chk.stdout.trim();
      console.log("   " + verdict.replace(/\n/g, "\n   "));
      if (chk.status === 0) break;
      if (!/duration/.test(verdict)) break; // a flash or a black span will not shrink away
    }
    writeFileSync(join(OUT, `${id}.txt`), [
      `INSTAGRAM\n${s.igCaption.trim()}\n\nTry it free at velxio.dev (link in bio)\n\n${(s.hashtags || []).map(h => "#" + String(h).replace(/^#/, "").replace(/\s+/g, "")).join(" ")}`,
      `YOUTUBE SHORTS\nTitle: ${s.ytTitle}\n\n${s.ytDescription}`,
    ].join("\n\n") + "\n");
    report.push([id, /^ok/.test(verdict) ? "OK" : "CHECK", verdict.split("\n")[0]]);
  } catch (e) {
    report.push([id, "FAIL", e.message]);
    console.log(`   FAIL ${e.message}`);
  }
}
console.log("\n" + report.map(r => r.join("  ")).join("\n"));
process.exit(report.some(r => r[1] === "FAIL") ? 1 : 0);
