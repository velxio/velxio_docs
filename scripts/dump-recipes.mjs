#!/usr/bin/env node
/**
 * Extract the build recipes (parts, wires, sketch) of the gallery
 * examples straight from the app's own data modules, plus the component
 * catalog, so rebuild-record.mjs can reconstruct a circuit from scratch.
 *
 *   node scripts/dump-recipes.mjs [path/to/velxio/frontend]
 *
 * Writes scripts/recipes.json and scripts/catalog.json. Only examples
 * that have parts AND wires AND whose every part exists in the catalog
 * are kept — those are the ones a video can actually rebuild.
 */
import { createRequire } from "node:module";
import { globSync, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND =
  process.argv[2] || "/home/dave/velxio-prod/velxio/frontend";
const BASE = process.env.VELXIO_BASE || "https://vstaging.moontero.com";

if (!existsSync(join(FRONTEND, "src/data")))
  throw new Error(`no src/data under ${FRONTEND}`);

const require = createRequire(join(FRONTEND, "package.json"));
const esbuild = require("esbuild");

const files = globSync(join(FRONTEND, "src/data/examples*.ts")).filter(
  f => !f.endsWith("/examples.ts")
);
const all = [];
for (const f of files) {
  try {
    const r = await esbuild.build({
      entryPoints: [f],
      bundle: true,
      format: "esm",
      write: false,
      platform: "node",
      logLevel: "silent",
      external: ["*"],
    });
    const mod = await import(
      "data:text/javascript;base64," +
        Buffer.from(r.outputFiles[0].text).toString("base64")
    );
    for (const v of Object.values(mod))
      if (Array.isArray(v))
        for (const p of v) if (p && p.id && p.components) all.push(p);
  } catch (e) {
    console.error(`skip ${f.split("/").pop()}: ${String(e).slice(0, 70)}`);
  }
}

const catalog = (await (await fetch(`${BASE}/components-metadata.json`)).json())
  .components;
const byTag = new Set(catalog.map(c => c.tagName));
const BOARD_TAGS = new Set([
  "wokwi-arduino-uno",
  "wokwi-arduino-nano",
  "wokwi-arduino-mega",
  "velxio-attiny85",
  "velxio-esp32",
  "velxio-pi-pico-w",
]);

// gallery metadata (board label, description) if it has been scanned
let gal = {};
try {
  gal = Object.fromEntries(
    JSON.parse(await readFile(join(HERE, "gallery-index.json"), "utf8")).map(x => [
      x.slug,
      x,
    ])
  );
} catch {}

const keep = all
  .filter(p => (p.components || []).length && (p.wires || []).length)
  .filter(p => (p.components || []).every(c => byTag.has(c.type) || BOARD_TAGS.has(c.type)))
  .map(p => ({
    id: p.id,
    title: gal[p.id]?.title || p.title,
    description: gal[p.id]?.description || p.description || "",
    boardLabel: gal[p.id]?.board || "",
    boardType: p.boardType || "",
    code: p.code || (p.files || [])[0]?.content || "",
    components: p.components,
    wires: p.wires,
    parts: p.components.length,
    wireCount: p.wires.length,
  }))
  .sort((a, b) => a.parts + a.wireCount - (b.parts + b.wireCount));

await writeFile(join(HERE, "recipes.json"), JSON.stringify(keep, null, 1));
await writeFile(
  join(HERE, "catalog.json"),
  JSON.stringify(
    catalog.map(c => ({ id: c.id, tagName: c.tagName, name: c.name })),
    null,
    1
  )
);
console.log(
  `${keep.length} buildable recipes -> scripts/recipes.json (${catalog.length} catalog parts)`
);
