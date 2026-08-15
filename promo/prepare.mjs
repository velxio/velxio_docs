#!/usr/bin/env node
/**
 * Bridge from the raw take to the Remotion composition:
 *  - copies scripts/promo-raw.webm into promo/public/
 *  - reads scripts/promo-events.json and computes the two video segments
 *    (the compile wait between `run` and `sim-started` is spliced out)
 *  - writes src/data.json with composition-time events
 */
import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(HERE, "..", "scripts");

cpSync(join(SCRIPTS, "promo-raw.webm"), join(HERE, "public", "promo-raw.webm"));
const events = JSON.parse(readFileSync(join(SCRIPTS, "promo-events.json"), "utf8"));
const byLabel = Object.fromEntries(events.map(e => [e.label, e]));

const sec = ms => ms / 1000;
const tStart = sec(byLabel["start"].t); // modal visible, chat minimized
const tRun = sec(byLabel["run"].t);
const tSim = sec(byLabel["sim-started"].t);
const tEnd = sec(byLabel["end"].t);

const segA = { from: Math.max(0, tStart - 0.2), to: tRun + 2.5 };
const segB = { from: Math.max(tSim - 0.8, segA.to), to: tEnd };
const compTime = t =>
  t <= segA.to
    ? Math.max(0, t - segA.from)
    : segA.to - segA.from + Math.max(0, t - segB.from);

const data = {
  fps: 30,
  width: 1280,
  height: 720,
  segA,
  segB,
  events: events.map(e => ({ ...e, ct: compTime(sec(e.t)) })),
};
writeFileSync(join(HERE, "src", "data.json"), JSON.stringify(data, null, 2));
console.log(
  `segments: A ${segA.to.toFixed(1)}s + B ${(segB.to - segB.from).toFixed(1)}s (cut ${(segB.from - segA.to).toFixed(0)}s of compile wait)`
);
