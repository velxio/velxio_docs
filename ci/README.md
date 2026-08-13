# CI

`github-build.yml` is the GitHub Actions build workflow. It lives here
instead of `.github/workflows/` because the push credential on the dev
machine lacks the `workflow` scope. To enable CI: copy it to
`.github/workflows/build.yml` from the GitHub web UI (Add file), or push
that move with a workflow-scoped token.
