/**
 * Tiny DeepSeek client used by the translation pipeline. The API is
 * OpenAI-compatible; we hit `/chat/completions` with a single user
 * message and return the assistant's text. Native `fetch` is used so
 * we don't add a dependency.
 *
 * The DeepSeek free tier ships generous quotas; we still allow the
 * caller to override the model via env (e.g. `DEEPSEEK_MODEL=deepseek-reasoner`).
 */

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 240_000;

export class DeepSeekError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number; body?: string }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "DeepSeekError";
    this.status = meta.status;
    this.body = meta.body;
  }
}

/**
 * Send `prompt` to DeepSeek and return the assistant's text.
 *
 * @param {Object} args
 * @param {string} args.apiKey
 * @param {string} args.prompt
 * @param {string} [args.model]
 * @param {string} [args.baseUrl]
 * @param {number} [args.timeoutMs]
 * @returns {Promise<string>}
 */
export async function callDeepSeek({
  apiKey,
  prompt,
  model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
  baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL,
  timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
}) {
  if (!apiKey) {
    throw new DeepSeekError("DEEPSEEK_API_KEY is not set");
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        // Single-turn translation. `temperature: 0` keeps the model from
        // creatively reformatting markdown — empirically critical here.
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new DeepSeekError(`request timed out after ${timeoutMs}ms`);
    }
    throw new DeepSeekError(`network error: ${err.message}`);
  }
  clearTimeout(timer);

  const text = await res.text();
  if (!res.ok) {
    throw new DeepSeekError(`HTTP ${res.status}`, { status: res.status, body: text });
  }

  /** @type {{ choices?: { message?: { content?: string } }[] }} */
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new DeepSeekError(`invalid JSON response`, { body: text });
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new DeepSeekError(`empty completion`, { body: text });
  }
  return content;
}
