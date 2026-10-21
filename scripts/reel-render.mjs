#!/usr/bin/env node
/**
 * Render the vertical 1080x1920 Reel / Short of recorded rebuild takes.
 *
 *   node scripts/reel-render.mjs [slug ...] [--force] [--still <sec>]
 *
 * Takes come from promo/public/rebuild/<slug>.json (rebuild-record.mjs);
 * the hook, kicker and end-card copy per slug from scripts/reels.json.
 * Output: promo/out/reels/<slug>.mp4. --still renders one PNG frame
 * instead, to check the framing before a full render.
 */
import * as nodeFs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } = nodeFs;
const HERE = dirname(fileURLToPath(import.meta.url));
const PROMO = join(HERE, "..", "promo");
const TAKES = join(PROMO, "public", "rebuild");
const OUT = join(PROMO, "out", "reels");
const COPY = JSON.parse(readFileSync(join(HERE, "reels.json"), "utf8"));

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const stillIdx = argv.indexOf("--still");
const STILL = stillIdx >= 0 ? Number(argv[stillIdx + 1]) : null;
const slugs = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--still");
const todo = slugs.length ? slugs : Object.keys(COPY);

const pw = `${process.env.HOME}/.cache/ms-playwright`;
const chrome = existsSync(pw)
  ? readdirSync(pw)
      .filter(d => d.startsWith("chromium-"))
      .sort()
      .map(d => [join(pw, d, "chrome-linux", "chrome"), join(pw, d, "chrome-linux64", "chrome")])
      .flat()
      .filter(existsSync)
      .pop()
  : null;

mkdirSync(OUT, { recursive: true });
const ASSEMBLED = join(PROMO, "public", "reels-take");
const pngSize = f => {
  const b = readFileSync(f);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};
for (const slug of todo) {
  const copy = COPY[slug] || {};
  // a gallery take from reel-assemble.mjs, or a rebuild take from rebuild-record.mjs
  const assembled = existsSync(join(ASSEMBLED, `${slug}.json`));
  const meta = JSON.parse(readFileSync(join(assembled ? ASSEMBLED : TAKES, `${slug}.json`), "utf8"));
  const composition = assembled ? "reel-assemble" : "reel";
  const codePng = join(ASSEMBLED, `${slug}-code.png`);
  const props = assembled ? {
    id: slug,
    hook: copy.hook || slug,
    kicker: copy.kicker || "",
    beats: meta.beats,
    code: meta.code && existsSync(codePng) ? { lines: meta.code.lines, ...pngSize(codePng) } : null,
    ...(copy.outro ? { outro: copy.outro } : {}),
    ...(copy.hookSize ? { hookSize: copy.hookSize } : {}),
    payoffAt: copy.payoffAt ?? busiestWindow(join(ASSEMBLED, `${slug}.mp4`), meta.beats.live + 0.8, meta.beats.end - 0.2, 2.6),
    ...(copy.liveSec != null ? { liveSec: copy.liveSec } : {}),
    ...(copy.chips ? { chips: copy.chips } : {}),
  } : {
    slug,
    hook: copy.hook || meta.title || slug,
    kicker: copy.kicker || meta.board || "",
    board: meta.board || "",
    beats: meta.beats || [],
    box: meta.box || null,
    ...(copy.hookAt != null ? { hookAt: copy.hookAt } : {}),
    ...(copy.liveAt != null ? { liveAt: copy.liveAt } : {}),
    ...(copy.liveSec != null ? { liveSec: copy.liveSec } : {}),
    ...(copy.outro ? { outro: copy.outro } : {}),
    ...(copy.chips ? { chips: copy.chips } : {}),
    ...(copy.slow ? { slow: copy.slow } : {}),
    ...(copy.wireFrom != null ? { wireFrom: copy.wireFrom } : {}),
    ...(copy.focus ? { focus: copy.focus } : {}),
    ...(copy.hookSize ? { hookSize: copy.hookSize } : {}),
  };
  const outFile = STILL != null ? join(OUT, `${slug}-${STILL}s.png`) : join(OUT, `${slug}.mp4`);
  if (STILL == null && !FORCE && existsSync(outFile)) {
    console.log(`skip  ${slug}`);
    continue;
  }
  const raw = outFile.replace(/\.mp4$/, ".raw.mp4");
  const cmd =
    STILL != null
      ? ["remotion", "still", "src/index.ts", composition, outFile, "--frame", String(Math.round(STILL * 30))]
      : ["remotion", "render", "src/index.ts", composition, raw, "--codec", "h264", "--crf", "18"];
  process.stdout.write(`${STILL != null ? "still" : "render"} ${slug} … `);
  try {
    execFileSync(
      "npx",
      [...cmd, "--props", JSON.stringify(props), ...(chrome ? ["--browser-executable", chrome] : [])],
      { cwd: PROMO, stdio: ["ignore", "pipe", "pipe"] }
    );
    if (STILL == null) {
      finish(raw, outFile);
      rmSync(raw, { force: true });
    }
    console.log(`ok (${(statSync(outFile).size / 1e6).toFixed(1)} MB)`);
  } catch (e) {
    const tail = (e.stderr?.toString() || e.message || "").split("\n").slice(-6).join(" ");
    console.log(`FAIL ${tail.slice(0, 400)}`);
  }
}

/**
 * Platform export, Reels and Shorts share it: h264 high, yuv420p, 30 fps,
 * BT.709 tags written by the encoder (an untagged screen capture gets a
 * visible colour shift if -colorspace makes ffmpeg convert it instead),
 * AAC 48 kHz, faststart, music at -14 LUFS / -1 dBTP (two-pass loudnorm).
 * Recipes from github.com/kajisho5/ffmpeg-skill (MIT): export.py,
 * loudness.py, _common/color.py.
 */
function finish(src, dst) {
  const LN = "loudnorm=I=-14:TP=-1:LRA=11";
  // pass 1 measures (the report is on stderr), pass 2 applies it linearly
  const err = spawnSync("ffmpeg", ["-hide_banner", "-i", src, "-af", `${LN}:print_format=json`, "-f", "null", "-"]).stderr.toString();
  let j = null;
  try { j = JSON.parse(err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1)); } catch {}
  // a limiter after it: linear loudnorm cannot always hold the peak, and
  // the AAC encode adds a little on top (seen: -0.24 dBTP on a -1 target)
  const af = (j
    ? `${LN}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`
    : LN) + ",alimiter=limit=0.84:level=false";
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", src,
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30",
    "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
    "-af", af, "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-movflags", "+faststart", dst]);
}

/**
 * The opening payoff: the 'len' seconds of the live part where the most
 * changes on screen (a servo sweeping, a game drawing, LEDs counting).
 * Picking it from the first button press opened DOOM on a black screen,
 * since the game was still booting.
 */
function busiestWindow(mp4, from, to, len) {
  const FW = 54, FH = 62, FPS = 10;
  const raw = spawnSync("ffmpeg", ["-v", "error", "-ss", String(from), "-to", String(to), "-i", mp4,
    "-vf", `fps=${FPS},scale=${FW}:${FH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const n = Math.floor(raw.length / (FW * FH));
  const act = [0];
  for (let k = 1; k < n; k++) {
    let s = 0;
    for (let i = 0; i < FW * FH; i++) s += Math.abs(raw[k * FW * FH + i] - raw[(k - 1) * FW * FH + i]);
    act.push(s);
  }
  const win = Math.round(len * FPS);
  let best = 0, bestAt = 0, cur = 0;
  for (let k = 0; k < n; k++) {
    cur += act[k] - (k >= win ? act[k - win] : 0);
    // ties go to the later window: the circuit has warmed up by then
    if (k >= win - 1 && cur >= best) { best = cur; bestAt = k - win + 1; }
  }
  return from + bestAt / FPS;
}
