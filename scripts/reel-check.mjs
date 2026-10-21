#!/usr/bin/env node
/**
 * QA for a finished reel, before anyone watches it:
 *
 *   node scripts/reel-check.mjs promo/out/reels/<slug>.mp4 [...]
 *
 * FAIL on: wrong size / codec / fps, duration outside 12-35 s, any black
 * span (blackdetect), a FLASH in the middle band (a jump in brightness
 * that reverses within 1-3 frames: a one-off frame of another scene, which
 * is what the old cut showed when the take itself flickered), loudness
 * off -14 LUFS by more than 2, true peak over -1 dBTP.
 * Lists the hard cuts (scdet) so they can be compared with the intended
 * scene changes. Thresholds after github.com/kajisho5/ffmpeg-skill
 * (check.py, scenes.py, _platforms.py).
 */
import { spawnSync } from "node:child_process";

const TOP = 440, AREA = 1230;
const run = args => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { maxBuffer: 1 << 28 });

let bad = 0;
for (const f of process.argv.slice(2)) {
  const out = [];
  const fail = m => { out.push("FAIL " + m); bad++; };
  const probe = JSON.parse(spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", f]).stdout.toString());
  const v = probe.streams.find(s => s.codec_type === "video");
  const a = probe.streams.find(s => s.codec_type === "audio");
  const dur = Number(probe.format.duration);
  if (v.width !== 1080 || v.height !== 1920) fail(`size ${v.width}x${v.height}`);
  if (v.codec_name !== "h264" || v.pix_fmt !== "yuv420p") fail(`video ${v.codec_name} ${v.pix_fmt}`);
  if (Math.abs(eval(v.r_frame_rate) - 30) > 0.01) fail(`fps ${v.r_frame_rate}`);
  if (!a || a.codec_name !== "aac") fail("audio is not AAC");
  if (dur < 12 || dur > 35) fail(`duration ${dur.toFixed(1)} s`);

  // brightness of the middle band per frame + scene scores, one decode
  const r = run(["-i", f, "-vf",
    `crop=1080:${AREA}:0:${TOP},scale=270:-2,signalstats,scdet=threshold=0,metadata=print:file=-,blackdetect=d=0.05:pix_th=0.10`,
    "-an", "-f", "null", "-"]);
  const txt = r.stdout.toString();
  const ys = [], sc = [], ts = [];
  for (const blk of txt.split(/frame:\d+/).slice(1)) {
    const t = /pts_time:([\d.]+)/.exec(blk);
    const y = /signalstats\.YAVG=([\d.]+)/.exec(blk);
    const s = /scd\.score=([\d.]+)/.exec(blk);
    if (!t || !y) continue;
    ts.push(Number(t[1])); ys.push(Number(y[1])); sc.push(s ? Number(s[1]) : 0);
  }
  const blacks = [...r.stderr.toString().matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)]
    .map(m => [Number(m[1]), Number(m[2])])
    // the end card is meant to be dark; only the reel's body counts
    .filter(([s]) => s < dur - 3);
  for (const [s, e] of blacks) fail(`black ${s.toFixed(2)}-${e.toFixed(2)} s`);

  // flash: a run of 1-6 frames (0.2 s) unlike the frames on both sides of it,
  // while those two sides match each other (A A B A A). Compared on small
  // grey thumbnails of the middle band: mean brightness alone misses it,
  // since canvas and editor are both dark.
  const FW = 54, FH = 62;
  const raw = spawnSync("ffmpeg", ["-v", "error", "-i", f, "-vf", `crop=1080:${AREA}:0:${TOP},scale=${FW}:${FH},format=gray`,
    "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const n = Math.floor(raw.length / (FW * FH));
  const diff = (a, b) => {
    let s = 0;
    for (let i = 0; i < FW * FH; i++) s += Math.abs(raw[a * FW * FH + i] - raw[b * FW * FH + i]);
    return s / (FW * FH);
  };
  const T = 9;
  const flashes = [];
  for (let k = 1; k < n - 4; k++) {
    for (let w = 1; w <= 6; w++) {
      const a = k - 1, b = k + w;
      if (diff(a, b) > T / 3) continue;
      let all = true;
      for (let i = k; i < k + w; i++) if (diff(i, a) < T || diff(i, b) < T) { all = false; break; }
      if (all) { flashes.push(k / 30); k += w; break; }
    }
  }
  if (flashes.length) fail(`flash at ${flashes.map(t => t.toFixed(2)).join(", ")} s`);

  // hard cuts (score > 8 and 3x the local median), for the eye
  const cuts = [];
  for (let k = 0; k < sc.length; k++) {
    const w = sc.slice(Math.max(0, k - 12), k + 13).sort((x, y) => x - y);
    const med = w[w.length >> 1];
    if (sc[k] > 8 && sc[k] > 3 * Math.max(med, 0.5)) cuts.push(ts[k].toFixed(2));
  }

  const ln = run(["-i", f, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-vn", "-f", "null", "-"]).stderr.toString();
  let lufs = null, tp = null;
  try {
    const j = JSON.parse(ln.slice(ln.lastIndexOf("{"), ln.lastIndexOf("}") + 1));
    lufs = Number(j.input_i); tp = Number(j.input_tp);
  } catch {}
  if (lufs == null || Math.abs(lufs + 14) > 2) fail(`loudness ${lufs} LUFS`);
  if (tp != null && tp > -0.5) fail(`true peak ${tp} dBTP`);

  console.log(`${out.length ? "FAIL" : "ok  "} ${f}  ${dur.toFixed(1)} s  ${lufs} LUFS  cuts: ${cuts.join(" ") || "none"}`);
  for (const l of out) console.log("     " + l);
}
process.exit(bad ? 1 : 0);
