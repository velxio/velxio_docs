/**
 * One JSON-mode chat call to DeepSeek, nothing else: no tools, no agent loop.
 * The key comes from DEEPSEEK_API_KEY, or from the velxio-prod .env on this
 * box (VELXIO_ENV); it is never written anywhere.
 */
import { existsSync, readFileSync } from "node:fs";

function key() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY;
  const env = process.env.VELXIO_ENV || "/home/dave/velxio-prod/.env";
  if (existsSync(env)) {
    const m = /^DEEPSEEK_API_KEY=(.+)$/m.exec(readFileSync(env, "utf8"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("DEEPSEEK_API_KEY not set");
}

/** system + user prompt in, parsed JSON object out. */
export async function askJson(system, user, { temperature = 0.4, maxTokens = 2000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    let r;
    try {
      r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key()}` },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
      });
    } catch (e) {
      // a dropped connection ("fetch failed"): same back-off as a 5xx
      if (attempt >= 3) throw e;
      await new Promise(res => setTimeout(res, 3000 * (attempt + 1)));
      continue;
    }
    if (r.ok) {
      const j = await r.json();
      return JSON.parse(j.choices[0].message.content);
    }
    if (attempt >= 2 || r.status < 500) throw new Error(`deepseek ${r.status}: ${(await r.text()).slice(0, 200)}`);
    await new Promise(res => setTimeout(res, 3000 * (attempt + 1)));
  }
}

/** Copy rules every prompt shares, and the check that enforces them. */
export const STYLE = "Plain English. No emojis, no em dashes or en dashes, no hashtags inside sentences, no exclamation marks.";
export function styleErrors(text, where) {
  const out = [];
  if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)) out.push(`${where}: contains an emoji`);
  if (/[–—]/.test(text)) out.push(`${where}: contains an em/en dash`);
  return out;
}
