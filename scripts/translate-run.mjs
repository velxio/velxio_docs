#!/usr/bin/env node
/**
 * Process translation jobs from the queue (default 1; pass a count).
 *
 *   DEEPSEEK_API_KEY=... node scripts/translate-run.mjs [n]
 *
 * Ported from velxio_blog: DeepSeek first, Gemini fallback, one LLM call
 * per job. Differences for the Starlight docs:
 *   - identity is the file path (no translationKey);
 *   - after translation, two deterministic rewrites run OUTSIDE the LLM:
 *       internal links  ](/docs/...   -> ](/docs/<locale>/...
 *       image paths     ../../../assets/ -> ../../../../assets/
 *     (locale copies live one directory deeper than the source).
 *
 * Env: DEEPSEEK_API_KEY and/or GEMINI_API_KEY (at least one),
 *      LLM_ORDER, DEEPSEEK_MODEL, GEMINI_MODEL, RETRY_BACKOFF_MS.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { GoogleGenAI } from "@google/genai";

import { HOUR_MS, loadQueue, saveQueue, pickNextJob } from "./translate/queue.mjs";
import { callDeepSeek, DeepSeekError } from "./translate/deepseek.mjs";

const LOCALE_NAMES = {
  en: "English",
  es: "Spanish",
  "pt-br": "Brazilian Portuguese",
  it: "Italian",
  fr: "French",
  "zh-cn": "Simplified Chinese",
  de: "German",
  ja: "Japanese",
  ru: "Russian",
};
const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";

const isoIn = ms => new Date(Date.now() + ms).toISOString();

function cleanModelOutput(text) {
  if (!text) return "";
  let t = text.trim();
  const m = /^```(?:markdown|md)?\r?\n([\s\S]*?)\r?\n```$/.exec(t);
  if (m) t = m[1].trim();
  return t.endsWith("\n") ? t : t + "\n";
}

const hasValidFrontmatter = s => /^---\r?\n[\s\S]+?\r?\n---(\r?\n|$)/.test(s);

function buildPrompt({ targetLocale, content }) {
  const targetName = LOCALE_NAMES[targetLocale] ?? targetLocale;
  return `You are a professional technical translator working on the user documentation of an electronics simulator.

Translate the following Starlight/Markdown documentation page from English to ${targetName}.

CRITICAL RULES — follow ALL of them:

0. The YAML frontmatter MUST remain valid YAML:
   - Translate ONLY the values of "title" and "description".
   - If a translated value would contain a colon ":", wrap the whole value in double quotes.
   - Leave every other frontmatter line EXACTLY as-is, character-for-character — especially the "sidebar:" block ("order", "badge", "label").
   - Do NOT add or remove frontmatter fields or blank lines.
1. Preserve all Markdown structure: headings, lists, tables, blockquotes, bold/italics, admonitions like :::caution ... ::: (translate the text inside, keep the ::: markers and the keyword "caution"/"note"/"tip" untranslated).
2. NEVER translate or modify content inside fenced code blocks (\`\`\`...\`\`\`) or inline code (\`code\`). Keyboard keys like **Ctrl+B** stay as-is.
3. URLs and link targets must remain byte-identical (link TEXT may be translated). Image paths must remain byte-identical; image alt text may be translated.
4. Keep proper nouns and product terms unchanged: Velxio, Velxio-GUEST, Arduino, MicroPython, ESP-IDF, ESP32, RP2040, STM32, Raspberry Pi, Pico, XIAO, M5Stack, Cardputer, BadgeOS, Starlight, GitHub, WiFi, MQTT, GPIO, PWM, I2C, SPI, UART.
5. UI element names shown in **bold** (button labels like **Run**, **Stop**, **Add**, **Libraries**, **Serial**, **Scope**) must stay in English — the app UI the reader sees may be English; you may add a short translation in parentheses the first time one appears.
6. Output ONLY the full translated file (frontmatter first, then body). No code fences around the output, no commentary.

----- BEGIN PAGE -----
${content}
----- END PAGE -----`;
}

/** Deterministic post-pass: relocate internal links and asset paths for a
 *  page that now lives one level deeper under /<locale>/. */
function relocate(content, locale) {
  return content
    .replaceAll("](/docs/", `](/docs/${locale}/`)
    .replaceAll(`](/docs/${locale}/${locale}/`, `](/docs/${locale}/`) // idempotency guard
    .replaceAll("](../../../assets/", "](../../../../assets/");
}

async function tryProvider(name, prompt) {
  let raw;
  if (name === "deepseek") {
    if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY not set");
    raw = await callDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY, prompt });
  } else if (name === "gemini") {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      contents: prompt,
    });
    raw = response?.text ?? "";
  } else {
    throw new Error(`unknown provider "${name}"`);
  }
  const cleaned = cleanModelOutput(raw);
  if (!cleaned) throw new Error(`${name} returned empty response`);
  if (!hasValidFrontmatter(cleaned)) throw new Error(`${name} output has invalid frontmatter`);
  return cleaned;
}

async function failJob(queue, job, message) {
  job.status = "failed";
  job.attempts = (job.attempts ?? 0) + 1;
  job.lastError = message;
  job.nextAttemptAt = isoIn(Number(process.env.RETRY_BACKOFF_MS) || HOUR_MS);
  await saveQueue(queue);
  console.error(`x ${job.relPath} -> ${job.targetLocale}: ${message}`);
}

async function runOne(queue, configured) {
  const job = pickNextJob(queue);
  if (!job) return false;
  console.log(`-> ${job.relPath} -> ${job.targetLocale}`);

  let source;
  try {
    source = await readFile(job.sourceFile, "utf8");
  } catch (err) {
    await failJob(queue, job, `source unreadable: ${err.message}`);
    return true;
  }

  const prompt = buildPrompt({ targetLocale: job.targetLocale, content: source });
  let translated = null;
  let providerUsed = null;
  const errors = [];
  for (const name of configured) {
    try {
      translated = await tryProvider(name, prompt);
      providerUsed = name;
      break;
    } catch (err) {
      const detail =
        err instanceof DeepSeekError && err.status ? `HTTP ${err.status}` : err.message;
      errors.push(`${name}: ${detail}`);
      console.warn(`  ! ${name} failed (${detail})`);
    }
  }
  if (!translated) {
    await failJob(queue, job, `all providers failed [${errors.join(" | ")}]`);
    return true;
  }

  translated = relocate(translated, job.targetLocale);
  await mkdir(dirname(job.targetFile), { recursive: true });
  await writeFile(job.targetFile, translated, "utf8");

  job.status = "done";
  job.attempts = (job.attempts ?? 0) + 1;
  job.lastError = null;
  job.completedAt = new Date().toISOString();
  job.providerUsed = providerUsed;
  await saveQueue(queue);
  console.log(`v ${job.targetFile} (via ${providerUsed})`);
  return true;
}

const order = (process.env.LLM_ORDER || "deepseek,gemini")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);
const configured = order.filter(
  n =>
    (n === "deepseek" && process.env.DEEPSEEK_API_KEY) ||
    (n === "gemini" && process.env.GEMINI_API_KEY)
);
if (!configured.length) {
  console.error("Set DEEPSEEK_API_KEY or GEMINI_API_KEY.");
  process.exit(1);
}

const count = Math.max(1, Number(process.argv[2]) || 1);
const queue = await loadQueue();
for (let i = 0; i < count; i++) {
  const did = await runOne(queue, configured);
  if (!did) {
    console.log("No translation jobs ready to run.");
    break;
  }
}
