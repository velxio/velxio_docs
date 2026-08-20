---
name: velxio-docs-pipeline
description: Work on the Velxio documentation portal (velxio_docs — Astro Starlight served at velxio.dev/docs/). Use when asked to add or edit doc pages, regenerate screenshots, regenerate the parts/boards reference, translate the docs, or deploy the portal. Carries the generators, the 9-locale translation pipeline, the deploy wiring in velxio-prod, and the traps that break each of them.
---

# Velxio docs portal pipeline

The portal is its own repo (`github.com/velxio/velxio_docs`, cloned at
`/home/dave/velxio_docs` on the dev box) and ships to
**velxio.dev/docs/** as the `pro/docs-site` submodule of `velxio-prod`.
It replaced the old in-app `/docs` SPA pages (retired 2026-08-13).

## Layout

| Path | What |
| --- | --- |
| `src/content/docs/` | English source pages (default locale) |
| `src/content/docs/<locale>/` | es, pt-br, it, fr, zh-cn, de, ja, ru |
| `src/content/docs/parts/`, `boards/reference/` | GENERATED — never hand-edit |
| `src/assets/docs/` | Screenshots + GIFs, all script-produced |
| `scripts/` | shots, gen-parts, gen-boards, translate-*, detect-beats |
| `promo/` | Remotion promo video project (see `velxio-promo-video` skill) |

## Commands

```bash
npm run dev            # http://localhost:4321/docs/
npm run build          # static output + Pagefind index (VERIFY before deploy)
npm run shots          # re-capture screenshots (needs staging creds)
npm run gen-parts      # per-component reference from the live registry
node scripts/gen-boards.mjs   # board art + pinouts (37 boards)
node scripts/gen-boards.mjs cardputer-adv   # just this one, rest untouched
npm run translate      # detect missing translations + run one job
node scripts/translate-run.mjs 20   # run N jobs
```

Screenshot/generator scripts need
`VELXIO_SHOTS_EMAIL` / `VELXIO_SHOTS_PASSWORD` and default to
`VELXIO_BASE=https://vstaging.moontero.com`. The known test account
authenticates against **production** — pass `VELXIO_BASE=https://velxio.dev`
explicitly or the login 401s.

**Never run `npm run format` repo-wide.** There is no `.prettierignore`, so
it reformats `scripts/*.mjs` too — and prettier explodes `gen-boards.mjs`'s
deliberately one-line-per-board `BOARDS` table into 300 lines of noise.
Prettier the generated markdown only (the committed pages are formatted,
the generators' raw output is not):

```bash
npx prettier --write src/content/docs/boards/reference/<kind>.md
```

## Content rules

- **English is the source**; other locales are machine-translated and
  committed. Generated sections (`parts/`, `boards/reference/`) stay
  English and are excluded in `translate-detect.mjs`.
- House style: no emojis anywhere (a hook blocks them), English in the
  repo, Spanish only in conversation.
- Screenshots are NEVER pasted by hand — add a scene to `shots.mjs` so
  they can be regenerated when the UI changes. Crop with `clipOf(page, [sel])`,
  never fixed pixels, and **open the PNG afterwards**: the script prints
  "all scenes OK" for a crop of the wrong pixels. Clamp a canvas crop to
  `.canvas-content` (the `overflow:hidden` box that really clips the board);
  `.simulator-panel` also spans the output console, so a board that slid
  under the console still "fits".
- The AI assistant panel is minimized in every screenshot unless the
  assistant IS the subject (`loadExample(page, slug, {keepAi:true})`).

## Generators

- `gen-parts.mjs` fetches `/components-metadata.json` from the deployed
  app and reads each part's live `pinInfo` by instantiating its custom
  element in a headless page → 152 part pages that cannot drift from the
  canvas.
- `gen-boards.mjs` does the same per board, screenshots the element at
  2x with a transparent background, and emits `boards/reference/<kind>.md`.
  Its kind→tag map mirrors `BoardOnCanvas.tsx` (wokwi-* for AVR,
  `velxio-esp32[board-kind]`, `velxio-stm32-*`, `velxio-xiao-board[variant]`,
  pro tags) — update it when a board is added. `pro: true` there means
  **needs a paid plan**, and the truth source is upstream
  `proBoardGate.ts::isProBoardKind`: STM32 plus the Raspberry Pi Linux
  family (UNIHIKER included) and nothing else. M5Stack, Pimoroni, XIAO and
  the C6 DevKit are free — do not badge them PRO just because they are
  overlay boards.

### Hand-written content on a generated board page

The board pages are wiped and rewritten every run, so guidance cannot live
in them. Put it in `scripts/board-extras/<kind>.md` instead: `gen-boards.mjs`
splices that file into the page **above** the pin table (a reader opening a
board page wants to run something, not read 40 pin rows first). Asset paths
inside an extras file are relative to the OUTPUT page, so four levels up:
`../../../../assets/docs/boards/<shot>.png`.

All 37 boards have one. `cardputer-adv` and `m5stack-core` are the deep
ones — a four-step first-run tutorial with a screenshot per step, from the
`boards/<kind>` scenes in `shots.mjs`; the rest are a short "About this
board" plus "Start here" pointing at that board's real starter example.

**Never paste example source into an extras file.** Write
`{{example:<slug>}}` (add `|python` for MicroPython) and the generator pulls
the sketch out of the running editor via `window.monaco` — the gallery data
is bundled into the SPA with no endpoint, and the cards carry no slug, so
that is the only readable copy. It means a one-deploy lag: the code shown is
the code the deployed app serves, which is also what a reader sees.

**Verify example slugs against source, never by fetching them.**
`/example/<anything>` returns 200 because `/example` is an SPA route, so a
curl check proves nothing. Match them against the `id:` fields in
`velxio/frontend/src/data/examples*.ts` and
`pro/frontend/src/pro/boards/<vendor>/examples-*.ts`; the scraped
`gallery-index.json` goes stale and its slugs come from thumbnail filenames,
which not every example has.

### Board art goes stale silently

`velxio-prod/scripts/check-docs-board-art.py` compares each board's element
commit date against its art's, and is the thing that would have caught the
M5Stack Core shipping four days of old art. Run it before a docs release.
Do NOT try to detect this by diffing the PNGs: re-rendering the same element
moves font metrics a subpixel, so 15 of 37 images come back byte-different
with no visual change.

## Translation pipeline (ported from velxio_blog)

DeepSeek first, Gemini fallback, one LLM call per (page, locale) job,
queue in `.translations/queue.json`. Deterministic post-passes the model
is not trusted with: `/docs/<locale>/` prefix on internal links, one
extra `../` on asset paths, and **quoting colon-bearing title/description**
(the one YAML failure mode the prompt rules never stopped).

Trap: `translate-run.mjs` loads the queue ONCE — do not enqueue while a
long run is in flight or the new jobs get overwritten.

## Deploy (in velxio-prod)

- Submodule `pro/docs-site` (NOT `pro/docs` — that path already holds
  internal license/policy docs).
- `Dockerfile.prod` stage `docs-builder` on **node:22** (Astro 7 refuses
  node < 22.12) with a `test -f dist/index.html` guard; dist copied to
  `/usr/share/nginx/html/docs`.
- nginx (`nginx/internal-nginx.conf`): `location = /docs` for the
  no-slash redirect (a prefix location would 301 the sibling), a `map`
  of the 13 legacy SPA slugs → new pages, and `location /docs/` with
  `try_files ... =404` + `error_page 404 /docs/404.html` (a fallback URI
  would serve soft-404s with status 200).
- Deploy to staging with `./scripts/deploy-staging.sh` (NEVER edit
  `scripts/deploy.sh`); it resets the OSS submodule to the recorded
  pointer, so commit any submodule bump BEFORE deploying.
- Trap: `/blog/` is a bind mount (`./blog-content`) that shadows the
  image; on a fresh box it is empty and returns 403 — populate it with
  `docker cp` from the built image.

## Starlight gotcha

Since v0.39 sidebar groups take `items: [{ autogenerate: {...} }]`, not
`autogenerate` at group level.

## Status

Living plan and open bugs: `project/docs-portal-2026-08/STATUS.md` in
velxio-prod (private). Known open item: the weather-station showcase
project does not boot on the current engine, so its tutorial ships with
`draft: true`.
