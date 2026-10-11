// This repository follows its own format: the local package is the config under test.
const gitsym = require("./packages/commitlint");

module.exports = {
  ...gitsym,
  rules: {
    ...gitsym.rules,
    "scope-enum": [
      2,
      "always",
      [
        "spec",
        "why",
        "migration",
        "readme",
        "contributing",
        "data",
        "commitlint",
        "mise",
        "rtunk",
        "repo",
      ],
    ],
  },
};
