---
name: git-commit
description: Use when the user wants to commit, stage, or finalize work in the gitsym repository — creating a commit message, splitting staged changes into atomic commits, or checking a message against the project's commitlint rules.
---

# Git commit convention

gitsym commits with its own format, so this repository is the reference
example of it. The normative text is `docs/specification.md`; the vocabulary is
`data/symbols.json`. When this skill disagrees with the specification, the
specification wins.

## Why we commit this way

A commit is a historical record, not just a sync mechanism to move code from
one place to another. Future readers — human or AI — will use `git log` and
`git blame` to understand _why_ a line looks the way it does, long after the
diff itself stops being interesting. That only works if messages carry intent
instead of restating what the diff already shows.

Prefer small, imperfect, atomic commits over batching everything into one
large commit and squashing later. One logical change per commit: it makes
review, bisection, and revert all cheaper.

## Commit format

```text
type[scope]: Subject starting with uppercase

Body providing context and intent, max 80 chars per line

Assisted-by: <provider>:<model-id>
```

The scope is optional: `type: Subject` is valid. Use one when the change
targets an identifiable area (see Scopes).

Breaking change variant — the `BREAKING CHANGE:` paragraph is mandatory:

```text
+![scope]: Subject starting with uppercase

Body providing context and intent, max 80 chars per line

BREAKING CHANGE: what breaks and what the caller must do about it

Assisted-by: <provider>:<model-id>
```

## Types

The type MUST be one of these 15 values (case-sensitive, ASCII). `#` is never a
type: git treats lines starting with `#` as comments.

| Symbol | Name               | Use for                                               | Not for                                                        |
| ------ | ------------------ | ----------------------------------------------------- | -------------------------------------------------------------- |
| `+`    | Add                | New feature, service, resource, initial deploy        | Changing something that exists (`~`); dependency upgrades      |
| `-`    | Remove             | Delete service, file, dead code                       | Renaming (`>`); undoing a commit (`<`)                         |
| `~`    | Improve            | Perf, config update, behavioral improvement (non-bug) | Repairing broken behavior (`!`); dependency bumps (`^`)        |
| `!`    | Fix                | Repair a bug or broken behavior                       | Changing correct behavior (`~`); security fixes (`$`)          |
| `=`    | Refactor           | No behavior change (style, tests, DX, CI)             | Anything observable by users or dependent systems (`~`)        |
| `^`    | Bump               | Dependency version upgrade or downgrade               | Behavioral config changes (`~`); bumps forcing breakage (`~!`) |
| `>`    | Move               | Rename or relocate resources                          | Changes to the content of the moved resource                   |
| `<`    | Revert             | Undo a previous commit                                | Removing something never committed before (`-`)                |
| `@`    | Docs               | Documentation, README, procedures, comments           | Code changes that happen to include documentation              |
| `$`    | Security           | Fix, policy, secret management                        | Ordinary bug fixes (`!`)                                       |
| `?`    | Experiment         | POC, investigation, research                          | Work intended to be kept as is                                 |
| `*`    | Wildcard           | Does not fit any other type                           | Anything another type describes; never a default choice        |
| `+!`   | Add (breaking)     | Addition that breaks backward compatibility           | Backward-compatible additions (`+`)                            |
| `~!`   | Improve (breaking) | Behavioral change that breaks backward compatibility  | Backward-compatible changes (`~`); bug fixes                   |
| `-!`   | Remove (breaking)  | Removal that breaks backward compatibility            | Removals nothing depends on (`-`)                              |

Disambiguation rules:

- **`~` vs `!`** — did the previous behavior have a bug? Use `!` if you fixed
  something broken. Use `~` if the previous behavior was correct and you
  changed it to something better (faster, clearer, more configurable).
- **`=` vs `~`** — is the change observable by a user or a dependent system
  (someone running the commitlint config, reading the specification or the
  vocabulary in `data/symbols.json`)? Observable → `~`. Invisible (internal
  refactor, added tests, CI tweak) → `=`.
- **`^`** is always used for dependency version changes, even when done by hand
  rather than by an automated tool. **Exception:** a bump that forces breaking
  modifications (changes to the consuming code, configuration or architecture
  to keep working) is not a bump. It MUST be typed `~!`, with a
  `BREAKING CHANGE:` paragraph. `^` is never breaking.
- There is no `ci`, `build` or CI-specific type. Use the type that describes
  what actually changed (`+` new pipeline, `~` modified, `=` refactored) and put
  the area in the scope (`mise`, `repo`, `rtunk`).

## Breaking changes

- Only `+`, `~` and `-` have a breaking variant: `+!`, `~!`, `-!`. The `!` goes
  directly after the type, before `[`.
- Any other combination (`!!`, `=!`, `@!`, `?!`, `*!`, `^!`, `>!`, `$!`, `<!`)
  is invalid.
- A fix, docs change, refactor, experiment, security change, bump, move or
  revert that breaks something is a structural change in fact: commit it under
  `+!`, `~!` or `-!`.
- A breaking type requires a `BREAKING CHANGE: <explanation>` paragraph in the
  body, non-empty. State what breaks and how to migrate.
- A breaking type without a scope (`~!: Drop v1`) is valid, and still needs the
  paragraph.

## Scopes

The scope is **optional**. When present it is bracketed, lower-case, and
comma-separated without spaces (`type[scope1,scope2]:`). In this repository the
allowed values are the `scope-enum` of `.commitlintrc.js`, enforced at error
level.

| Scope          | Covers                                                        |
| -------------- | ------------------------------------------------------------- |
| `spec`         | `docs/specification.md`                                       |
| `why`          | `docs/why.md`                                                 |
| `migration`    | `docs/migration.md`                                           |
| `readme`       | `README.md`                                                   |
| `contributing` | `CONTRIBUTING.md`                                             |
| `data`         | `data/` (`symbols.json`)                                      |
| `commitlint`   | `packages/commitlint` (the npm package and its tests)         |
| `mise`         | `mise.toml`                                                   |
| `rtunk`        | `.rtunk/`                                                     |
| `repo`         | Other root config, `.agents/`, `.github/`, `LICENSE`, ignores |

Decision tree: which files did the change touch?

1. Files map to exactly one scope in the table → use it.
2. One logical change that atomically touches several areas → list them,
   comma-separated, **at most 3** (e.g. `[spec,data]` when the specification and
   `symbols.json` change together).
3. The change has no identifiable area, or touches too many → omit the scope
   rather than inventing one.
4. Ambiguous (a file could map to several scopes) → ask the user, never guess.

If the changes span more than 3 areas and are not one atomic change, split them
into separate commits instead of forcing a long scope list.

## Subject

- Imperative mood ("Add", not "Added" or "Adds").
- Starts with an uppercase letter (sentence-case).
- No trailing period.
- Exactly one space after the colon.
- The whole header is at most 100 characters.

## Body

Optional for trivial changes (a one-line dependency bump, a typo fix),
mandatory otherwise. It must explain **why**, never restate **what** — the
diff already shows what changed.

- Motivation, trade-offs, or user impact — not a narration of the diff.
- Max 80 characters per line, sentence-case (the first character is uppercase).
- Avoid lines starting with `#`: git treats them as comments.
- The "why" must come from the user's own words in conversation. Never infer
  it from the diff. If the user hasn't stated it, ask before writing the
  body.

## AI trailers

AI-assisted commits carry one trailer, `Assisted-by:`, in the footer (after `BREAKING CHANGE:`
when there is one):

```text
Assisted-by: anthropic:claude-sonnet-5.5
```

- `Assisted-by: <provider>:<model-id>` is the repository's disclosure convention: the human
  stays the author, the AI is a tool they direct. Use the model powering the session, with dots
  in version numbers, not hyphens (`claude-sonnet-5.5`, not `claude-sonnet-5-5`). Specialized
  analysis tools may follow, space-separated; basic tools (git, compilers, editors) are not listed.
- Never `Co-authored-by:`/`Co-Authored-By:` for the AI tool: a tool a human directs is not a
  co-author. If the tooling adds that trailer, strip it (amend the message) and keep
  `Assisted-by:`.

Commits made without AI help carry no trailer.

## Signing and DCO

Every commit is signed with the key the user configured in git (GPG or SSH); signing comes from
the git config, so a plain `git commit` or `git commit -S` are both fine.

- Never switch to another key or identity (no `-S<keyid>`, no `user.signingkey` or `user.*`
  override).
- If signing fails (key unavailable, agent locked), stop and tell the user. Never commit unsigned
  with `--no-gpg-sign`, and never use `--no-verify` to skip hooks.
- Never `-s`/`--signoff` or a `Signed-off-by:` trailer: the DCO sign-off is the human committer's
  own attestation that they may submit the change, which an AI cannot give.

## Commitlint rules (canonical reference)

This section mirrors `packages/commitlint/index.js` (the format rules, shipped
as the npm package) and `.commitlintrc.js` (which extends the package and adds
this repository's `scope-enum`). **Keep it in sync whenever either file
changes — this section IS the reference for anyone reading the skill instead
of the config.**

Header pattern (scope optional):
`^(?<type>\S+?)(?:\[(?<scope>[^\]]+)\])?:\s(?<subject>.+)$`
Breaking header pattern:
`^(?<type>[+~-]!)(?:\[(?<scope>[^\]]+)\])?:\s(?<subject>.+)$`
Header correspondence: `type`, `scope`, `subject`.

| Rule                     | Level | Value                                                                                                                        |
| ------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| `gitsym-breaking-body`   | error | always: a `+!`/`~!`/`-!` type needs a `BREAKING CHANGE: <text>` line (`/^BREAKING CHANGE: \S/m` on the raw message)          |
| `gitsym-header-spacing`  | error | always: exactly one space after the colon (`/^\S+?(?:\[[^\]]*\])?: \S/`)                                                     |
| `gitsym-scope-format`    | error | always: comma-separated, no spaces, no empty item                                                                            |
| `gitsym-scope-max-count` | error | always, 3: at most 3 scopes                                                                                                  |
| `body-max-line-length`   | error | 80                                                                                                                           |
| `body-case`              | error | sentence-case                                                                                                                |
| `footer-leading-blank`   | error | always: blank line before the footer                                                                                         |
| `footer-max-line-length` | error | 80                                                                                                                           |
| `header-full-stop`       | error | never `.`                                                                                                                    |
| `header-max-length`      | error | 100                                                                                                                          |
| `header-trim`            | error | always                                                                                                                       |
| `scope-case`             | error | lower-case                                                                                                                   |
| `subject-case`           | error | sentence-case                                                                                                                |
| `subject-empty`          | error | never empty                                                                                                                  |
| `subject-full-stop`      | error | never `.`                                                                                                                    |
| `subject-max-length`     | error | 100                                                                                                                          |
| `type-empty`             | error | never empty                                                                                                                  |
| `type-enum`              | error | the 12 base symbols `+ - ~ ! = ^ > < @ $ ? *` and `+!` `~!` `-!`                                                             |
| `scope-enum`             | error | `.commitlintrc.js` only: `spec`, `why`, `migration`, `readme`, `contributing`, `data`, `commitlint`, `mise`, `rtunk`, `repo` |

There is no `scope-empty` rule: the scope is optional. The package alone
(`packages/commitlint`) does not ship a `scope-enum`; each repository adds its
own, which is what `.commitlintrc.js` does here.

### Checking a message

```sh
# Commits that already exist
mise run ci:commitlint -- --last
mise run ci:commitlint -- --from <sha> --to <sha>

# A draft message, from the repository root
printf '%s\n' "<message>" | mise exec npm:@commitlint/cli@latest -- commitlint
```

### Keeping this skill in sync

`packages/commitlint/index.js` and `.commitlintrc.js` are authoritative; when
either changes, update this skill to match:

1. **Read both files** and identify what changed (types, scopes, rules, local plugin
   rules, parser patterns).
2. **Update the matching section** here:
   - New type: Types table and the `type-enum` row. It also lives in `data/symbols.json` and
     `docs/specification.md`, which win over this skill.
   - New scope: Scopes table, decision tree and the `scope-enum` row.
   - Rule change: the rules table (including the "If commitlint fails" row for it).
   - Parser change: the header patterns.
3. **Keep this skill self-contained**: do not turn this section into "go check the config".
4. **Verify**: re-read both files side by side and confirm every rule, level, value, type, scope
   and pattern matches exactly, then run `mise run ci:commitlint -- --last`. Commit with
   `@[repo]:` or `=[repo]:` depending on what changed.

### If commitlint fails

| Rule                     | Likely cause                                           | Fix                                                                  |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `type-enum`              | Symbol missing, misspelled, or `!!`/`^!`-style combo   | Use one of the 12 base symbols, or a `+!`/`~!`/`-!` breaking variant |
| `scope-enum`             | Scope not in the list                                  | Pick a scope from the Scopes table, or omit it                       |
| `scope-case`             | Upper-case scope                                       | Lower-case it                                                        |
| `gitsym-scope-format`    | Space or empty item in `[a, b]` / `[a,,b]`             | Write `[a,b]`                                                        |
| `gitsym-scope-max-count` | More than 3 scopes                                     | Split the commit or drop scopes                                      |
| `gitsym-header-spacing`  | No space, or more than one, after the colon            | Exactly one space: `type[scope]: Subject`                            |
| `gitsym-breaking-body`   | `+!`/`~!`/`-!` without a `BREAKING CHANGE:` line       | Add `BREAKING CHANGE: <what breaks, how to migrate>` in the body     |
| `header-max-length`      | Header too long                                        | Trim to ≤100 chars total, move detail to the body                    |
| `subject-case`           | Subject starts with a lowercase letter                 | Start with an uppercase letter                                       |
| `subject-full-stop`      | Trailing period on subject                             | Remove it                                                            |
| `body-max-line-length`   | Body line >80 chars                                    | Rewrap                                                               |
| `body-case`              | Body starts with a lowercase word                      | Rephrase so the first character is uppercase                         |
| `footer-leading-blank`   | No blank line before `BREAKING CHANGE:`/`Assisted-by:` | Add a blank line before the footer                                   |

## Workflow

1. Survey the workspace:
   `git status`, `git diff --cached --name-only`, `git diff --name-only`,
   `git log --oneline --no-merges -10`.
2. If staged changes span unrelated areas and aren't one atomic change,
   split them into separate commits instead of forcing a multi-scope header.
3. Select the type using the disambiguation rules above.
4. Determine the scope (or none, or up to 3) using the decision tree above.
5. Draft the subject: imperative, uppercase start, no trailing period,
   ≤100 chars.
6. Write the body: ask the user for the "why" if it hasn't already come up
   in conversation. Skip the body only for genuinely trivial changes.
7. Stage the files, then run a plain `git commit` whose message comes from a quoted heredoc
   (`git commit -m "$(cat <<'EOF' ... EOF)"`), so multi-line bodies and trailers stay intact.
   Include the `Assisted-by:` trailer (see "AI trailers") when the AI helped, and strip any
   `Co-Authored-By:` the tooling adds.
8. The commit must be signed with the configured key. Never add `-s`/`--signoff`, `--no-gpg-sign` or
   `--no-verify` (see "Signing and DCO").
9. Check it: `mise run ci:commitlint -- --last`.

## Examples

**Good — simple add:**

```text
+[commitlint]: Add the gitsym-scope-max-count rule

Without a cap, a commit touching everything ends up with a scope list that
says nothing about where the change landed.

Assisted-by: anthropic:claude-sonnet-5.5
```

**Good — dependency bump, no scope, no body needed:**

```text
^[commitlint]: Bump @commitlint/cli to 19.8.1
```

**Good — docs, scope omitted:**

```text
@: Fix a typo in the README
```

**Good — several scopes:**

```text
@[readme,why]: Clarify the pitch
```

**Good — a bump that forces breaking changes is `~!`:**

```text
~![commitlint]: Migrate to the commitlint v20 config API

The v19 rule signature is gone upstream, so the plugin rules had to be
rewritten to keep working.

BREAKING CHANGE: consumers must upgrade @commitlint/cli to v20 or later.

Assisted-by: anthropic:claude-sonnet-5.5
```

**Good — breaking change:**

```text
~![spec]: Drop the mandatory scope from the header

Several repositories have no meaningful scope list, so forcing one only
produced filler scopes.

BREAKING CHANGE: tooling that parses the header must accept `type: Subject`
without brackets.

Assisted-by: anthropic:claude-sonnet-5.5
```

**Bad — no type, restates the diff:**

```text
Updated index.js to add a rule
```

Missing the type entirely, and the body (if any) would just repeat what the
diff already shows instead of explaining why the rule was added.

**Bad — breaking type without the paragraph:**

```text
-![data]: Remove the legacy symbol list

It was replaced by symbols.json.
```

Fails `gitsym-breaking-body`: `-!` needs a `BREAKING CHANGE:` paragraph.

**Bad — invalid type:**

```text
!![commitlint]: Fix and majorly change the rules
```

`!!` isn't a valid symbol — only `+`, `~`, `-` can take the `!` breaking
suffix, and a fix (`!`) can't itself be marked breaking.

**Bad — scope outside the list, space in the scope list, lower-case subject:**

```text
+[nope]: Add a section
+[spec, why]: Add a section
+[spec]: add a section
```

Fail `scope-enum`, `gitsym-scope-format`, and `subject-case` respectively.

**Bad — Co-Authored-By for the tool, forbidden sign-off flag:**

```text
!: Fix a nil guard in the plugin

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

committed with `git commit -s`. The AI tool is not a co-author: the trailer must be
`Assisted-by: <provider>:<model-id>` only (and it is missing here), and the command must never
carry `-s`.

## References

- [gitsym specification](../../../docs/specification.md)
- [Trailers for AI-assisted commits — All Things Open](https://allthingsopen.org/articles/ai-assisted-commits)
- [Linux kernel documentation on coding assistants](https://docs.kernel.org/process/coding-assistants.html)
