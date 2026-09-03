import { expect, test } from "@playwright/test";

import { normalizeYoothemeBackgroundPosition } from "@/lib/uikitTokens";

test("normalizes every YOOtheme background position to valid CSS", () => {
  expect([
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center-center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ].map(normalizeYoothemeBackgroundPosition)).toEqual([
    "left top",
    "center top",
    "right top",
    "left center",
    "center center",
    "right center",
    "left bottom",
    "center bottom",
    "right bottom",
  ]);
});

test("keeps existing valid CSS positions compatible", () => {
  expect(normalizeYoothemeBackgroundPosition("25% 75%"))
    .toBe("25% 75%");
  expect(normalizeYoothemeBackgroundPosition(undefined)).toBeUndefined();
});
