# gitsym

A commit message format where the type is a single ASCII symbol.

gitsym is a hybrid of [Conventional Commits](https://www.conventionalcommits.org/) and [Gitmoji](https://gitmoji.dev/).
It keeps what Conventional Commits does well (a small, defined vocabulary, a scope, a machine-parsable header) and what
Gitmoji does well (one character per type, so subjects line up in `git log`), without the 48-code lexicon or the
`:emoji_code:` text that never renders in a terminal. Twelve types, one character each, an optional scope, and three
inline breaking-change variants.

```text
type[scope[,scope2]]: Subject starting with uppercase
```

```text
+[api]: Add pagination to the list endpoint
```

## Types

| Symbol | Name               | Meaning                                                                           | Conventional equivalent                                |
| ------ | ------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `+`    | Add                | New feature, service, resource, initial deploy                                    | `feat`                                                 |
| `-`    | Remove             | Delete service, file, dead code                                                   | `chore` (removal)                                      |
| `~`    | Improve            | Perf, config update, behavioral improvement (non-bug)                             | `perf`, `feat`                                         |
| `!`    | Fix                | Repair a bug or broken behavior                                                   | `fix`                                                  |
| `=`    | Refactor           | No behavior change (style, tests, DX, CI)                                         | `refactor`, `style`, `test`, `ci`, `build`             |
| `^`    | Bump               | Dependency version upgrade or downgrade (if it forces breaking changes, use `~!`) | `build(deps)`, `chore(deps)`                           |
| `>`    | Move               | Rename or relocate resources                                                      | `refactor`                                             |
| `<`    | Revert             | Undo a previous commit                                                            | `revert`                                               |
| `@`    | Docs               | Documentation, README, procedures, comments                                       | `docs`                                                 |
| `$`    | Security           | Fix, policy, secret management                                                    | `fix` (security)                                       |
| `?`    | Experiment         | POC, investigation, research                                                      | none (closest: `chore`)                                |
| `*`    | Wildcard           | Does not fit any other type                                                       | `chore`                                                |
| `+!`   | Add (breaking)     | Addition that breaks backward compatibility                                       | `feat!`                                                |
| `~!`   | Improve (breaking) | Behavioral change that breaks backward compatibility                              | `perf!`, `feat!`, `fix!`, `refactor!`, `build!`, `ci!` |
| `-!`   | Remove (breaking)  | Removal that breaks backward compatibility                                        | `chore!`, `feat!`                                      |

Only add, improve and remove can be breaking. The equivalents are rough: they are a migration aid, not a strict
mapping (the Gitmoji ones are in the [migration guide](docs/migration.md)). The same data, plus a suggested semver
impact, lives in [`data/symbols.json`](data/symbols.json).

## Format

```text
type[!][scope[,scope2]]: Subject starting with uppercase

Body explaining WHY, max 80 chars/line.
For breaking changes, the body MUST include a BREAKING CHANGE: paragraph.

Assisted-by: <provider>:<model-id> [TOOL...]
```

- The type is one symbol from the table above; `!` is appended (before `[`) only for the three breaking variants.
- The scope is optional. When present, it is in square brackets, comma-separated without spaces. Scopes are defined per repository.
- The subject is imperative, starts with an uppercase letter, has no trailing period, and the header is at most 100
  characters.

The full rules are in the [specification](docs/specification.md).

## Examples

The scopes below (`api`, `deps`, `gh`, ...) are illustrative: scopes are defined per repository.

```text
+[api]: Add pagination to the list endpoint
^[deps]: Bump axios to v1.7.0
![auth]: Handle expired refresh tokens
>[api]: Move the users routes under /v2
-[api]: Remove the unused legacy export endpoint
@[gh]: Document the release procedure
$[auth]: Redact tokens from request logs
~![api,auth]: Require an API key on every endpoint
```

## Linting

A ready-made [commitlint](https://commitlint.js.org/) configuration lives in
[`packages/commitlint`](packages/commitlint/README.md).

## Documentation

- [Why gitsym](docs/why.md): the rationale and design principles
- [Specification](docs/specification.md): header grammar, scope, subject, body and breaking-change rules
- [Migration](docs/migration.md): from Gitmoji codes and Conventional Commits types
- [Commitlint config](packages/commitlint/README.md): ready-made linting for the format
- [Contributing](CONTRIBUTING.md): how to propose a change to the vocabulary
- [`data/symbols.json`](data/symbols.json): machine-readable vocabulary
