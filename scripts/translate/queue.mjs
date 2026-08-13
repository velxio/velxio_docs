/**
 * Persistent job queue for the docs auto-translate pipeline. Same design
 * as velxio_blog's: state in `.translations/queue.json`, committed, one
 * job = "translate one page into one locale".
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export const QUEUE_PATH = ".translations/queue.json";
export const HOUR_MS = 60 * 60 * 1000;

export async function loadQueue() {
  try {
    const parsed = JSON.parse(await readFile(QUEUE_PATH, "utf8"));
    if (!parsed || !Array.isArray(parsed.jobs)) return { jobs: [] };
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT") return { jobs: [] };
    throw err;
  }
}

export async function saveQueue(queue) {
  await mkdir(dirname(QUEUE_PATH), { recursive: true });
  await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2) + "\n", "utf8");
}

export function jobKey(relPath, targetLocale) {
  return `${relPath}::${targetLocale}`;
}

export function pickNextJob(queue) {
  const now = Date.now();
  return (
    queue.jobs
      .filter(
        j =>
          (j.status === "pending" || j.status === "failed") &&
          new Date(j.nextAttemptAt).getTime() <= now
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0] ?? null
  );
}

export function summarizeQueue(queue) {
  const counts = { pending: 0, failed: 0, done: 0, skipped: 0 };
  for (const j of queue.jobs) counts[j.status] = (counts[j.status] ?? 0) + 1;
  return counts;
}
