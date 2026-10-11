// commitlint configuration for gitsym. Scopes are repository-specific: add your own `scope-enum`.

const baseTypes = ["+", "-", "~", "!", "=", "^", ">", "<", "@", "$", "?", "*"];
const breakingTypes = ["+!", "~!", "-!"];

const plugin = {
  rules: {
    // Exactly one space between the colon and the subject.
    "gitsym-header-spacing": (parsed) => [
      /^\S+?(?:\[[^\]]*\])?: \S/.test(parsed.header ?? ""),
      "the header must have exactly one space after the colon",
    ],
    // Scopes are comma-separated, without spaces or empty items.
    "gitsym-scope-format": (parsed) => [
      !parsed.scope ||
        parsed.scope.split(",").every((s) => s !== "" && !/\s/.test(s)),
      "scopes must be comma-separated without spaces or empty items: [scope1,scope2]",
    ],
    // At most `value` scopes per commit.
    "gitsym-scope-max-count": (parsed, _when, value) => [
      !parsed.scope || parsed.scope.split(",").length <= value,
      `a commit must have at most ${value} scopes`,
    ],
    // A breaking type must be explained by a `BREAKING CHANGE:` paragraph in the body.
    "gitsym-breaking-body": (parsed) => {
      if (!breakingTypes.includes(parsed.type)) return [true];
      const ok = /^BREAKING CHANGE: \S/m.test(parsed.raw ?? "");
      return [
        ok,
        "breaking types (+!, ~!, -!) require a 'BREAKING CHANGE: <explanation>' paragraph in the message",
      ];
    },
  },
};

module.exports = {
  plugins: [plugin],
  rules: {
    "gitsym-breaking-body": [2, "always"],
    "gitsym-header-spacing": [2, "always"],
    "gitsym-scope-format": [2, "always"],
    "gitsym-scope-max-count": [2, "always", 3],
    "body-max-line-length": [2, "always", 80],
    "body-case": [2, "always", "sentence-case"],
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 80],
    "header-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "header-trim": [2, "always"],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "sentence-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 100],
    "type-empty": [2, "never"],
    "type-enum": [2, "always", [...baseTypes, ...breakingTypes]],
  },
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(?<type>\S+?)(?:\[(?<scope>[^\]]+)\])?:\s(?<subject>.+)$/,
      breakingHeaderPattern:
        /^(?<type>[+~-]!)(?:\[(?<scope>[^\]]+)\])?:\s(?<subject>.+)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
};
