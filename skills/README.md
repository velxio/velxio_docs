# Claude Code skills for the Velxio docs and media pipelines

These skills live here (public repo) so they survive machine changes and
can be used from any checkout — dev box, another server, or CI.

| Skill | Covers |
| --- | --- |
| [velxio-docs-pipeline](velxio-docs-pipeline/SKILL.md) | The docs portal: content rules, screenshot/reference generators, the 9-locale translation pipeline, deploy wiring and its traps |
| [velxio-promo-video](velxio-promo-video/SKILL.md) | The promo video / product GIFs: Playwright take of the real app + Remotion post (zooms, captions, music beat-sync) |

## Install on a machine

Claude Code loads skills from `.claude/skills/<name>/SKILL.md` in the
project (or `~/.claude/skills/` for all projects). Symlink so updates
travel with `git pull`:

```bash
# from the repo that should expose them (e.g. velxio-prod)
mkdir -p .claude/skills
ln -s /path/to/velxio_docs/skills/velxio-docs-pipeline .claude/skills/velxio-docs-pipeline
ln -s /path/to/velxio_docs/skills/velxio-promo-video  .claude/skills/velxio-promo-video
```

Copy instead of symlinking if the target box does not have this repo
checked out next to it. Keep the copy in sync by re-copying after a
`git pull` here.

## Requirements on a fresh box

- Node 22+ (Astro 7 and the Remotion project), `npm ci` in the repo root
  and in `promo/`.
- Chromium for Playwright: `npx playwright install chromium` (the scripts
  also accept any chromium already in `~/.cache/ms-playwright`).
- `ffmpeg` for GIF/video work.
- `python3` + `librosa numpy soundfile` only for the music beat grid
  (`scripts/detect-beats.py`).
- Staging credentials in the environment for anything that drives the
  app: `VELXIO_SHOTS_EMAIL`, `VELXIO_SHOTS_PASSWORD` (test account), and
  `VELXIO_BASE` to point at a different instance.
- Translation keys (only for `npm run translate`): `DEEPSEEK_API_KEY`
  and/or `GEMINI_API_KEY`.
