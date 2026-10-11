# gitsym specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT
RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in
[BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119),
[RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) when, and only when, they appear in all capitals, as shown here.

[[__TOC__]]

## 1. Summary

A gitsym commit message is structured as follows:

```text
type[scope[,scope2]]: Subject

Body

Trailers
```

The type is a single ASCII symbol, the scope is optional and, when present, enclosed in square brackets, and the
subject is a sentence-case description of the change. Without a scope, the header is `type: Subject`.

## 2. Message layout

1. A commit message MUST consist of a header, optionally followed by a body and trailers.
2. The body, if present, MUST be separated from the header by one blank line.
3. Trailers, if present, MUST be separated from the preceding content by one blank line.

## 3. Header

1. The header is the first line of the commit message. It MUST consist of a type, an optional scope and a subject, in that order.
2. When a scope is present, it MUST be followed immediately by the sequence `]:` and then exactly one space before the
   subject. When there is no scope, the type MUST be followed immediately by `:` and then exactly one space before the
   subject.
3. The header MUST be at most 100 characters long.
4. The header MUST NOT end with a period.
5. The header MUST NOT have leading or trailing whitespace.
6. The symbol `#` MUST NOT be used as a type: git treats lines starting with `#` as comments.

## 4. Types

1. The type MUST be one of the 15 values in the table below. No other value is valid.
2. Types are case-sensitive and consist only of ASCII characters.
3. Authors MUST choose the type that describes the change. The "Not for" column gives the usual confusions.

| Type | Name               | Meaning                                               | Use when                                                           | Not for                                                                                    | May be breaking |
| ---- | ------------------ | ----------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------- |
| `+`  | Add                | New feature, service, resource, initial deploy        | Something that did not exist is introduced                         | Changing something that exists (`~`); dependency upgrades (`^`)                            | Yes (`+!`)      |
| `-`  | Remove             | Delete service, file, dead code                       | Something is deleted without replacement                           | Renaming or relocating (`>`); undoing a commit (`<`)                                       | Yes (`-!`)      |
| `~`  | Improve            | Perf, config update, behavioral improvement (non-bug) | Correct behavior is changed, tuned or made faster                  | Repairing broken behavior (`!`); dependency bumps (`^`)                                    | Yes (`~!`)      |
| `!`  | Fix                | Repair a bug or broken behavior                       | Behavior was broken and now works as intended                      | Changing correct behavior (`~`); security fixes (`$`)                                      | No              |
| `=`  | Refactor           | No behavior change (style, tests, DX, CI)             | Behavior is identical from the outside                             | Anything observable by users or dependent systems (`~`)                                    | No              |
| `^`  | Bump               | Dependency version upgrade or downgrade               | A dependency version changes, even manually                        | Configuration changes that affect behavior (`~`); bumps that force breaking changes (`~!`) | No              |
| `>`  | Move               | Rename or relocate resources                          | Files, paths or resources change location without other changes    | Changes to the content of the moved resource                                               | No              |
| `<`  | Revert             | Undo a previous commit                                | A previous commit is reverted                                      | Removing something that was never committed before (`-`)                                   | No              |
| `@`  | Docs               | Documentation, README, procedures, comments           | Only documentation or comments change                              | Code changes that happen to include documentation                                          | No              |
| `$`  | Security           | Fix, policy, secret management                        | The change addresses security: a vulnerability, a policy, a secret | Ordinary bug fixes (`!`)                                                                   | No              |
| `?`  | Experiment         | POC, investigation, research                          | The change is exploratory and may be discarded                     | Work intended to be kept as is                                                             | No              |
| `*`  | Wildcard           | Does not fit any other type                           | No other type describes the change                                 | Anything another type describes; it is not a default choice                                | No              |
| `+!` | Add (breaking)     | Addition that breaks backward compatibility           | An addition requires consumers to change                           | Additions that are backward compatible (`+`)                                               | Is breaking     |
| `~!` | Improve (breaking) | Behavioral change that breaks backward compatibility  | A behavioral change requires consumers to change                   | Backward-compatible changes (`~`); bug fixes                                               | Is breaking     |
| `-!` | Remove (breaking)  | Removal that breaks backward compatibility            | A removal requires consumers to change                             | Removals nothing depends on (`-`)                                                          | Is breaking     |

The same data, with Conventional Commits and Gitmoji equivalents and a suggested semver impact, is available in
[`data/symbols.json`](../data/symbols.json).

4. If a change repaired a broken behavior, the type MUST be `!`. If it changed correct behavior, the type SHOULD be `~`.
5. If the change is observable by users or dependent systems, the type SHOULD be `~`. If the behavior is identical from
   the outside, the type SHOULD be `=`.
6. Dependency version changes SHOULD use `^`, even when done manually. Configuration changes that affect behavior
   SHOULD use `~`.
7. There is no `ci`, `build` or documentation-in-CI type. Authors SHOULD use the type that describes the change (`+` for
   a new pipeline, `~` for a modified one, `=` for a refactored one) and SHOULD put the relevant area in the scope.

## 5. Breaking changes

1. Only `+`, `~` and `-` have a breaking variant: `+!`, `~!` and `-!`. The `!` MUST be appended directly after the type,
   before `[`.
2. Any other combination (`!!`, `=!`, `@!`, `?!`, `*!`, `^!`, `>!`, `$!`, `<!`) is invalid.
3. A change that breaks backward compatibility MUST use one of the three breaking types. A fix, docs change, refactor,
   experiment, security change, bump, move or revert that breaks something is a structural change in fact, and MUST be
   committed under `+!`, `~!` or `-!`.
4. A commit using a breaking type MUST contain a `BREAKING CHANGE: <explanation>` paragraph in its body. The
   explanation MUST NOT be empty.
5. The `BREAKING CHANGE:` paragraph SHOULD state what breaks and how to migrate.
6. The `!` in a breaking type is a scanning aid in `git log`; the paragraph carries the explanation.
7. `^` can never be breaking (see rule 2). A dependency version change that forces breaking modifications (changes to
   the consuming code, configuration or architecture to keep working) is not a bump: it requires an architectural
   change and MUST be typed `~!`.

## 6. Scope

1. The scope is OPTIONAL and MAY be omitted. A repository that defines scopes, or a change that targets an identifiable
   area, SHOULD use one.
2. When present, the scope MUST be enclosed in square brackets.
3. Multiple scopes MUST be separated by commas, without spaces: `[scope1,scope2]`.
4. Scopes MUST be lower-case.
5. A scope MAY contain characters such as `:` or `.` (for example `[project:name]`); brackets keep it unambiguous.
6. The set of valid scopes is defined per repository. This specification does not define any scope. A repository
   SHOULD publish its list of scopes.
7. Several scopes SHOULD be used only when one logical change atomically touches several components. A commit SHOULD
   NOT have more than 3 scopes.

## 7. Subject

1. The subject MUST NOT be empty.
2. The subject MUST be in sentence case: it MUST start with an uppercase letter.
3. The subject MUST NOT end with a period.
4. The subject SHOULD be in the imperative mood and SHOULD describe the change concisely.
5. The whole header, subject included, MUST respect the 100-character limit of section 3.

## 8. Body

1. A body is OPTIONAL for trivial changes and SHOULD be present for everything else.
2. The body SHOULD explain WHY the change is made, not WHAT changed: the diff already shows that.
3. Body lines MUST be at most 80 characters long.
4. Sentences in the body MUST start with an uppercase letter.
5. The body SHOULD NOT contain lines starting with `#`, which git treats as comments.
6. A body MAY contain several paragraphs, separated by blank lines.

## 9. Trailers

1. Trailers MUST be placed in the footer, after a blank line.
2. Each trailer line MUST be at most 80 characters long.
3. A commit created with the help of an AI assistant SHOULD include an `Assisted-by` trailer:

   ```text
   Assisted-by: <provider>:<model-id> [TOOL...]
   ```

4. `<provider>:<model-id>` identifies the assistant and the model. The model SHOULD be the public model name, with dots
   (`claude-sonnet-4.6`, not `claude-sonnet-4-6`).
5. `[TOOL...]` is an optional, space-separated list of specialized analysis tools used (for example `coccinelle` or
   `sparse`). Basic development tools (git, compilers, build tools, editors) SHOULD NOT be listed.
6. The commit SHOULD be signed (for example with `git commit -S`) by the human committer.
7. `Signed-off-by` (`git commit -s`) MUST be added by a human only. Automated agents MUST NOT add it.

This follows the Linux kernel guidelines for
[AI coding assistants](https://docs.kernel.org/process/coding-assistants.html), which define
`Assisted-by: LLM [TOOL1] [TOOL2]`, with the same rules for the optional tools and the same rule that an assistant does
not add `Signed-off-by`. Differences: gitsym asks that the first element be `<provider>:<model-id>` rather than a free
`LLM` name, and recommends dotted public model names.

## 10. Grammar

The format is described below in ABNF ([RFC 5234](https://www.rfc-editor.org/rfc/rfc5234)).

```abnf
message       = header [ LF blank-line body ] [ LF blank-line trailers ]
header        = type [ "[" scope *( "," scope ) "]" ] ":" SP subject
type          = base-type / breaking-type
base-type     = "+" / "-" / "~" / "!" / "=" / "^" / ">" / "<" / "@" / "$" / "?" / "*"
breaking-type = "+!" / "~!" / "-!"
scope         = 1*scope-char
scope-char    = %x21-2B / %x2D-40 / %x5C / %x5E-7E   ; printable ASCII except ",", "[", "]" and A-Z
subject       = upper 0*( VCHAR / SP )
upper         = %x41-5A
body          = body-line *( LF body-line )
body-line     = *( VCHAR / SP )
blank-line    = LF
trailers      = trailer *( LF trailer )
trailer       = token ":" SP *( VCHAR / SP )
token         = 1*( ALPHA / DIGIT / "-" )
```

Constraints that the grammar does not express: header at most 100 characters and not ending with a period (section 3),
body and trailer lines at most 80 characters (sections 8 and 9), breaking types requiring a `BREAKING CHANGE:` paragraph
(section 5).

## 11. Examples

Valid:

```text
+[api]: Add pagination to the list endpoint
+: Add a thing
^[deps]: Bump cert-manager to v1.16.0
~[api,auth]: Tune token renewal window
-![api,web]: Remove the legacy v1 endpoints
```

A breaking type without a scope is valid, and still needs the `BREAKING CHANGE:` paragraph:

```text
~!: Drop v1

The v1 API is no longer maintained.

BREAKING CHANGE: Clients must migrate to v2.
```

A breaking change with its body:

```text
~![auth]: Drop the legacy login in favor of native OIDC

The legacy login added operational overhead with its LDAP dependency.
OIDC covers the same use cases natively.

BREAKING CHANGE: All services relying on the legacy login endpoints must
update their client_id and redirect URIs before this commit is deployed.
```

A dependency change that forces breaking modifications is not a bump:

```text
~![deps]: Migrate to cert-manager v2 API

The v2 API removes the v1 Certificate resources.

BREAKING CHANGE: All Certificate manifests must be migrated to the v2 API
before this commit is deployed.
```

Invalid:

```text
!![auth]: Fix OIDC redirect loop        # fix cannot be breaking
+[gh]: add a thing                      # subject not sentence-case
+[gh]: Add a thing.                     # trailing period
-![api]: Remove the v1 endpoints        # breaking type without BREAKING CHANGE: paragraph
```

## 12. Mapping to semantic versioning

This specification does not require semantic versioning. For projects that want to generate changelogs or versions from
commits, [`data/symbols.json`](../data/symbols.json) carries a suggested `semver` field:

1. `+!`, `~!` and `-!` correspond to a MAJOR release.
2. `+` corresponds to a MINOR release.
3. Most other types correspond to a PATCH release or to no release.

This mapping is a proposal and is not part of the format.

## 13. Tooling

A ready-made linting configuration for these rules is available in
[`packages/commitlint`](../packages/commitlint/README.md).
