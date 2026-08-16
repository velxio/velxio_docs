#!/usr/bin/env node
/**
 * Render one video per recorded rebuild take.
 *
 *   node scripts/gallery-render.mjs [slug ...]
 *
 * Reads promo/public/gallery/<slug>.json (written by gallery-record.mjs)
 * and renders promo/out/gallery/<slug>.mp4 at 1920x1080 through the
 * `gallery` Remotion composition: split intro (logo + title + the whole
 * circuit), the live footage, a lower third, and the outro card — with
 * the beat-synced soundtrack.
 *
 * Existing outputs are skipped unless --force.
 */
import { existsSync, globSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROMO = join(HERE, "..", "promo");
const TAKES = join(PROMO, "public", "rebuild");
const OUT = join(PROMO, "out", "rebuild");

const FORCE = process.argv.includes("--force");
const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const slugs = args.length
  ? args
  : globSync(`${TAKES}/*.json`)
      .map(p => p.split("/").pop().replace(/\.json$/, ""))
      .sort();

const chrome = globSync(
  `${process.env.HOME}/.cache/ms-playwright/chromium-*/chrome-linux*/chrome`
)
  .sort()
  .pop();

mkdirSync(OUT, { recursive: true });
let done = 0;
for (const slug of slugs) {
  const outFile = join(OUT, `${slug}.mp4`);
  if (!FORCE && existsSync(outFile)) {
    console.log(`skip  ${slug}`);
    done++;
    continue;
  }
  const meta = JSON.parse(readFileSync(join(TAKES, `${slug}.json`), "utf8"));
  const props = {
    slug,
    title: meta.title || slug,
    board: meta.board || "",
    description: (meta.description || "").slice(0, 140),
    parts: meta.parts || 0,
    wires: meta.wires || 0,
    beats: meta.beats || [],
    box: meta.box || null,
  };
  process.stdout.write(`render ${slug} … `);
  try {
    execFileSync(
      "npx",
      [
        "remotion",
        "render",
        "src/index.ts",
        "rebuild",
        outFile,
        "--codec",
        "h264",
        "--crf",
        "24",
        "--props",
        JSON.stringify(props),
        ...(chrome ? ["--browser-executable", chrome] : []),
      ],
      { cwd: PROMO, stdio: ["ignore", "pipe", "pipe"] }
    );
    const mb = (statSync(outFile).size / 1e6).toFixed(1);
    console.log(`ok (${mb} MB)`);
    done++;
  } catch (e) {
    const tail = (e.stderr?.toString() || e.message || "").split("\n").slice(-4).join(" ");
    console.log(`FAIL ${tail.slice(0, 220)}`);
  }
}
console.log(`\n${done}/${slugs.length} videos in promo/out/rebuild/`);
