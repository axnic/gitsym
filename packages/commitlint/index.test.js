const test = require("node:test");
const assert = require("node:assert");
const lint = require("@commitlint/lint").default;
const config = require("./index.js");
const symbols = require("../../data/symbols.json").symbols;

const check = (msg) =>
  lint(msg, config.rules, {
    parserOpts: config.parserPreset.parserOpts,
    plugins: { gitsym: config.plugins[0] },
  });
const errors = async (msg) => (await check(msg)).errors.map((e) => e.name);

test("type enum matches data/symbols.json", () => {
  assert.deepStrictEqual(
    config.rules["type-enum"][2].sort(),
    symbols.map((s) => s.symbol).sort(),
  );
});

test("valid commits", async () => {
  for (const m of [
    "+[api]: Add pagination",
    "^[deps]: Bump cert-manager to v1.16.0",
    "~[a,b]: Tune window",
    "+: Add a thing",
    "-!: Drop v1\n\nBREAKING CHANGE: Use v2.",
    "-![api]: Remove v1 endpoints\n\nWhy.\n\nBREAKING CHANGE: Clients must use v2.",
  ]) {
    assert.deepStrictEqual(await errors(m), [], m);
  }
});

test("invalid commits", async () => {
  assert.ok((await errors("!![api]: Fix loop")).includes("type-enum"));
  assert.ok((await errors("+[]: Add a thing")).length > 0);
  assert.ok((await errors("+[gh]: add a thing")).includes("subject-case"));
  assert.ok(
    (await errors("+[gh]: Add a thing.")).includes("subject-full-stop"),
  );
  assert.ok(
    (await errors("+[api]:  Add a thing")).includes("gitsym-header-spacing"),
  );
  assert.ok((await errors("+: Add a thing")).length === 0);
  assert.ok(
    (await errors("+[a, b]: Add a thing")).includes("gitsym-scope-format"),
  );
  assert.ok(
    (await errors("+[a,,b]: Add a thing")).includes("gitsym-scope-format"),
  );
  assert.ok(
    (await errors("+[a,b,c,d]: Add a thing")).includes(
      "gitsym-scope-max-count",
    ),
  );
  assert.deepStrictEqual(await errors("+[a,b,c]: Add a thing"), []);
  assert.ok(
    (await errors("+![api]: Drop v1")).includes("gitsym-breaking-body"),
  );
  assert.ok(
    (await errors("+![api]: Drop v1\n\nBREAKING CHANGE:")).includes(
      "gitsym-breaking-body",
    ),
  );
});
