---
title: GitHub Sync
description: Every project save commits the sketch, the canvas state and a README to a GitHub repo you control.
sidebar:
  order: 6
  badge: PRO
---

Every time you save a Velxio project, **GitHub Sync** commits and pushes
the sketch, the canvas state and a generated README to a GitHub repo you
own. Your code keeps living in your own version control — Velxio is just
the editor on top.

GitHub Sync is part of the **Pro** tier — see
[plans](/docs/getting-started/plans/).

## What gets synced

On every successful save, Velxio writes to your repo's root:

- **`sketch.ino`** — plus any extra `.ino` / `.h` / `.c` / `.py` files in
  the active board's file group.
- **`velxio.json`** — the full canvas state: board type, placed
  components, wires and per-board layout. Whoever clones your repo can
  open the project in Velxio and see the exact same circuit.
- **`README.md`** — auto-generated, with the project name, description
  and an "Open in Velxio" deep link. Free to overwrite once you want a
  richer README.

Velxio never touches files outside those paths — CI config, docs, photos
and anything else in the repo are left alone.

## How to enable it

1. Open any saved project. Click the **…** overflow menu in the editor
   toolbar and pick **Sync to GitHub**.
2. First time only: click **Connect GitHub**. GitHub asks which repos you
   want Velxio to write to — Velxio gets installation-scoped access to
   _only_ those repos, no blanket "all your repositories" permission.
3. Pick the target repo from the dropdown and hit **Link & sync now**.
   Velxio pushes the initial commit and shows the SHA + link.
4. That's it. Every subsequent save pushes another commit; the Sync modal
   shows the last sync time and a direct link to the commit.

## Security model

Velxio uses a **GitHub App**, not a personal OAuth token:

- **Per-repo opt-in** — you choose at install time which repos Velxio can
  write to, and can revoke or add repos anytime from
  [github.com/settings/installations](https://github.com/settings/installations).
- **No long-lived tokens** — every sync mints a fresh ~1 h installation
  token; user OAuth tokens are used exactly once (to fetch your GitHub
  profile during connect) and discarded.
- **Isolated rate limit** — the App has its own quota, separate from your
  personal tools'.
- **Disconnect cleanly** — deleting the Velxio App from your GitHub
  settings revokes access immediately; Velxio picks up the webhook and
  disconnects without stale state.

## Conflicts and manual edits

Sync is currently **one-way push**: Velxio → GitHub. Manual edits made on
GitHub between Velxio saves are overwritten on the next save — Velxio is
the source of truth for the synced files.

Want to develop locally in VS Code for a while? **Unlink** the project
(Sync modal → _Unlink_), work in your local clone, then re-link when
you're ready to drive from Velxio again. Bidirectional sync is on the
roadmap.

## FAQ

**What if a sync fails?**
Failures surface in the Sync modal with a recovery action (Reconnect
GitHub, pick a different repo, try again later). The save itself is never
blocked — your project always saves inside Velxio.

**Can I sync to a repo I don't own?**
Yes, as long as the GitHub App is installed on the organization and you
have write access there.

**What about private repos?**
Fully supported — whatever you authorize during install becomes writable,
public or private.

**Can I customize the README?**
Velxio overwrites `README.md` on every sync today. On the roadmap:
skipping the overwrite once you've taken ownership of the file.
