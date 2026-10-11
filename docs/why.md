# Why gitsym

gitsym exists because neither Conventional Commits nor Gitmoji fully fit a repository where commits are read mostly in
a terminal and the history is treated as a record. Each has real strengths; each has a cost that gitsym tries to remove
without losing the strengths.

This page adapts the reasoning of
[ADR-010](https://github.com/chezmoidotsh/arcane/blob/main/docs/decisions/010-replace-gitmoji-with-symbol-commit-types.md)
in the arcane repository, where the format was first adopted.

## Conventional Commits

```text
feat(auth): Add OIDC login
```

| Pros                                     | Cons                             |
| ---------------------------------------- | -------------------------------- |
| Defined verbs (`feat`, `fix`, `docs`...) | Too verbose                      |
| Clear                                    | No visual alignment in `git log` |
| Machine-parsable                         |                                  |
| Scopable                                 |                                  |

The verbs are unambiguous and the format is well supported by tooling. But the type is a word of variable length, so
subjects start at a different column on every line, and the prefix takes real room on a line. Also
`chore` tends to become a catch-all, and that CI is a scope concern rather than a type concern.

## Gitmoji

```text
:sparkles: Add OIDC login
```

| Pros                     | Cons                                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| Symbol-based and compact | Too many symbols: 48 types, only 18 ever used, 12 used more than 5 times |
|                          | Emoji rendering depends on the terminal; the `:code:` form is verbose    |

The vocabulary is the first problem. In the repository where the format was first adopted, the Gitmoji configuration allowed 48 types, yet the full
history only ever used 18, and only 12 more than five times. The other 30 added a decision step every time a type had
to be chosen, without adding signal.

Rendering is the second. The benefit of an emoji only exists when it is rendered. In a terminal `git log`, in CI output,
in an email patch or in a plain-text diff, the commit shows the literal `:code:`. That form is verbose: `:arrow_up:`
is 10 characters, `^` is 1. The text form is longer than the word it replaces (`feat`) and says no more.

## What gitsym keeps from each

| From Conventional Commits | From Gitmoji                       |
| ------------------------- | ---------------------------------- |
| A few well-defined verbs  | One character per type             |
| A scope                   | Compact, scannable `git log` lines |
| A machine-parsable header |                                    |

```text
+[api]: Add pagination to the list endpoint
^[deps]: Bump axios to v1.7.0
![auth]: Handle expired refresh tokens
```

The type is one ASCII symbol, the scope is optional and bracketed when present, and the header is matched by a single regular
expression (see the [specification](specification.md)).

## Design principles

1. **A vocabulary that fits in working memory.** About 12 types. In that repository, 12 types cover 95 % of
   commits, and the table is learned in about a week with no lookup needed. A wildcard (`*`) absorbs the rest instead of
   growing the list.
2. **ASCII, typeable without modifiers or an input method.** One keystroke per type, on a standard keyboard, with no
   IME and no emoji picker. `#` is excluded because git treats lines starting with `#` as comments.
3. **Unambiguous at the start of a line.** The symbol is always followed by `[` or `:`, so a type can never be mistaken
   for the start of a subject, and a scope that contains colons (`project:billing`) is still unambiguous.
4. **Fixed width, so subjects align.** Every type is one character (two for the three breaking variants), so in
   `git log --oneline` the subjects start at nearly the same column on every line.
5. **Breaking changes are visible in the header.** `!` after the type is parseable without reading the body, and is
   limited to add, improve and remove, where a break is meaningful.

## Square brackets for scope

The scope is optional: small repositories or changes without an identifiable area can omit it. When present, brackets
are the natural notation for a list in most programming languages, so a multi-scope commit
(`[scope1,scope2]`) reads as a list rather than as a hack on a single-value field. They also stand out from the
surrounding text in a log line more than parentheses do.

## Trade-offs

gitsym is not free:

- Symbols have to be learned. The meaning of `~` or `=` is not self-evident to someone who has not seen the
  [Types table](specification.md#4-types).
- It is not compatible with Conventional Commits tooling out of the box. gitsym ships a ready-made commitlint
  configuration: see [`packages/commitlint`](../packages/commitlint/README.md).
- The `!` symbol is spent on "fix" and `!` as a suffix means "breaking": the two uses are distinguished only by position.
  A breaking change needs a body explanation anyway.
