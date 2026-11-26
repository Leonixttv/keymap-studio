"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const {describeExtendedKeycode, compactKeyLabel, mediaKeycodes} = require("../keycode-labels");
const basic = code => ({4:"A", 42:"Backspace", 44:"Space"})[code] ?? null;

test("decode supported modifier and layer keycodes with protocol-specific ranges", () => {
  assert.equal(describeExtendedKeycode(0x0204, true, basic), "LShift(A)");
  assert.equal(describeExtendedKeycode(0x222a, true, basic), "LShift_T(Backspace)");
  assert.equal(describeExtendedKeycode(0x622a, false, basic), "LShift_T(Backspace)");
  assert.equal(describeExtendedKeycode(0x412c, true, basic), "LT(1, Space)");
  assert.equal(describeExtendedKeycode(0x5283, true, basic), "OSL(3)");
  assert.equal(describeExtendedKeycode(0x5403, false, basic), "OSL(3)");
  assert.equal(describeExtendedKeycode(0x5f10, false, basic), "Fn1 (Fn3)");
  assert.equal(describeExtendedKeycode(0x5f11, false, basic), "Fn2 (Fn3)");
  assert.equal(describeExtendedKeycode(0x7c77, true, basic), "Fn1 (Fn3)");
  assert.equal(describeExtendedKeycode(0x52b2, true, basic), "OSM(RShift)");
  assert.equal(describeExtendedKeycode(0xdead, true, basic), null);
  assert.equal(describeExtendedKeycode(0x22ff, true, basic), null);
});
test("use a compact label only on narrow backspace keys", () => {
  assert.equal(compactKeyLabel(42, "Backspace", 1), "Bksp");
  assert.equal(compactKeyLabel(42, "Backspace", 2), "Backspace");
  assert.equal(compactKeyLabel(44, "Space", 1), "Space");
});
test("show modern QMK RGB Matrix codes and distinguish transparent from disabled", () => {
  assert.equal(describeExtendedKeycode(0x7842, true, basic), "RGBM Toggle");
  assert.equal(describeExtendedKeycode(0x784b, true, basic), "RGBM Speed+");
  assert.equal(describeExtendedKeycode(0x7842, false, basic), null);
  assert.equal(compactKeyLabel(1, "Transparent", 1), "▽");
  assert.equal(compactKeyLabel(0, "Disabled", 1), "Disabled");
});
test("recognise the media and brightness codes from the MK75 layer", () => {
  const labels = new Map(mediaKeycodes);
  assert.equal(labels.get(0xbe), "Brightness −");
  assert.equal(labels.get(0xbd), "Brightness +");
  assert.equal(labels.get(0xb1), "Mail");
  assert.equal(labels.get(0xb4), "Browser Search");
  assert.equal(labels.get(0xb2), "Calculator");
  assert.equal(labels.get(0xaf), "Media Player");
});
