# @axnic/commitlint-config-gitsym

[commitlint](https://commitlint.js.org/) configuration for the [gitsym](../../README.md) commit format. It enforces the
machine-checkable rules of the [specification](../../docs/specification.md): type enum, optional scope, sentence-case
subject, header and body length limits, and the `BREAKING CHANGE:` paragraph for breaking types.

Section numbers below (for example "spec 3.3") refer to [`docs/specification.md`](../../docs/specification.md).

## Requirements

- `@commitlint/cli` `>=19` (peer dependency, see `package.json`).
- Node.js: `package.json` declares no `engines` field. `@commitlint/lint` 19 requires Node `>=18`, and the repository
  runs its tooling on the Node LTS (`mise.toml`).

## Install

```sh
npm install --save-dev @commitlint/cli @axnic/commitlint-config-gitsym
```

## Usage

Create `.commitlintrc.js` (CommonJS) at the root of your repository:

```js
// .commitlintrc.js
module.exports = {
  extends: ["@axnic/commitlint-config-gitsym"],
};
```

Lint a message from a `commit-msg` hook. With a plain Git hook, `.git/hooks/commit-msg` (must be executable):

```sh
#!/bin/sh
npx commitlint --edit "$1"
```

With husky, put the same `npx commitlint --edit "$1"` line in `.husky/commit-msg`.

In CI, lint every commit of a branch relative to `main`:

```sh
npx commitlint --from origin/main
```

## What is checked

### Parser preset

The config replaces commitlint's default header parser with two patterns (`parserPreset.parserOpts`):

| Option                  | Pattern                                                         | Role                                                                  |
| ----------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `headerPattern`         | `/^(?<type>\S+?)(?:\[(?<scope>[^\]]+)\])?:\s(?<subject>.+)$/`   | `type[scope]: Subject`; the `[scope]` part is optional (spec 3.1-3.2) |
| `breakingHeaderPattern` | `/^(?<type>[+~-]!)(?:\[(?<scope>[^\]]+)\])?:\s(?<subject>.+)$/` | Same shape, but the type can only be `+!`, `~!` or `-!` (spec 5.1)    |

`headerCorrespondence` is `["type", "scope", "subject"]`. The scope is whatever sits between `[` and `]`, so
`[api,auth]` is parsed as the single scope value `api,auth`. A header that matches neither pattern is parsed with an
empty type and subject, and fails `type-empty` and `subject-empty`.

### Rules

All rules are at level 2 (error).

| Rule                     | Value                          | What it checks                                                                    | Spec          |
| ------------------------ | ------------------------------ | --------------------------------------------------------------------------------- | ------------- |
| `type-empty`             | `never`                        | A type must be parsed from the header                                             | 3.1           |
| `type-enum`              | the 12 base + 3 breaking types | Type is one of `+ - ~ ! = ^ > < @ $ ? *` or `+! ~! -!` (so `!!`, `#`, `fix` fail) | 4.1, 5.2, 3.6 |
| `subject-empty`          | `never`                        | The subject must not be empty                                                     | 7.1           |
| `subject-case`           | `sentence-case`                | The subject must be sentence-case (starts with an uppercase letter)               | 7.2           |
| `subject-full-stop`      | `never`, `.`                   | The subject must not end with `.`                                                 | 7.3           |
| `subject-max-length`     | `100`                          | The subject is at most 100 characters                                             | 7.5           |
| `header-max-length`      | `100`                          | The whole header is at most 100 characters                                        | 3.3           |
| `header-full-stop`       | `never`, `.`                   | The header must not end with `.`                                                  | 3.4           |
| `header-trim`            | `always`                       | No leading or trailing whitespace on the header                                   | 3.5           |
| `scope-case`             | `lower-case`                   | The scope must be lower-case                                                      | 6.4           |
| `body-case`              | `sentence-case`                | The body must be sentence-case                                                    | 8.4           |
| `body-max-line-length`   | `80`                           | Each body line is at most 80 characters                                           | 8.3           |
| `footer-leading-blank`   | `always`                       | A footer must be preceded by a blank line                                         | 9.1           |
| `footer-max-line-length` | `80`                           | Each footer line is at most 80 characters                                         | 9.2           |
| `gitsym-header-spacing`  | `always`                       | Custom rule, see [below](#the-gitsym-header-spacing-rule)                         | 3.2           |
| `gitsym-scope-format`    | `always`                       | Custom rule, see [below](#the-gitsym-scope-format-rule)                           | 6.3           |
| `gitsym-scope-max-count` | `always`, `3`                  | Custom rule, see [below](#the-gitsym-scope-max-count-rule)                        | 6.7           |
| `gitsym-breaking-body`   | `always`                       | Custom rule, see [below](#the-gitsym-breaking-body-rule)                          | 5.4           |

Notes on what these rules do and do not cover:

- With this parser preset, a trailer such as `Assisted-by: x:y` is parsed as part of the body, not as a commitlint
  footer. In practice the 80-character limit on trailer lines is enforced by `body-max-line-length` (checked: an
  over-long `Assisted-by:` line fails with `body-max-line-length`). `footer-leading-blank` and `footer-max-line-length`
  apply to commitlint footers (for example issue references) and did not trigger on trailers in the checks I ran.
- Not enforced by any rule: imperative mood (spec 7.4) and the `Assisted-by` / `Signed-off-by` conventions
  (spec 9.3-9.7).
- An empty commit message is not rejected (commitlint skips empty input).
- `type-enum` is kept in sync with [`data/symbols.json`](../../data/symbols.json) by a test.

## Examples

Valid:

```text
+[api]: Add pagination to the list endpoint
+: Add a thing
~[api,auth]: Tune token renewal window
~!: Drop v1

The v1 API is no longer maintained.

BREAKING CHANGE: Clients must migrate to v2.
```

Invalid (each result was produced by running the lint):

| Message                                                                   | Rejected by                                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `!![api]: Fix loop`                                                       | `type-enum` (fix cannot be breaking)                                                       |
| `fix: Add a thing`                                                        | `type-enum`                                                                                |
| `#: Add a thing`                                                          | `type-enum`                                                                                |
| `+[]: Add a thing`                                                        | `type-enum` (empty brackets are not a scope, the type no longer parses)                    |
| `+[API]: Add a thing`                                                     | `scope-case`                                                                               |
| `+[api]: add a thing`                                                     | `subject-case`                                                                             |
| `+[api]: Add a thing.`                                                    | `header-full-stop` and `subject-full-stop`                                                 |
| `+[api]:Add a thing`                                                      | `gitsym-header-spacing`, plus `type-empty` and `subject-empty` (the header does not parse) |
| `+[api]:  Add a thing` (two spaces)                                       | `gitsym-header-spacing`                                                                    |
| `+[api, auth]: Add a thing`                                               | `gitsym-scope-format`                                                                      |
| `+[api,]: Add a thing`                                                    | `gitsym-scope-format`                                                                      |
| `+[a,b,c,d]: Add a thing`                                                 | `gitsym-scope-max-count`                                                                   |
| `+[api]: Add a thing` preceded by one space                               | `header-trim` (plus `type-empty`, `subject-empty`)                                         |
| `+[api]: Add` followed by a space and 100 `x`                             | `header-max-length` and `subject-max-length`                                               |
| `+[api]: Add a thing`, blank line, a body line of more than 80 characters | `body-max-line-length`                                                                     |
| `+[api]: Add a thing`, blank line, `lower case body`                      | `body-case`                                                                                |
| `+![api]: Drop v1`                                                        | `gitsym-breaking-body`                                                                     |

## Scopes

Scopes are specific to each repository (spec 6.6), so this config does not restrict them. Add your own `scope-enum`:

```js
module.exports = {
  extends: ["@axnic/commitlint-config-gitsym"],
  rules: {
    "scope-enum": [2, "always", ["api", "auth", "deps", "gh"]],
  },
};
```

Multiple scopes (`[api,auth]`) work with `scope-enum`: with `@commitlint/rules` 19.8.1, the rule splits the value on
commas and checks each part against the list. Checked with `["api", "auth"]`:

| Message                     | Result                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `+[api]: Add a thing`       | valid                                                                                            |
| `+[api,auth]: Add a thing`  | valid                                                                                            |
| `+[api, auth]: Add a thing` | valid for `scope-enum` (spaces are tolerated by the rule), but rejected by `gitsym-scope-format` |
| `+[api,web]: Add a thing`   | `scope-enum`                                                                                     |
| `+[api,auth,]: Add a thing` | `scope-enum` (empty entry), also `gitsym-scope-format`                                           |

This behavior comes from commitlint, not from this package. Only the installed 19.8.1 was tested: if you use another
commitlint version, check that `api,auth` passes before relying on it. If it does not, a level `1` (warning) for
`scope-enum` is the fallback.

## The `gitsym-header-spacing` rule

Enabled as `"gitsym-header-spacing": [2, "always"]` (spec 3.2). Behavior, from `index.js`: the header must match
`/^\S+?(?:\[[^\]]*\])?: \S/`, that is, a colon followed by exactly one space and then a non-whitespace character.

Error message:

```text
the header must have exactly one space after the colon
```

Passes: `+[api]: Add x`, `+: Add x`.

Fails (checked): `+[api]:  Add x` and `+:  Add x` (two spaces). `+[api]:Add x` (no space) also fails, together with
`type-empty` and `subject-empty` because the header no longer parses.

## The `gitsym-scope-format` rule

Enabled as `"gitsym-scope-format": [2, "always"]` (spec 6.3). Behavior, from `index.js`: if there is a scope, it is split
on `,` and every item must be non-empty and contain no whitespace. A commit without scope passes.

Error message:

```text
scopes must be comma-separated without spaces or empty items: [scope1,scope2]
```

Passes: `+[api,auth]: Add x`, `+: Add x`.

Fails (checked): `+[api, auth]: Add x` (space), `+[api,]: Add x`, `+[,api]: Add x` and `+[api,,auth]: Add x` (empty
item).

## The `gitsym-scope-max-count` rule

Enabled as `"gitsym-scope-max-count": [2, "always", 3]` (spec 6.7). Behavior, from `index.js`: if there is a scope, it is
split on `,` and the number of items must be at most the configured value (3). A commit without scope passes.

Error message (with the configured value):

```text
a commit must have at most 3 scopes
```

Passes: `+[api,auth,web]: Add x` (3 scopes).

Fails (checked): `+[a,b,c,d]: Add x` (4 scopes).

## The `gitsym-breaking-body` rule

Enabled as `"gitsym-breaking-body": [2, "always"]`. Behavior, from `index.js`:

1. If the parsed type is not `+!`, `~!` or `-!`, the commit passes. The rule never looks at other types.
2. Otherwise, the raw message must contain a line that starts with `BREAKING CHANGE:` followed by one space (uppercase, one colon, one
   space) followed by at least one non-whitespace character. The test is the regular expression
   `/^BREAKING CHANGE: \S/m` applied to the whole raw message.

Error message:

```text
breaking types (+!, ~!, -!) require a 'BREAKING CHANGE: <explanation>' paragraph in the message
```

Passes:

```text
-![api]: Remove v1 endpoints

Why.

BREAKING CHANGE: Clients must use v2.
```

```text
+![api,web]: Drop

BREAKING CHANGE: Use v2.
```

Fails (all checked):

| Message                                                                 | Why                               |
| ----------------------------------------------------------------------- | --------------------------------- |
| `+![api]: Drop v1`                                                      | no `BREAKING CHANGE:` line        |
| `+![api]: Drop v1`, blank line, `BREAKING CHANGE:`                      | no text after the colon           |
| `-![api]: Drop`, blank line, `BREAKING CHANGE:` followed by spaces only | no non-blank text after the colon |
| `+![api]: Drop`, blank line, `breaking change: Use v2.`                 | the match is case-sensitive       |

A `BREAKING CHANGE: Use v2.` paragraph on a non-breaking type such as `+[api]: Add a thing` is accepted: the rule only
checks the breaking types, it does not forbid the paragraph elsewhere.

## Development

From the repository root, with [mise](https://mise.jdx.dev/):

```sh
mise run test
```

This installs the npm dependencies if needed (`[deps.npm]` in `mise.toml`), then runs `npm test` in `packages/commitlint` (task `ci:test`, alias `test`). Equivalent
commands:

```sh
cd packages/commitlint
npm ci
npm test   # node --test
```

The tests (`index.test.js`, `node:test`) cover:

- **Sync with `data/symbols.json`**: the sorted `type-enum` list must equal the sorted list of symbols in
  [`data/symbols.json`](../../data/symbols.json).
- **Valid commits**: `+[api]: Add pagination`, `^[deps]: Bump cert-manager to v1.16.0`, `~[a,b]: Tune window`,
  `+: Add a thing`, and two breaking commits with a `BREAKING CHANGE:` paragraph.
- **Invalid commits**: `!![api]` (`type-enum`), `+[]` (any error), a lower-case subject (`subject-case`), a trailing
  period (`subject-full-stop`), and a breaking type with no paragraph or an empty one (`gitsym-breaking-body`).

The other rules in the table are standard commitlint rules and are not tested individually.
