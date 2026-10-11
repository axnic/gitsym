---
name: release
description: Use when the user wants to cut, publish or tag a gitsym release (the @axnic/commitlint-config-gitsym npm package and the docs/spec), create a release candidate, choose a version bump, or watch the Release workflow run. Triggers the workflow through the GitHub CLI, only after explicit user confirmation.
compatibility: Requires GitHub CLI (gh)
allowed-tools: Bash(gh:*) Bash(git:*) Bash(mise:*)
---

# Release

> **Status: the caller workflow does not exist in this repository yet** (no
> `.github/` directory). This skill describes the **intended** flow, taken from
> the central docs of `axnic/.github` (`docs/Releases.md`, `docs/Mise-Tasks.md`,
> `release.prepare.yaml`, the `nodejs-publish-jobs.yaml.tftpl` template). The
> central docs name the caller `workflow_dispatch.release.yaml`; that is the
> pattern, **unverified for gitsym** until the Terraform-generated file lands.
> Once it exists, confirm its name and its `release:nodejs` job, and fix this
> file. Until then, do not run any `gh workflow run` below.

gitsym releases the npm package in `packages/commitlint`
(`@axnic/commitlint-config-gitsym`, `0.1.0` in `package.json`) together with the
docs/spec at the same tag. Releases are meant to be fully automated by one
`workflow_dispatch` caller (central logic in `axnic/.github`, caller generated
by Terraform, group `release:nodejs`). Never bump a version, create a tag, run
`npm publish` or edit `package.json`'s version by hand: the tag, the draft
release and the npm publication must all come from that one workflow. Pushing a
tag by hand publishes nothing (a tag pushed with `GITHUB_TOKEN` triggers no
workflow, and publishing runs inside the dispatch).

**This skill never triggers a release without explicit user confirmation.** A
release pushes a tag and stages a package on a public registry: outward-facing
and not cleanly reversible (a version pushed to npm cannot be reused).
Everything except the `gh workflow run` step is read-only; do the read-only
steps freely, stop before the trigger and ask.

## When to release

On request only. The workflow runs on the default branch `main` (every release,
release candidates included, is cut from it; any other ref fails). Do not
suggest a release on your own initiative beyond pointing out that unreleased
changes exist.

## Required mise tasks

`release:nodejs` needs `ci` and `ci:build` (`docs/Mise-Tasks.md`). `mise.toml`
defines them:

| Task             | What it does here                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `ci`             | Local gate, run by `prepare` on the commit to release: `ci:build`, then `ci:test`                               |
| `ci:build`       | Checks `data/symbols.json` is valid JSON and `npm pack --dry-run` works; also run by the npm job before staging |
| `security:audit` | `npm audit --audit-level=high` on the package dependencies (not part of the release chain; run it beforehand)   |

## Pre-flight

1. Local gate is green on the commit to be released: `mise run ci`, and
   `mise run security:audit` (the latter is not run by the release itself).
2. `main` CI is green on that commit:
   `gh run list --repo axnic/gitsym --branch main --limit 5`. The workflow
   re-runs `mise run ci` itself and fails before tagging if it is red, but a red
   `main` is a reason to stop and ask, not to retry. (Which QA workflow to look
   at depends on the generated callers: unverified.)
3. Unreleased changes exist and match the bump you are about to propose:
   `git --no-pager log "$(git describe --tags --abbrev=0 --exclude '*-rc.*')..origin/main" --first-parent --oneline`
   (with no tag yet, list the whole history instead). `bump=auto` with no commit
   since the last stable tag fails with "nothing to release".
4. No release run is in progress:
   `gh run list --repo axnic/gitsym --workflow workflow_dispatch.release.yaml --limit 3`
   (file name unverified for this repo).
5. Latest tag, for reference: `gh release list --repo axnic/gitsym --limit 5`.

## Choosing the version

Read the commit types since the last stable tag (see
`.agents/skills/git-commit/SKILL.md`). Note that `^` can never be breaking: a
bump that forces breaking changes is committed as `~!`, so scanning for `~!`
also catches those.

The project is **pre-1.0** (`packages/commitlint/package.json` says `0.1.0`) and
has no release history in this repository yet, so the rtunk precedent
(breaking changes shipped as a minor bump before v1.0) is only a proposal here,
never an established gitsym practice. Be aware that the central `bump=auto`
behaves differently: a breaking change gives **major**, and "a 0.x project goes
to 1.0.0". Do not let `auto` reach `1.0.0` by accident.

| Commits since the last stable tag                     | Proposed bump                                               |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Only `!`, `=`, `^`, `@`, `$`, `>`, `<`, `-`, `?`, `*` | `patch`                                                     |
| At least one `+` or `~` (new or improved behavior)    | `minor`                                                     |
| At least one `+!`, `~!` or `-!` (breaking), pre-`1.0` | `minor` (precedent from rtunk; confirm with the maintainer) |
| `+!`/`~!`/`-!` once `1.0.0` is out                    | `major`                                                     |

`data/symbols.json` carries a different, suggested `semver` mapping (`+` minor,
`+!`/`~!`/`-!` major, most others patch or none). It is a proposal, not part of
the format; the table above is the one to use for releases. `major` is also the
way to reach `1.0.0`; that is the maintainer's call, never inferred. When unsure
between two bumps, propose the lower one and ask. A change that only touches
docs/spec still ships with the package at the same tag.

Because the package version is set from the tag at publish time, `package.json`
is not bumped by the release (see "What the workflow does").

The workflow takes exactly one of `bump` or `version` (anything else fails
before any other step):

| `bump`   | Result                                                                    |
| -------- | ------------------------------------------------------------------------- |
| `auto`   | Derived from the commits: breaking gives major, feature minor, else patch |
| `patch`  | Stable, last stable tag with patch + 1                                    |
| `minor`  | Stable, minor + 1, patch 0                                                |
| `major`  | Stable, major + 1, minor and patch 0                                      |
| `manual` | Release the exact `version`                                               |

`version` is an exact version such as `0.2.0` or `0.2.0-rc.1` (no leading `v`).
A release candidate is released this way. There are no `rc-*` bumps. A `bump`
that would land below the highest existing tag (a release candidate included)
is refused: pass `version` explicitly. An existing tag is refused. `notes` is an
optional input that replaces the generated release notes. The shape of the
inputs (`bump` as a free string or a choice, `manual` handling) is defined by
the generated caller: unverified for gitsym.

## Triggering

Show the user the computed version and the commits it covers, then ask for an
explicit go. Only after a clear yes, and only once the caller exists:

```sh
gh workflow run workflow_dispatch.release.yaml --repo axnic/gitsym --ref main --field bump=minor
# exact version instead of a bump (never both); also how a release candidate is released:
gh workflow run workflow_dispatch.release.yaml --repo axnic/gitsym --ref main --field version=0.2.0-rc.1
```

(The file name is the central pattern, unverified for this repo. For
`version`, the central docs mention `bump=manual` in the caller; the exact
accepted combination depends on the generated file, so read it first.)

## What the workflow does

Stage 1, `prepare` (central `release.prepare.yaml`):

1. Checks that exactly one of `bump` or `version` is set, then computes the next
   version from the last stable `v[0-9]*` tag (or validates `version`).
   Refuses a commit that already carries a `vX.Y.Z` tag.
2. Runs `mise run ci` on the commit to release; a failure stops everything
   before the tag exists.
3. Builds the release notes: a deterministic draft from the commits since the
   previous tag and their PRs, whose summary paragraph is written by an
   OpenRouter model. Without the `OPENROUTER_API_KEY` secret, or on any model
   failure, the deterministic draft is used. Notes never block a release.
4. Pushes the annotated tag `v<version>`.
5. Creates the **draft** GitHub Release of that tag with the notes (marked
   prerelease when the version has a `-rc.N` style suffix).

Stage 2, job `npm` (generated into the caller by the `release:nodejs` group,
`needs: prepare`):

1. Checks out the tag.
2. Sets the version from the tag: `npm version "$VERSION" --no-git-tag-version`.
   The tag is the source of truth; `package.json` is not committed back.
3. Runs `mise run ci:build`.
4. Updates npm (`npm@^11.15.0`, needed by `npm stage`).
5. If `<name>@<version>` is already on npm, or already staged, does nothing.
6. Otherwise runs `npm stage publish --access public --provenance --tag <dist-tag>`
   (dist-tag `next` for a prerelease, `latest` otherwise). Authentication is npm
   trusted publishing (OIDC, `id-token: write`), with `NPM_TOKEN` as fallback.
   npm provenance is therefore attached to the package.

The version is only **staged**: it is not public until a maintainer approves it
with 2FA. The two stages' jobs and permissions are defined by the generated
caller and the central workflow; read them there rather than assuming.

## Watching the run

```sh
gh run list --repo axnic/gitsym --workflow workflow_dispatch.release.yaml --limit 3
gh run watch <run-id> --repo axnic/gitsym --exit-status
gh run view <run-id> --repo axnic/gitsym --log-failed
```

If the run fails, report the state to the user and let them decide. Do not
delete a tag or release, or re-run blindly (deleting is destructive, ask
first). Per the central docs:

| Failure                                | State left behind           | What to do                                                                                                                                                        |
| -------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In `prepare`, before the tag is pushed | nothing                     | Re-run or dispatch again                                                                                                                                          |
| In the `npm` job                       | tag and draft release exist | "Re-run failed jobs" (the npm step is idempotent: already published or staged is a no-op)                                                                         |
| In `prepare`, after the tag is pushed  | the tag, maybe the draft    | HEAD now counts as released, so re-running refuses. Delete the tag (`git push --delete origin vX.Y.Z`) and any draft, then dispatch again. Destructive: ask first |

A version already on npm cannot be reused: bump to a new one.

## After the run: approve and publish

Two manual steps remain, both the user's:

1. **Approve the staged npm version** (2FA): `npm stage list
@axnic/commitlint-config-gitsym` then `npm stage approve <stage-id>`, or the
   Staged Packages tab on npmjs.com. The job summary prints the same
   instructions. This skill never approves it.
2. **Publish the draft GitHub Release.** Show the user the notes
   (`gh release view v<version> --repo axnic/gitsym --json body,isDraft,isPrerelease`)
   and let them publish it from the GitHub UI or by their explicit instruction
   (`gh release edit v<version> --repo axnic/gitsym --draft=false`). Do not
   publish on your own: this skill never publishes the draft, it only tells the
   user. For `release:nodejs` the central docs do not say that the npm job
   attaches artifacts to the release: unverified.

## Verifying the release

The central docs give verification steps only for Go releases (cosign, SLSA
attestation, checksums) and none for Node.js packages, so none are listed here
(no goreleaser, cosign or checksum flow applies to gitsym). The only grounded
facts: the npm job publishes with `--provenance`, and the package page on
npmjs.com should then show the provenance. Anything beyond that is unverified.
