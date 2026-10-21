/**
 * The cards of a reel's parts tour: what each board / part TYPE is, in a
 * title and up to three short lines.
 *
 * Sources, best first:
 *   1. scripts/part-facts.json   hand-checked datasheet lines, for the common parts
 *   2. scripts/part-cards.json   a cache of cards DeepSeek wrote, one per type,
 *                                written once and reused by every reel after
 *
 * A missing type is written from what the APP knows about it, nothing else:
 * the picker metadata (name, category, description), its pins and the buses
 * they carry (read live by reel-assemble.mjs), the hand-written datasheet
 * from component-docs/ when there is one, the board blurb from the picker
 * and the board's docs page. A card is rejected when it carries a number
 * none of those sources has: that is what keeps "8 MB PSRAM" off a board
 * that has none. New cards land with reviewed:false so a person can skim them.
 *
 *   node scripts/reel-cards.mjs --list      cards not reviewed yet
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { askJson, STYLE, styleErrors } from "./deepseek.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.VELXIO_SRC || "/home/dave/velxio-prod/velxio";
const FACTS = JSON.parse(readFileSync(join(HERE, "part-facts.json"), "utf8"));
const CACHE_FILE = join(HERE, "part-cards.json");
const cache = () => (existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, "utf8")) : {});

const norm = t => String(t || "").replace(/^(wokwi|velxio)-/, "");
function curated(stop) {
  const table = stop.kind === "board" ? FACTS.boards : FACTS.parts;
  const hit = Object.entries(table).find(([k]) => norm(k) === norm(stop.type));
  let e = hit?.[1];
  if (e?.same) e = table[e.same];
  return e ? { title: e.name, lines: e.lines, source: "curated", reviewed: true } : null;
}

// the picker's one-line board blurbs: BOARD_DESCRIPTIONS in ComponentPickerModal.tsx
let blurbs;
function boardBlurb(kind) {
  if (!blurbs) {
    blurbs = {};
    const f = join(SRC, "frontend/src/components/ComponentPickerModal.tsx");
    if (existsSync(f)) {
      const body = /BOARD_DESCRIPTIONS[^{]*\{([\s\S]*?)\n\};/.exec(readFileSync(f, "utf8"))?.[1] || "";
      for (const m of body.matchAll(/^\s*'?([\w-]+)'?:\s*'([^']*)'/gm)) blurbs[m[1]] = m[2];
    }
  }
  return blurbs[kind];
}

function docsAbout(kind) {
  const f = join(HERE, "..", "src/content/docs/boards/reference", `${kind}.md`);
  if (!existsSync(f)) return undefined;
  const m = /## About this board\s+([\s\S]*?)(\n## |$)/.exec(readFileSync(f, "utf8"));
  return m?.[1].replace(/\s+/g, " ").slice(0, 900);
}

function datasheet(type) {
  const root = join(SRC, "frontend/src/components/component-docs");
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const f = join(root, d.name, `${norm(type)}.md`);
    if (existsSync(f)) return readFileSync(f, "utf8").replace(/^---[\s\S]*?---/, "").slice(0, 1500);
  }
}

/** Everything the app holds about one stop, as the model will see it. */
export function factsOf(stop) {
  const f = { ...stop.facts };
  delete f.libraries;
  if (stop.kind === "board") {
    f.pickerBlurb = boardBlurb(stop.type);
    f.docsPage = docsAbout(stop.type);
    // the build Velxio uses unless a project changes it (types/boardOptions.ts)
    // the C3 and C6 top out at 160 MHz, the H2 at 96
    const mhz = /c3|c6/.test(stop.type) ? 160 : /h2/.test(stop.type) ? 96 : 240;
    if (/esp32/.test(stop.type)) f.velxioDefaultBuild = `4 MB flash, PSRAM disabled, CPU ${mhz} MHz`;
  } else {
    f.datasheet = datasheet(stop.type);
  }
  f.pins = (f.pins || []).map(p => (p.bus ? `${p.name} (${p.bus})` : p.name)).join(", ");
  return f;
}

const numbers = s => (String(s).match(/\d+(?:\.\d+)?/g) || []);
function cardErrors(card, facts, where) {
  const errs = [];
  if (!card || typeof card.title !== "string" || !Array.isArray(card.lines)) return [`${where}: needs {title, lines[]}`];
  if (card.lines.length < 1 || card.lines.length > 3) errs.push(`${where}: 1 to 3 lines`);
  const src = JSON.stringify(facts);
  for (const l of [card.title, ...card.lines]) {
    if (l.length > 34) errs.push(`${where}: "${l}" is over 34 characters`);
    for (const n of numbers(l)) if (!src.includes(n)) errs.push(`${where}: "${n}" in "${l}" is not in the facts`);
    errs.push(...styleErrors(l, where));
  }
  return errs;
}

const SYSTEM = `You write the info cards of a short electronics video. Each card names one board or part and gives up to 3 short fact lines (max 34 characters each, title max 34).
Use ONLY the facts given for that item. Never add a number (memory size, clock, voltage, range, count) that does not appear in its facts; if the facts have few numbers, write plain descriptive lines instead (what it is, which bus it talks on, what it is used for).
Pick the facts a maker cares about: for a board, chip/core, memory, radio, notable buses; for a part, what it measures or shows, the bus or signal it uses.
${STYLE}
Answer as JSON: {"cards": {"<type>": {"title": "...", "lines": ["...", "..."]}}}`;

/** Make sure every stop has a card; writes new ones to the cache. */
export async function ensureCards(stops) {
  const have = cache();
  const missing = stops.filter(s => !curated(s) && !have[s.type]);
  const uniq = [...new Map(missing.map(s => [s.type, s])).values()];
  if (!uniq.length) return;
  const items = Object.fromEntries(uniq.map(s => [s.type, { kind: s.kind, facts: factsOf(s) }]));
  let errs = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const user = JSON.stringify(items) + (errs.length ? `\n\nYour last answer was rejected:\n- ${errs.join("\n- ")}\nFix those cards.` : "");
    const out = await askJson(SYSTEM, user, { temperature: 0.2 });
    errs = [];
    for (const s of uniq) {
      // the model sometimes keys a card by the bare name ("hx711" for "wokwi-hx711")
      const c = out.cards?.[s.type] ?? out.cards?.[norm(s.type)] ?? (uniq.length === 1 ? Object.values(out.cards || {})[0] : undefined);
      const e = cardErrors(c, items[s.type].facts, s.type);
      if (e.length) { errs.push(...e); console.log(`   card rejected: ${e.join("; ")}`); continue; }
      have[s.type] = { title: c.title, lines: c.lines, source: "llm", reviewed: false };
      delete items[s.type];
    }
    writeFileSync(CACHE_FILE, JSON.stringify(have, null, 1) + "\n");
    if (!Object.keys(items).length) return;
  }
  // a type that never passed gets its picker name alone: a card with no facts beats a wrong one
  for (const s of uniq) if (!have[s.type]) have[s.type] = { title: s.facts?.name || norm(s.type), lines: [], source: "fallback", reviewed: false };
  writeFileSync(CACHE_FILE, JSON.stringify(have, null, 1) + "\n");
}

export function cardOf(stop) {
  return curated(stop) || cache()[stop.type] || { title: stop.facts?.name || norm(stop.type), lines: [] };
}

/**
 * The tour prop for the composition: the boards first, then the parts in the
 * order the copy gives (the order the sketch uses them), at most `max` stops.
 */
export function tourProp(take, copy, max = 5) {
  const stops = take.tour?.stops || [];
  if (!stops.length || copy.tour === false) return null;
  const order = copy.tourOrder || [];
  const rank = s => (s.kind === "board" ? -1 : order.includes(s.type) ? order.indexOf(s.type) : 100);
  const picked = [...stops].sort((a, b) => rank(a) - rank(b)).slice(0, copy.tourMax ?? max);
  return {
    vw: take.tour.vw,
    vh: take.tour.vh,
    stops: picked.map(s => {
      const c = cardOf(s);
      return { rect: s.rect, title: c.title, count: s.count, lines: c.lines, ...(copy.roles?.[s.type] ? { role: copy.roles[s.type] } : {}) };
    }),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes("--list")) {
  for (const [t, c] of Object.entries(cache())) if (!c.reviewed) console.log(`${t.padEnd(32)} ${c.title} | ${c.lines.join(" | ")}`);
}
