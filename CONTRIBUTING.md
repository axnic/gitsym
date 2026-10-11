# Contributing

Contributions are welcome in these areas:

- Fixes to the documentation (`README.md`, `docs/`).
- Fixes to `data/symbols.json`, the vocabulary file.
- Fixes and improvements to the commitlint package (`packages/commitlint`).
- New types, only with a strong case (see below).

The vocabulary is deliberately small (about 12 types) so that it fits in working memory. The bar for a new type is
high: adding one makes every other type a little harder to remember.

## Proposing a change to the vocabulary

Open an issue that covers all four points:

- [ ] **Symbol.** A single ASCII character typeable without modifier keys. It must not be `#`: git treats lines
      starting with `#` as comments in commit messages.
- [ ] **Evidence.** Real commits that do not fit any existing type. `*` (wildcard) already exists, so occasional
      misfits are not enough: show a recurring pattern.
- [ ] **Alternative.** Which existing type you would otherwise use, and why it loses signal.
- [ ] **Trade-off.** Which type, if any, could be merged or dropped to keep the total near 12.

## Development setup

Requires [mise](https://mise.jdx.dev/).

```sh
mise trust        # trust mise.toml, if prompted
mise install      # install the pinned tools (node, rtunk)
```

The npm dependencies of the commitlint package are installed automatically the first time you run a task (or
manually with `mise deps`).

| Task                      | What it does                                                             |
| ------------------------- | ------------------------------------------------------------------------ |
| `mise run ci`             | Local gate: `ci:build`, then `ci:test`                                   |
| `mise run ci:build`       | Checks that `data/symbols.json` is valid JSON and that the package packs |
| `mise run ci:test`        | Runs the commitlint package tests (alias: `mise run test`)               |
| `mise run ci:commitlint`  | Validates existing commit messages; a range is required (see below)      |
| `mise run security:audit` | Audits the npm dependencies (fails on high or critical advisories)       |

`ci:commitlint` needs a range, otherwise commitlint waits on stdin:

```sh
mise run ci:commitlint -- --from <sha> --to <sha>
mise run ci:commitlint -- --last
```

## What to update together

`data/symbols.json` is the source of truth for the vocabulary. Keep the files below consistent with it.

| If you change                     | Also update                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/symbols.json`               | The types table in `README.md`                                                                                                                          |
|                                   | The types table in `docs/specification.md` (section 4)                                                                                                  |
|                                   | `docs/migration.md`                                                                                                                                     |
|                                   | The type list in `packages/commitlint/index.js` (checked by `mise run test`)                                                                            |
| A rule in `docs/specification.md` | The matching rule in `packages/commitlint/index.js`, its entry in `packages/commitlint/README.md`, and the tests in `packages/commitlint/index.test.js` |

## Commit messages

This repository uses gitsym itself. `.commitlintrc.js` extends `packages/commitlint` and restricts scopes, and the
rtunk `commitlint` action checks the message when you commit. See the
[specification](docs/specification.md) for the full format.

Allowed scopes: `spec`, `why`, `migration`, `readme`, `contributing`, `data`, `commitlint`, `mise`, `rtunk`, `repo`.

Valid examples:

```text
@[contributing]: Restructure the contributing guide
=[commitlint]: Simplify the scope parsing
^[mise]: Bump the node tool to the latest LTS
```

Invalid (`fix` is not a gitsym type, and `deps` is not an allowed scope):

```text
fix[commitlint]: Repair scope parsing
^[deps]: Bump node
```

If an AI assistant helped with a commit, add an `Assisted-by` trailer (see
[Trailers](docs/specification.md#9-trailers)). `Signed-off-by` must be added by a human only: automated agents must not
add it.

## Pull requests

- Run `mise run ci` before opening the pull request.
- Keep changes focused: one logical change per pull request.
- Update the documentation and the tests in the same change.
